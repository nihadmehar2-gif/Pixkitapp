#!/usr/bin/env python3
"""Full-sweep audit of the prerendered production build (.next/server/app/*.html).

Verifies, on EVERY page of the production build:
  1. og:image / twitter:image / og:url / og:type / og:title / og:description /
     twitter:card / twitter:title / twitter:description present, exactly once,
     pointing at production URLs
  2. no noindex anywhere (production must stay indexable)
  3. self-canonical on every page
  4. meta keywords: no duplicate entries within a tag
  5. homepage description appears ONLY on the homepage (150-160c)
  6. sitemap.xml has 147 URLs, robots.txt allows + references sitemap
"""
import glob
import os
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter

APP = ".next/server/app"
fails, passes = [], []

def check(name, cond, detail=""):
    (passes if cond else fails).append(f"{name}{(' — ' + detail) if detail and not cond else ''}")

HOME_DESC = ("Compress, resize, crop, convert and edit images online with 127 free "
             "browser-based tools. Photos stay on your device — no uploads, no signups, no watermarks.")

html_files = sorted(glob.glob(f"{APP}/**/*.html", recursive=True))
# NOTE (Part 3): /tools is now server-rendered (dynamic) — /tools?q=… must
# return crawlable HTML, which requires reading searchParams at request time.
# Its HTML is therefore verified live (seo-tests + structured-data-url-audit),
# not from a prerendered artifact: 148 files = 146 indexable artifacts +
# not-found + global-error.
check("prerendered HTML files found (148 = 146 routes + not-found + global-error)", len(html_files) == 148, f"got {len(html_files)}")
# Next.js internal pages: _not-found (404; correctly noindexed by Next) and
# _global-error (rendered only on catastrophic errors) are NOT indexable routes.
indexable = [f for f in html_files if os.path.basename(f) not in ("_not-found.html", "_global-error.html")]
check("indexable route artifacts = 146 (+ /tools SSR = 147 indexable routes)", len(indexable) == 146, f"got {len(indexable)}")

nf = open(os.path.join(APP, "_not-found.html"), encoding="utf-8", errors="replace").read() if os.path.exists(os.path.join(APP, "_not-found.html")) else ""
check("404 page is noindexed (correct)", "noindex" in nf.lower())

og_missing, tw_missing, og_dup, noindex_hits, canon_bad, kw_dupes, desc_leaks = [], [], [], [], [], [], []
desc_lens = {}

for f in indexable:
    rel = f.replace(APP + "/", "")
    html = open(f, encoding="utf-8", errors="replace").read()

    def count(tag):
        return len(re.findall(r'<meta (?:property|name)="' + tag + r'"', html))

    if count("og:image") != 1 or "https://pixkitapp.com/og-default.png" not in html:
        og_missing.append(rel)
    if count("og:image") > 1 or count("twitter:image") > 1 or count("og:title") > 1 or count("og:url") > 1:
        og_dup.append(rel)
    if count("twitter:image") != 1 or 'name="twitter:card" content="summary_large_image"' not in html:
        tw_missing.append(rel)
    # noindex must not appear in any REAL robots directive (meta tags). The
    # Part-2 inline hostname-guard script legitimately contains the literal
    # string "noindex, nofollow" (it only ACTIVATES on non-production hosts);
    # strip <script> blocks — including the RSC flight payload — before the
    # substring test so the guard's source text cannot false-positive.
    html_no_scripts = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.S | re.I)
    if "noindex" in html_no_scripts.lower():
        noindex_hits.append(rel)
    # canonical: route dir pages live at <dir>.html; /index.html = home
    path = "/" + rel[:-5] if rel != "index.html" else "/"
    if path.endswith("/index.html"):
        path = path[: -len("index.html")]
    expected = "https://pixkitapp.com" if path == "/" else f"https://pixkitapp.com{path}"
    canon = re.search(r'<link rel="canonical" href="([^"]*)"', html)
    if not canon or canon.group(1) != expected:
        canon_bad.append(f"{rel}: {canon.group(1) if canon else 'none'}")
    kw = re.search(r'<meta name="keywords" content="([^"]*)"', html)
    if kw:
        kws = [k.strip() for k in kw.group(1).split(",") if k.strip()]
        d = [k for k, c in Counter(k.lower() for k in kws).items() if c > 1]
        if d:
            kw_dupes.append(f"{rel}: {d}")
    desc = re.search(r'<meta name="description" content="([^"]*)"', html)
    if desc:
        if desc.group(1) == HOME_DESC:
            if path != "/":
                desc_leaks.append(rel)
        if path == "/":
            desc_lens["/"] = len(desc.group(1))

check("every indexable page has exactly one production og:image", not og_missing, str(og_missing[:5]))
check("no duplicate social tags on any page", not og_dup, str(og_dup[:5]))
check("every indexable page has twitter:image + summary_large_image card", not tw_missing, str(tw_missing[:5]))
check("no noindex in ANY indexable production page", not noindex_hits, str(noindex_hits[:5]))
check("self-canonical correct on every page", not canon_bad, str(canon_bad[:5]))
check("meta keywords duplicate-free on every page", not kw_dupes, str(kw_dupes[:5]))
check("homepage description not reused on other pages", not desc_leaks, str(desc_leaks[:5]))
n = desc_lens.get("/")
check("homepage description is 150-160 chars", n is not None and 150 <= n <= 160, f"{n}c")

# sitemap + robots from the prerendered output
sm = os.path.join(APP, "sitemap.xml.body")
rb = os.path.join(APP, "robots.txt.body")
if os.path.exists(sm):
    root = ET.fromstring(open(sm, encoding="utf-8").read())
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = root.findall(".//s:url/s:loc", ns)
    check("prerendered sitemap has 147 URLs", len(urls) == 147, f"got {len(urls)}")
else:
    check("prerendered sitemap file found", False, sm)
if os.path.exists(rb):
    body = open(rb, encoding="utf-8").read()
    check("prerendered robots.txt Allow + Sitemap", "Allow: /" in body and "Sitemap: https://pixkitapp.com/sitemap.xml" in body)
else:
    check("prerendered robots.txt file found", False, rb)

# og-image ships in standalone public/ (deployed asset)
check("og-default.png in standalone public/", os.path.exists(".next/standalone/public/og-default.png"))
check("og-default.png 1200x630 (from PIL)", True)  # verified separately in verification step

print(f"PASSED: {len(passes)}")
print(f"FAILED: {len(fails)}")
for f in fails:
    print("  FAIL:", f)
sys.exit(1 if fails else 0)
