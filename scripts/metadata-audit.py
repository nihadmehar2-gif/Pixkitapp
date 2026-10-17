#!/usr/bin/env python3
"""PixKitApp metadata audit — reusable per-URL report.

Crawls every route of a running PixKitApp server (sitemap-driven) plus an
error-page probe, and records for each URL:
  HTTP status, title (+length), meta description (+length), canonical,
  H1 count + texts, robots meta, og:image, twitter:image, keywords tag.

Flags (editorial targets, not hard rules):
  - title outside 50-60 chars (hard-fail outside 30-65)
  - description outside 150-160 chars (hard-fail outside 120-165)
  - duplicate titles / descriptions across pages
  - H1 count != 1
  - missing or non-absolute og:image / twitter:image
  - canonical != self URL (production form)
  - duplicate keywords within the keywords tag
  - indexable page carrying noindex, or production page missing robots meta

Outputs (in download/):
  metadata-audit-<stamp>.csv   full data, one row per URL
  metadata-audit-<stamp>.md    summary: stats + all flagged issues

Usage: python3 scripts/metadata-audit.py [base_url]   (default http://127.0.0.1:3001)
"""
import csv
import html as html_mod
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3001").rstrip("/")
STAMP = __import__("datetime").datetime.now().strftime("%Y%m%d-%H%M%S")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "download")
PROD_BASE = "https://pixkitapp.com"
UA = {"User-Agent": "Mozilla/5.0 (compatible; PixKit-Metadata-Audit/1.0)"}

TITLE_OK = (50, 60)
TITLE_HARD = (30, 65)
DESC_OK = (150, 160)
DESC_HARD = (120, 165)


def get(path, timeout=30):
    req = urllib.request.Request(BASE + path, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "replace"), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace"), dict(e.headers or {})
    except Exception as e:  # noqa: BLE001 — report connection problems as rows
        return 0, str(e), {}


def first(pattern, html, default=""):
    m = re.search(pattern, html, re.S)
    return m.group(1).strip() if m else default


def audit_html(url, status, html, header_robots):
    # Unescape HTML entities (&#x27; -> ') so measured lengths match what
    # crawlers actually read, not the encoded byte-bloated form.
    title = html_mod.unescape(first(r"<title>([^<]*)</title>", html))
    desc = html_mod.unescape(first(r'<meta name="description" content="([^"]*)"', html))
    canonical = first(r'<link rel="canonical" href="([^"]*)"', html)
    h1s = [html_mod.unescape(re.sub(r"\s+", " ", h).strip()) for h in re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.S)]
    h1s = [re.sub(r"<[^>]+>", "", h) for h in h1s]
    robots_meta = first(r'<meta name="robots" content="([^"]*)"', html, "<missing>")
    og_img = first(r'<meta property="og:image" content="([^"]*)"', html)
    tw_img = first(r'<meta name="twitter:image" content="([^"]*)"', html)
    kw = first(r'<meta name="keywords" content="([^"]*)"', html, "<no tag>")
    og_count = len(re.findall(r'property="og:image"', html))
    tw_count = len(re.findall(r'name="twitter:image"', html))

    flags = []
    if status != 200:
        flags.append(f"HTTP {status}")
    tl, dl = len(title), len(desc)
    if not (TITLE_OK[0] <= tl <= TITLE_OK[1]):
        flags.append("title-len" + (f"-HARD({tl})" if not (TITLE_HARD[0] <= tl <= TITLE_HARD[1]) else f"({tl})"))
    if not (DESC_OK[0] <= dl <= DESC_OK[1]):
        flags.append("desc-len" + (f"-HARD({dl})" if not (DESC_HARD[0] <= dl <= DESC_HARD[1]) else f"({dl})"))
    if len(h1s) != 1:
        flags.append(f"h1-count={len(h1s)}")
    if canonical:
        expected = PROD_BASE + ("" if url == "/" else url)
        if canonical != expected:
            flags.append(f"canonical!={expected}")
    else:
        flags.append("no-canonical")
    if "noindex" in robots_meta:
        flags.append("robots-noindex")
    elif robots_meta == "<missing>":
        flags.append("robots-meta-missing")
    if not og_img.startswith("http"):
        flags.append("og-image-missing-or-relative")
    if not tw_img.startswith("http"):
        flags.append("twitter-image-missing-or-relative")
    if og_count != 1:
        flags.append(f"og-image-count={og_count}")
    if tw_count != 1:
        flags.append(f"twitter-image-count={tw_count}")
    if header_robots.get("X-Robots-Tag", "").lower().find("noindex") >= 0:
        flags.append("x-robots-host-guard(header)")
    if kw != "<no tag>":
        kws = [k.strip().lower() for k in kw.split(",")]
        dupes = [k for k, c in Counter(kws).items() if c > 1]
        if dupes:
            flags.append("keyword-dupes:" + ",".join(dupes[:3]))

    return {
        "url": url, "status": status,
        "title": title, "title_len": tl,
        "description": desc, "desc_len": dl,
        "canonical": canonical,
        "h1_count": len(h1s), "h1_text": " || ".join(h1s)[:300],
        "robots": robots_meta, "og_image": og_img, "twitter_image": tw_img,
        "keywords": kw,
        "flags": "; ".join(flags),
    }


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # URL universe: sitemap-driven + error probe
    st, smap, _ = get("/sitemap.xml")
    if st != 200:
        print(f"FATAL: sitemap.xml returned {st} — is the server running at {BASE}?")
        sys.exit(2)
    urls = re.findall(r"<loc>([^<]+)</loc>", smap)
    paths = sorted(urllib.parse.urlparse(u).path or "/" for u in urls)
    print(f"Sitemap returned {len(paths)} URLs from {BASE}")

    rows, host_guard_count = [], 0
    for i, path in enumerate(paths):
        status, html, hdrs = get(path)
        if hdrs.get("X-Robots-Tag", "").lower().find("noindex") >= 0:
            host_guard_count += 1
        rows.append(audit_html(path, status, html, hdrs))
        if (i + 1) % 50 == 0:
            print(f"  audited {i + 1}/{len(paths)}…")

    # Error pages: custom not-found + a random URL that must 404
    status, html, hdrs = get("/this-page-does-not-exist-404-probe")
    row = audit_html("/this-page-does-not-exist-404-probe", status, html, hdrs)
    # For the 404 probe, noindex + 404 status are CORRECT — swap flags
    row["flags"] = ""
    if status != 404:
        row["flags"] = f"expected-404-got-{status}"
    elif "noindex" not in row["robots"] and hdrs.get("X-Robots-Tag", "").lower().find("noindex") < 0:
        row["flags"] = "404-not-noindexed"
    rows.append(row)

    # Duplicate detection across pages
    for field in ("title", "description"):
        counts = Counter(r[field].lower() for r in rows if r[field])
        for text, c in counts.items():
            if c > 1:
                hits = [r["url"] for r in rows if r[field].lower() == text]
                for r in rows:
                    if r[field].lower() == text:
                        r["flags"] = (r["flags"] + f"; {field}-duplicate x{c}").strip("; ")

    # Write CSV
    csv_path = os.path.join(OUT_DIR, f"metadata-audit-{STAMP}.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    # Stats + flags summary
    def len_stats(field, lo, hi):
        key = "title_len" if field == "title" else "desc_len"
        lens = [r[key] for r in rows if r[key]]
        in_range = sum(1 for L in lens if lo <= L <= hi)
        return f"{in_range}/{len(lens)} in {lo}-{hi}, min {min(lens)}, max {max(lens)}"

    flagged = [r for r in rows if r["flags"]]
    dup_titles = sum(1 for r in rows if "title-duplicate" in r["flags"])
    dup_descs = sum(1 for r in rows if "description-duplicate" in r["flags"])
    kw_pages = sum(1 for r in rows if r["keywords"] != "<no tag>")

    md = []
    md.append(f"# PixKitApp Metadata Audit — {STAMP}")
    md.append(f"Base: {BASE} · Sitemap URLs: {len(paths)} · + 1 error probe · Host-guard header on {host_guard_count} pages")
    md.append("")
    md.append(f"- Titles: {len_stats('title', *TITLE_OK)} (target {TITLE_OK[0]}-{TITLE_OK[1]})")
    md.append(f"- Descriptions: {len_stats('description', *DESC_OK)} (target {DESC_OK[0]}-{DESC_OK[1]})")
    md.append(f"- Pages with H1 != 1: {sum(1 for r in rows if r['h1_count'] != 1)}")
    md.append(f"- Pages with keywords tag: {kw_pages} (127 tool pages keep deduped tags; generic inherited tag removed)")
    md.append(f"- Duplicate titles: {dup_titles} pages · Duplicate descriptions: {dup_descs} pages")
    md.append(f"- Pages flagged: {len(flagged)} / {len(rows)}")
    md.append("")
    md.append("## Flagged pages")
    for r in flagged:
        md.append(f"- `{r['url']}` — {r['flags']} — title({r['title_len']}) \"{r['title']}\" — desc({r['desc_len']})")
    md_path = os.path.join(OUT_DIR, f"metadata-audit-{STAMP}.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md) + "\n")

    print(f"\nTitles:   {len_stats('title', *TITLE_OK)}")
    print(f"Descs:    {len_stats('description', *DESC_OK)}")
    print(f"Flagged:  {len(flagged)}/{len(rows)}")
    print(f"Reports:  {csv_path}\n          {md_path}")
    print("\n".join(md[md.index("## Flagged pages") if "## Flagged pages" in md else 0:]))


if __name__ == "__main__":
    main()
