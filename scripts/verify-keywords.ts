/** Verify keyword candidates against Google Autocomplete (public suggest endpoint).
 *  Produces scripts/keyword-map.json with per-tool:
 *   - primary keyword + evidence (verified / inferred)
 *   - long-tail candidates + evidence
 *   - harvested autocomplete suggestions (real query patterns users see)
 *  NO search volumes are produced or implied. Autocomplete presence = query-pattern
 *  evidence only, NOT volume. Run: bun scripts/verify-keywords.ts  (resumable via cache)
 */
import { KW_CANDIDATES } from "./kw-candidates";
import fs from "fs";

const INV = JSON.parse(fs.readFileSync("/home/z/my-project/scripts/seo-inventory.json", "utf8"));
const CACHE_FILE = "/home/z/my-project/scripts/kw-cache.json";
const cache: Record<string, string[]> = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) : {};

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function suggest(q: string, attempt = 0): Promise<string[]> {
  const key = q.toLowerCase();
  if (cache[key]) return cache[key];
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(q)}`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data?.[1]) ? (data[1] as string[]) : [];
    cache[key] = list;
    return list;
  } catch (e) {
    if (attempt < 2) {
      await sleep(1500);
      return suggest(q, attempt + 1);
    }
    console.error(`FAIL: "${q}" ${(e as Error).message}`);
    return [];
  }
}

function evidenceOf(kw: string, pools: string[][]): "verified" | "inferred" {
  const k = kw.toLowerCase();
  for (const pool of pools)
    for (const s of pool) {
      const sl = s.toLowerCase();
      if (sl === k || sl.startsWith(k) || k.includes(sl) || sl.includes(k)) return "verified";
    }
  return "inferred";
}

(async () => {
  const out: any[] = [];
  const tools = INV.tools;
  let done = 0;
  for (const t of tools) {
    const pk = t.seo?.primaryKeyword ?? t.keywords[0] ?? t.name.toLowerCase();
    const lts = KW_CANDIDATES[t.slug] ?? [];
    // Seed A = primary keyword; Seed B = first long-tail (most representative pattern)
    const seedA = await suggest(pk);
    await sleep(320 + Math.floor(Math.random() * 140));
    const seedB = lts.length ? await suggest(lts[0]) : [];
    if (lts.length) {
      await sleep(320 + Math.floor(Math.random() * 140));
    }
    const pools = [seedA, seedB];
    const pkEvidence = evidenceOf(pk, pools);
    const ltsVerified = lts.map((kw) => ({ kw, evidence: evidenceOf(kw, pools) }));
    // Harvest real suggestions relevant to the tool (contain a word from the primary keyword)
    const coreWords = pk.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const harvested = [...new Set([...seedA, ...seedB])]
      .filter((s) => {
        const sl = s.toLowerCase();
        return coreWords.some((w) => sl.includes(w));
      })
      .filter((s) => s.toLowerCase() !== pk.toLowerCase())
      .slice(0, 8);
    out.push({
      slug: t.slug,
      url: t.url,
      name: t.name,
      category: t.category,
      categorySlug: t.categorySlug,
      onpageTitle: t.seo?.title ?? null,
      metaDescription: t.seo?.description ?? null,
      primaryKeyword: pk,
      primaryEvidence: pkEvidence,
      longTails: ltsVerified,
      harvestedSuggestions: harvested,
      seedVerified: seedA.length > 0 || seedB.length > 0,
    });
    done++;
    if (done % 20 === 0) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
      console.error(`progress: ${done}/${tools.length}`);
    }
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
  fs.writeFileSync("/home/z/my-project/scripts/keyword-map.json", JSON.stringify(out, null, 1));
  const v = out.filter((o) => o.primaryEvidence === "verified").length;
  const lv = out.reduce((a, o) => a + o.longTails.filter((l: any) => l.evidence === "verified").length, 0);
  const totalLt = out.reduce((a, o) => a + o.longTails.length, 0);
  const seedsOk = out.filter((o) => o.seedVerified).length;
  console.error(`DONE tools=${out.length} primaries_verified=${v}/${out.length} longtails_verified=${lv}/${totalLt} seeds_responded=${seedsOk}/${out.length}`);
})();
