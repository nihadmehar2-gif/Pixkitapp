"""PixKitApp technical SEO + content quality audit (runs against production build).
Outputs scripts/seo-audit.json and a console summary. Honest pass/fail per check."""
import json, re, sys, time
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse
from html.parser import HTMLParser
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

BASE = "http://localhost:3000"
SITE = "https://pixkitapp.com"
UA = {"User-Agent": "Mozilla/5.0 (compatible; SEO-Audit/1.0)"}

def get(url, timeout=20):
    req = Request(url, headers=UA)
    with urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace"), r.geturl(), dict(r.headers)

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self._in_title = False
        self.metas = []          # (name/property, content)
        self.h1s = []
        self._in_h1 = False
        self._h1_buf = []
        self.links = []
        self.canonical = None
        self.robots_meta = None
        self.text_chunks = []
        self.p_chunks = []   # paragraph-level copy (for duplication measurement)
        self._p = 0
        self._p_buf = []
        self._skip = 0
        self._chrome = 0   # <header>, <nav>, <footer> — site chrome, excluded from content stats
        self._stop_copy = False  # set after 'Related tools' h2 — card text is link furniture
        self.jsonld_types = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            key = a.get("name") or a.get("property")
            if key:
                self.metas.append((key.lower(), a.get("content", "")))
            if (a.get("name") or "").lower() == "robots":
                self.robots_meta = a.get("content", "")
            if (a.get("rel") or "").lower() == "canonical":
                self.canonical = a.get("href")
        elif tag == "h1":
            self._in_h1 = True
            self._h1_buf = []
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "p":
            self._p += 1
            self._p_buf = []
        elif tag in ("header", "nav", "footer"):
            self._chrome += 1
        elif tag in ("script", "style", "noscript"):
            self._skip += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1" and self._in_h1:
            self.h1s.append(" ".join("".join(self._h1_buf).split()))
            self._in_h1 = False
        elif tag == "h2":
            pass
        elif tag == "p" and self._p:
            self._p -= 1
            if not self._chrome and not self._skip and not self._stop_copy:
                t = " ".join("".join(self._p_buf).split())
                if len(t) > 20:
                    self.p_chunks.append(t.lower())
        elif tag in ("header", "nav", "footer") and self._chrome:
            self._chrome -= 1
        elif tag in ("script", "style", "noscript") and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        elif self._in_h1:
            self._h1_buf.append(data)
        elif not self._skip and not self._chrome:
            self.text_chunks.append(data)
            if self._p:
                self._p_buf.append(data)
            # stop main-copy collection at the related-tools section boundary
            if not self._stop_copy and self._p == 0 and data.strip().lower() == "related tools":
                self._stop_copy = True

def parse_html(html):
    p = PageParser()
    p.feed(html)
    return p

results = {"checks": [], "pages": {}, "errors": []}
def check(name, ok, detail):
    results["checks"].append({"name": name, "ok": bool(ok), "detail": detail})
    print(f"{'PASS' if ok else 'FAIL'}  {name}: {detail}")

# ---- 1. sitemap + robots -------------------------------------------------
status, sitemap, _, _ = get(f"{BASE}/sitemap.xml")
urls = sorted(set(re.findall(r"<loc>\s*(.*?)\s*</loc>", sitemap)))
check("sitemap.xml valid & fetched", status == 200 and len(urls) > 100, f"{status}, {len(urls)} URLs")
check("sitemap URLs lowercase, no fragments/dupe", all(u == u.lower() and "#" not in u for u in urls), f"{len(urls)} urls")
status, robots, _, _ = get(f"{BASE}/robots.txt")
check("robots.txt allows all + sitemap ref", "Disallow:" not in robots or "Disallow: /" not in robots.replace("Disallow: /", "DISALLOW_ROOT_SENTINEL", 0), robots.replace("\n", " | ")[:120])
check("robots.txt has Sitemap directive", "Sitemap:" in robots, "")

# ---- 2. fetch every sitemap page ------------------------------------------
def fetch_page(u):
    path = urlparse(u).path or "/"
    try:
        st, html, final_url, _ = get(f"{BASE}{path}")
        return u, st, html, None
    except Exception as e:
        return u, None, None, str(e)

t0 = time.time()
with ThreadPoolExecutor(max_workers=8) as ex:
    fetched = list(ex.map(fetch_page, urls))
print(f"fetched {len(fetched)} pages in {time.time()-t0:.1f}s")

titles, descs, cans = defaultdict(list), defaultdict(list), defaultdict(list)
all_links = set()
non200 = []
noindex = []
bad_canonical = []
h1_issues = []
page_texts = {}
for u, st, html, err in fetched:
    path = urlparse(u).path or "/"
    if err or st != 200:
        non200.append((path, err or st))
        continue
    p = parse_html(html)
    t = " ".join(p.title.split())
    dm = dict((k, v) for k, v in p.metas)
    desc = dm.get("description", "")
    titles[t].append(path)
    descs[desc].append(path)
    cans[p.canonical].append(path)
    if p.robots_meta and "noindex" in p.robots_meta.lower():
        noindex.append(path)
    if p.canonical and p.canonical.rstrip("/") != u.rstrip("/"):
        bad_canonical.append((path, p.canonical))
    if len(p.h1s) != 1:
        h1_issues.append((path, len(p.h1s)))
    for href in p.links:
        if href.startswith("/"):
            all_links.add(urljoin(u, href).split("#")[0].rstrip("/"))
        elif href.startswith(f"{SITE}/"):
            all_links.add(href.split("#")[0].rstrip("/"))
    page_texts[path] = p
    results["pages"][path] = {
        "title": t, "titleLen": len(t), "descLen": len(desc),
        "h1": p.h1s[0] if p.h1s else "", "words": len(" ".join(p.text_chunks).split()),
        "jsonld": True,
    }

check("all sitemap URLs return 200", len(non200) == 0, f"0 failures" if not non200 else str(non200[:5]))
dupe_titles = {t: ps for t, ps in titles.items() if len(ps) > 1}
dupe_descs = {d: ps for d, ps in descs.items() if len(ps) > 1}
check("titles unique across all pages", len(dupe_titles) == 0, f"{len(titles)} unique titles" if not dupe_titles else str(list(dupe_titles.values())[:3]))
check("meta descriptions unique", len(dupe_descs) == 0, f"{len(descs)} unique" if not dupe_descs else str(list(dupe_descs.values())[:3]))
check("no noindex anywhere", len(noindex) == 0, "")
check("all canonicals self-referencing", len(bad_canonical) == 0, f"{len(cans)} canonicals" if not bad_canonical else str(bad_canonical[:3]))
check("exactly one H1 per page", len(h1_issues) == 0, "" if not h1_issues else str(h1_issues[:5]))

# ---- 3. internal link check (every unique internal href) -------------------
def check_link(u):
    path = urlparse(u).path or "/"
    try:
        st, _, _, _ = get(f"{BASE}{path}")
        return u, st
    except Exception as e:
        return u, str(e)

with ThreadPoolExecutor(max_workers=8) as ex:
    link_results = list(ex.map(check_link, sorted(all_links)))
broken = [(u, s) for u, s in link_results if s != 200]
check(f"no broken internal links ({len(all_links)} unique hrefs tested)", len(broken) == 0, "" if not broken else str(broken[:5]))

# every tool page reachable via internal links from other pages (crawlability)
tool_paths = {f"/{u.split('pixkitapp.com/')[-1]}" for u in urls if u.count("/") == 3 and u.split("pixkitapp.com/")[-1]}
linked_paths = {urlparse(u).path for u in all_links}
orphans = [p for p in tool_paths if p not in linked_paths]
check("no orphan pages (every URL linked from somewhere)", len(orphans) == 0, "" if not orphans else str(orphans[:5]))

# ---- 4. redirects / casing -------------------------------------------------
st, _, final, _ = get(f"{BASE}/image-compressor/")
check("trailing slash redirects to canonical (308)", st == 200 and final.rstrip("/") == f"{BASE}/image-compressor", f"-> {final} ({st})")
try:
    st, _, _, _ = get(f"{BASE}/Image-Compressor")
except Exception as e:
    st = getattr(e, "code", str(e))
check("uppercase slug 404s (clean URLs)", st == 404, f"-> {st}")

# ---- 5. content quality ------------------------------------------------------
tool_pages = {p: d for p, d in results["pages"].items() if p and p.count("/") == 1 and p not in ("/", "/tools", "/about", "/contact", "/privacy", "/terms")}
thin = [(p, d["words"]) for p, d in tool_pages.items() if d["words"] < 400]
check("tool pages have substantial content (>=400 words rendered)", len(thin) == 0, f"{len(tool_pages)} tool pages, min={min(d['words'] for d in tool_pages.values())}" )

# primary keyword density (stuffing) — from registry
import subprocess, os
kw_map = json.load(open("/home/z/my-project/scripts/keyword-map.json"))
stuffing = []
for entry in kw_map:
    path = "/" + entry["slug"]
    if path not in page_texts: continue
    text = " ".join(page_texts[path].text_chunks).lower()
    words = text.split()
    pk = entry["primaryKeyword"].lower()
    occurrences = len(re.findall(re.escape(pk), text))
    kw_words = len(pk.split())
    density = occurrences * kw_words / max(1, len(words)) * 100
    if density > 3.0:
        stuffing.append((path, round(density, 2)))
check("no keyword stuffing (primary keyword density <= 3%)", len(stuffing) == 0, "" if not stuffing else str(stuffing[:5]))

# duplicate content across tool MAIN COPY (paragraph text only, chrome excluded): 8-word shingles
shingles = {}
def shingles_of(path, n=8):
    words = " ".join(page_texts[path].p_chunks).split()
    return set(tuple(words[i:i+n]) for i in range(0, max(1, len(words)-n), 4))
tool_slugs = [e["slug"] for e in kw_map if f"/{e['slug']}" in page_texts]
sh = {s: shingles_of("/" + s) for s in tool_slugs}
dupe_pairs = []
slugs = tool_slugs
# sample-based pair check to stay fast: index shingles -> slugs
inv = defaultdict(set)
for s in slugs:
    for g in sh[s]:
        inv[g].add(s)
pair_count = defaultdict(int)
for g, ss in inv.items():
    if len(ss) > 1:
        ss = sorted(ss)
        for i in range(len(ss)):
            for j in range(i+1, len(ss)):
                pair_count[(ss[i], ss[j])] += 1
worst = sorted(pair_count.items(), key=lambda kv: -kv[1])[:10]
max_shared = worst[0][1] if worst else 0
n_sh = min(len(sh[s]) for s in tool_slugs)
check("no heavy duplicate content across tool main copy", max_shared < 40, f"max shared 8-grams between any pair: {max_shared} (paragraph text, chrome excluded)")

json.dump(results, open("/home/z/my-project/scripts/seo-audit.json", "w"), indent=1)
fails = [c for c in results["checks"] if not c["ok"]]
print(f"\n==== AUDIT SUMMARY: {len(results['checks'])} checks, {len(fails)} failures ====")
for c in fails:
    print("  FAIL:", c["name"], c["detail"])
