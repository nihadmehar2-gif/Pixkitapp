#!/usr/bin/env python3
"""PART 5 verification: duplicate meta tags, mixed content, security headers,
icon/manifest links, lang attribute. Usage: verify-part5.py <base_url>"""
import json, re, sys, urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3100"
PAGES = ["/", "/image-compressor", "/resize-image", "/tools", "/about", "/contact",
         "/privacy", "/terms", "/categories/compress", "/category/compress",
         "/passport-photo-maker", "/nonexistent-page-404-check"]
results = []

def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "Mozilla/5.0 part5-check"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, dict(r.headers), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8", "replace")

for path in PAGES:
    status, headers, html = fetch(path)
    out = {"page": path, "status": status}
    # duplicate meta tags
    out["title_count"] = len(re.findall(r"<title[ >]", html))
    out["desc_count"] = len(re.findall(r'<meta\s+name="description"', html))
    out["viewport_count"] = len(re.findall(r'<meta\s+name="viewport"', html))
    out["robots_count"] = len(re.findall(r'<meta\s+name="robots"', html))
    out["canonical_count"] = len(re.findall(r'<link\s+rel="canonical"', html))
    # lang
    m = re.search(r'<html[^>]*\slang="([^"]*)"', html)
    out["lang"] = m.group(1) if m else None
    # mixed content (http:// subresources on an https-capable page — we serve
    # over http locally, so only flag http:// URLs pointing at external hosts)
    ext_http = re.findall(r'(?:src|href)="(http://[^"]+)"', html)
    out["external_http_resources"] = [u for u in ext_http if BASE.split("//")[1] not in u][:5]
    # icon/manifest links
    out["has_manifest"] = 'rel="manifest"' in html
    out["icon_links"] = sorted(set(re.findall(r'<link\s+rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*href="([^"]+)"', html)))
    # security headers
    h = {k.lower(): v for k, v in headers.items()}
    out["headers"] = {
        "x-content-type-options": h.get("x-content-type-options"),
        "referrer-policy": h.get("referrer-policy"),
        "permissions-policy": (h.get("permissions-policy") or "")[:60],
        "csp-frame-ancestors": (h.get("content-security-policy") or "")[:40],
        "x-frame-options": h.get("x-frame-options"),
    }
    # broken asset probe: collect local asset URLs and HEAD them
    assets = re.findall(r'(?:src|href)="(/_next/static/[^"]+|/manifest\.webmanifest|/favicon\.ico|/icon-192\.png|/icon-512\.png|/apple-touch-icon\.png)"', html)
    bad = []
    for a in sorted(set(assets)):
        req = urllib.request.Request(BASE + a, method="HEAD")
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                if r.status != 200: bad.append((a, r.status))
        except Exception as e:
            bad.append((a, str(e)[:40]))
    out["broken_assets"] = bad
    results.append(out)

# robots.txt & sitemap sanity
for path in ["/robots.txt", "/sitemap.xml"]:
    status, headers, body = fetch(path)
    results.append({"page": path, "status": status, "bytes": len(body)})

print(json.dumps(results, indent=1))
