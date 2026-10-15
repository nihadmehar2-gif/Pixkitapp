/** Validate SEO content: coverage, lengths, uniqueness, guide word counts. Run: bun scripts/validate-seo.ts */
import { TOOLS } from "../src/lib/tools";
import { SEO_BY_SLUG } from "../src/lib/tools/seo";

let errors = 0;
const warnings: string[] = [];

// 1. Coverage
const missing = TOOLS.filter((t) => !SEO_BY_SLUG[t.slug]);
if (missing.length) {
  errors++;
  console.error(`ERROR: ${missing.length} tools missing SEO:`, missing.map((t) => t.slug).join(", "));
}

// 2. Extra/orphan entries (SEO keys without a tool)
const slugs = new Set(TOOLS.map((t) => t.slug));
const orphans = Object.keys(SEO_BY_SLUG).filter((s) => !slugs.has(s));
if (orphans.length) {
  warnings.push(`Orphan SEO entries (no tool): ${orphans.join(", ")}`);
}

// 3. Uniqueness of titles/descriptions/keywords
const titleSeen = new Map<string, string>();
const descSeen = new Map<string, string>();
const kwSeen = new Map<string, string>();
for (const [slug, s] of Object.entries(SEO_BY_SLUG)) {
  if (titleSeen.has(s.metaTitle)) warnings.push(`Duplicate metaTitle "${s.metaTitle}": ${titleSeen.get(s.metaTitle)} vs ${slug}`);
  else titleSeen.set(s.metaTitle, slug);
  if (descSeen.has(s.metaDescription)) warnings.push(`Duplicate metaDescription: ${descSeen.get(s.metaDescription)} vs ${slug}`);
  else descSeen.set(s.metaDescription, slug);
  const kw = s.primaryKeyword.toLowerCase();
  if (kwSeen.has(kw)) warnings.push(`Duplicate primaryKeyword "${kw}": ${kwSeen.get(kw)} vs ${slug}`);
  else kwSeen.set(kw, slug);
}

// 4. Length checks + guide word counts
let guideWordsTotal = 0;
let count = 0;
for (const [slug, s] of Object.entries(SEO_BY_SLUG)) {
  const tLen = s.metaTitle.length;
  if (tLen > 62) warnings.push(`${slug}: metaTitle ${tLen} chars (>62): "${s.metaTitle}"`);
  const dLen = s.metaDescription.length;
  if (dLen < 120 || dLen > 168) warnings.push(`${slug}: metaDescription ${dLen} chars (want 120-168)`);
  const gWords = Object.values(s.guide).join(" ").split(/\s+/).filter(Boolean).length;
  guideWordsTotal += gWords;
  count++;
  if (gWords < 110) warnings.push(`${slug}: guide only ${gWords} words (<110)`);
  if (gWords > 260) warnings.push(`${slug}: guide ${gWords} words (>260)`);
}

console.log(`Tools: ${TOOLS.length}, SEO entries: ${count}`);
console.log(`Average guide length: ${Math.round(guideWordsTotal / count)} words`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings.length}`);
for (const w of warnings) console.log("  -", w);
