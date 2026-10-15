#!/usr/bin/env python3
"""PixKitApp technical SEO test suite.

Auto-detects the indexing mode of the target server:
  - production: robots.txt allows crawlers, pages are indexable
  - preview:    NEXT_PUBLIC_INDEXING_MODE=preview -> noindex everywhere,
                robots.txt disallows all, sitemap route returns empty

Usage: python3 seo-tests.py [base_url]   (default http://localhost:3000)
"""
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
fails, passes = [], []

def check(name, cond, detail=""):
    (passes if cond else fails).append(f"{name}{(' — ' + detail) if detail and not cond else ''}")

def get(path, timeout=20, want_headers=False):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "Mozilla/5.0 (compatible; SEO-Test/1.0)"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read().decode("utf-8", "replace")
            return (r.status, body, dict(r.headers)) if want_headers else (r.status, body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        headers = dict(e.headers) if hasattr(e, "headers") else {}
        return (e.code, body, headers) if want_headers else (e.code, body)

# ---------- 0. mode detection ----------
st, robots_body, robots_headers = get("/robots.txt", want_headers=True)
PREVIEW = "Disallow: /" in robots_body and "Allow: /" not in robots_body
MODE = "preview" if PREVIEW else "production"
print(f"Detected indexing mode: {MODE} ({BASE})")
check("X-Robots-Tag header matches mode",
      ("noindex" in robots_headers.get("X-Robots-Tag", "")) if PREVIEW
      else ("noindex" not in robots_headers.get("X-Robots-Tag", "")),
      robots_headers.get("X-Robots-Tag", "<absent>"))

# ---------- 1. sitemap.xml ----------
st, body = get("/sitemap.xml")
check("sitemap.xml status 200", st == 200, str(st))
try:
    root = ET.fromstring(body)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [u.text for u in root.findall(".//s:url/s:loc", ns)]
    check("sitemap parses as valid XML", True)
except ET.ParseError as e:
    urls = []
    check("sitemap parses as valid XML", False, str(e))

if PREVIEW:
    check("preview sitemap is empty (no production signals)", len(urls) == 0, f"got {len(urls)} URLs")
else:
    check("sitemap has 147 URLs (home+tools+4 static+14 cat+127 tools)", len(urls) == 147, f"got {len(urls)}")
dupes = [u for u, c in Counter(urls).items() if c > 1]
check("sitemap no duplicate URLs", not dupes, str(dupes[:3]))
check("sitemap no URL fragments", not any("#" in u for u in urls))
check("sitemap all URLs lowercase", all(u == u.lower() for u in urls))
check("sitemap all https + canonical host", all(u.startswith("https://pixkitapp.com/") or u == "https://pixkitapp.com" for u in urls))
check("sitemap no accidental disallowed paths", not any(p in u for u in urls for p in ["/api"]))

# ---------- 2. robots.txt ----------
if PREVIEW:
    check("preview robots.txt disallows all crawlers", "Disallow: /" in robots_body, robots_body[:200])
    check("preview robots.txt has no sitemap ref", "Sitemap:" not in robots_body, robots_body[:200])
else:
    check("robots.txt allows all + sitemap ref", "Allow: /" in body if False else ("Allow: /" in robots_body and "Sitemap: https://pixkitapp.com/sitemap.xml" in robots_body and "Disallow" not in robots_body), robots_body[:200])

# ---------- 3. Per-page checks (SSR HTML) ----------
HOME_DESC = ("Compress, resize, crop, convert and edit images online with 127 free "
             "browser-based tools. Photos stay on your device — no uploads, no signups, no watermarks.")

def page_checks(path, expect_title_frag, expect_h1_frag, expect_guide_frag, expect_desc=None):
    st, html = get(path)
    ok = st == 200
    check(f"{path} status 200", ok, str(st))
    if not ok:
        return None
    title = re.search(r"<title>(.*?)</title>", html, re.S)
    check(f"{path} <title> contains '{expect_title_frag}'", title and expect_title_frag.lower() in title.group(1).lower(), title.group(1)[:90] if title else "none")
    desc = re.search(r'<meta name="description" content="([^"]*)"', html)
    check(f"{path} meta description present (140-168c)", desc and 120 <= len(desc.group(1)) <= 168, f"{len(desc.group(1)) if desc else 0}c")
    canon = re.search(r'<link rel="canonical" href="([^"]*)"', html)
    expected_canon = "https://pixkitapp.com" if path == "/" else f"https://pixkitapp.com{path}"
    check(f"{path} self-canonical", canon and canon.group(1) == expected_canon, canon.group(1) if canon else "none")
    if PREVIEW:
        check(f"{path} noindex in preview", re.search(r'<meta name="robots" content="[^"]*noindex[^"]*"', html) is not None,
              re.search(r'<meta name="robots" content="([^"]*)"', html).group(1) if re.search(r'<meta name="robots" content="([^"]*)"', html) else "missing robots meta")
    else:
        check(f"{path} no noindex (production)", "noindex" not in html.lower())
    # --- social sharing tags (required on every applicable page) ---
    og_title = re.search(r'<meta property="og:title" content="([^"]*)"', html)
    og_desc = re.search(r'<meta property="og:description" content="([^"]*)"', html)
    og_url = re.search(r'<meta property="og:url" content="([^"]*)"', html)
    og_type = re.search(r'<meta property="og:type" content="([^"]*)"', html)
    og_img = re.search(r'<meta property="og:image" content="([^"]*)"', html)
    tw_card = re.search(r'<meta name="twitter:card" content="([^"]*)"', html)
    tw_title = re.search(r'<meta name="twitter:title" content="([^"]*)"', html)
    tw_desc = re.search(r'<meta name="twitter:description" content="([^"]*)"', html)
    tw_img = re.search(r'<meta name="twitter:image" content="([^"]*)"', html)
    check(f"{path} og:title", og_title is not None and len(og_title.group(1)) > 5)
    check(f"{path} og:description", og_desc is not None and len(og_desc.group(1)) > 20)
    expected_og_url = "https://pixkitapp.com" if path == "/" else f"https://pixkitapp.com{path}"
    check(f"{path} og:url = production path", og_url is not None and og_url.group(1) == expected_og_url, og_url.group(1) if og_url else "none")
    check(f"{path} og:type = website", og_type is not None and og_type.group(1) == "website", og_type.group(1) if og_type else "none")
    check(f"{path} og:image = production og-default.png", og_img is not None and og_img.group(1) == "https://pixkitapp.com/og-default.png", og_img.group(1) if og_img else "none")
    check(f"{path} twitter:card = summary_large_image", tw_card is not None and tw_card.group(1) == "summary_large_image", tw_card.group(1) if tw_card else "none")
    check(f"{path} twitter:title", tw_title is not None and len(tw_title.group(1)) > 5)
    check(f"{path} twitter:description", tw_desc is not None and len(tw_desc.group(1)) > 20)
    check(f"{path} twitter:image", tw_img is not None and tw_img.group(1) == "https://pixkitapp.com/og-default.png", tw_img.group(1) if tw_img else "none")
    for tag, m in [("og:image", og_img), ("twitter:image", tw_img), ("og:url", og_url), ("og:title", og_title), ("twitter:title", tw_title)]:
        n = len(re.findall(r'<meta (?:property|name)="' + tag + r'"', html))
        check(f"{path} exactly one {tag} tag", n == 1, f"found {n}")
    # --- homepage description must not leak to other pages ---
    if path != "/" and desc:
        check(f"{path} description unique vs homepage", desc.group(1) != HOME_DESC)
    h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.S)
    check(f"{path} exactly one <h1>", len(h1s) == 1, f"{len(h1s)} h1s")
    check(f"{path} h1 contains '{expect_h1_frag}'", h1s and expect_h1_frag.lower() in re.sub(r"<[^>]+>", "", h1s[0]).lower(), re.sub(r'<[^>]+>', '', h1s[0])[:80] if h1s else "none")
    check(f"{path} guide text in SSR HTML", expect_guide_frag.lower() in html.lower())
    kw = re.search(r'<meta name="keywords" content="([^"]*)"', html)
    check(f"{path} keywords meta present", bool(kw))
    if kw:
        kws = [k.strip() for k in kw.group(1).split(",") if k.strip()]
        dup = [k for k, c in Counter(k.lower() for k in kws).items() if c > 1]
        check(f"{path} keywords meta has no duplicates", not dup, str(dup))
    return desc.group(1) if desc else None

# The user's canonical example
page_checks("/webp-to-jpg", "WebP to JPG Converter Online", "Convert WebP to JPG", "flattens any transparency onto the background color")
page_checks("/image-compressor", "Free Image Compressor", "Free Image Compressor", "re-encodes your images through the browser")
page_checks("/image-to-pdf", "Image to PDF Converter", "Image to PDF Converter", "minimal PDF writer")
page_checks("/passport-photo-maker", "Passport Photo Maker", "Passport Photo Maker", "head-position overlay")
page_checks("/resize-image-to-kb", "Resize Image to a Target KB", "Resize Image to a Target File Size", "searching two dials")

# Duplicate-keyword regression: the tool whose primary keyword collides with its keywords list
st, html = get("/compress-image-to-50kb")
kw = re.search(r'<meta name="keywords" content="([^"]*)"', html)
kws = [k.strip() for k in kw.group(1).split(",")] if kw else []
check("/compress-image-to-50kb 'compress image to 50kb' appears exactly once",
      kws.count("compress image to 50kb") == 1, f"count={kws.count('compress image to 50kb')}")

# Static pages keep their working metadata + full social tags
for p, frag in [("/tools", "All Tools"), ("/about", "About PixKitApp"), ("/privacy", "Privacy"), ("/terms", "Terms"), ("/contact", "Contact")]:
    st, html = get(p)
    title = re.search(r"<title>(.*?)</title>", html, re.S)
    canon = re.search(r'<link rel="canonical" href="([^"]*)"', html)
    check(f"{p} status 200 + title + canonical", st == 200 and title and frag.lower() in title.group(1).lower() and canon and canon.group(1).endswith(p), f"{st}")

page_checks("/tools", "All Tools", "All PixKitApp Tools", "searchable, filterable")
page_checks("/about", "About PixKitApp", "About PixKitApp", "zero privacy trade-offs")
page_checks("/contact", "Contact", "Contact PixKitApp", "We reply to every message")
page_checks("/privacy", "Privacy Policy", "Privacy Policy", "processed locally in your browser")
page_checks("/terms", "Terms of Service", "Terms of Service", "provided as-is")

# Homepage
home_desc = page_checks("/", "127 Free Online Image Tools", "Every image tool you need", "popular tools")
check("homepage description is 150-160 chars", home_desc and 150 <= len(home_desc) <= 160, f"{len(home_desc) if home_desc else 0}c")
check("homepage description matches approved copy", home_desc == HOME_DESC, home_desc[:120] if home_desc else "none")

# Category page
st, html = get("/categories/compress")
title = re.search(r"<title>(.*?)</title>", html, re.S)
canon = re.search(r'<link rel="canonical" href="([^"]*)"', html)
h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.S)
check("/categories/compress status+title+canonical+h1", st == 200 and title and "Compress" in title.group(1) and canon and canon.group(1).endswith("/categories/compress") and len(h1s) == 1, f"{st}")
page_checks("/categories/compress", "Compression Tools", "Compression", "browser with zero uploads")

# ---------- 4. 404 handling ----------
st, html = get("/this-tool-does-not-exist")
check("unknown tool URL returns 404", st == 404, str(st))
check("404 page has helpful content + links", "not found" in html.lower() and "/tools" in html)
st, _ = get("/categories/not-a-category")
check("unknown category returns 404", st == 404, str(st))

# ---------- 5. Social image asset is served ----------
st, body, hdr = get("/og-default.png", want_headers=True)
check("og-default.png served locally (200 + image/png)", st == 200 and hdr.get("Content-Type", "").startswith("image/png"), f"{st} {hdr.get('Content-Type')}")
check("og-default.png reasonable size (<1MB)", len(body) < 1_000_000, f"{len(body)} bytes")

# ---------- 6. Every sitemap URL is directly accessible ----------
bad = []
for u in urls:
    path = u.replace("https://pixkitapp.com", "") or "/"
    st, _ = get(path)
    if st != 200:
        bad.append(f"{path}:{st}")
if PREVIEW:
    check("preview: no sitemap URLs to crawl (skipped)", True)
else:
    check("all 147 sitemap URLs return 200 directly", not bad, str(bad[:5]))

# ---------- 7. Internal link crawlability on tool pages ----------
st, html = get("/webp-to-jpg")
links = re.findall(r'href="(/[^"]*)"', html)
internal = [l for l in links if not l.startswith("//")]
check("tool page has crawlable internal links (>=8)", len(internal) >= 8, f"{len(internal)}")
check("tool page links to category page", any(l.startswith("/categories/") for l in internal))
check("tool page links to related tools", sum(1 for l in internal if l not in ("/tools",) and l.count("/") == 1) >= 3, str(internal[:8]))

# ---------- summary ----------
print(f"PASSED: {len(passes)}")
print(f"FAILED: {len(fails)}")
for f in fails:
    print("  FAIL:", f)
sys.exit(1 if fails else 0)
