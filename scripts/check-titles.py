#!/usr/bin/env python3
"""Verify title uniqueness + meta presence across all prerendered tool pages."""
import re, glob, os
from collections import Counter

app_dir = "/home/z/my-project/.next/server/app"
titles, descs = [], []
missing = []
pages = [p for p in glob.glob(os.path.join(app_dir, "*.html")) if not os.path.basename(p).startswith("_")]
for path in sorted(pages):
    html = open(path, encoding="utf-8", errors="replace").read()
    slug = "/" + os.path.basename(path)[:-5]
    t = re.search(r"<title>(.*?)</title>", html, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', html)
    c = re.search(r'<link rel="canonical" href="([^"]*)"', html)
    n = re.search(r'name="robots" content="([^"]*)"', html)
    if not (t and d and c):
        missing.append(slug)
        continue
    titles.append(t.group(1))
    descs.append(d.group(1))
    if c.group(1) != f"https://pixkitapp.com{slug}":
        missing.append(f"{slug} canonical={c.group(1)}")
    if n and "noindex" in n.group(1):
        missing.append(f"{slug} NOINDEX")

td = [t for t, cN in Counter(titles).items() if cN > 1]
dd = [d for d, cN in Counter(descs).items() if cN > 1]
print(f"Prerendered tool pages scanned: {len(pages)}")
print(f"Pages with missing/broken meta or canonical: {len(missing)}", missing[:5])
print(f"Duplicate titles: {len(td)}", td[:3])
print(f"Duplicate descriptions: {len(dd)}", dd[:3])
lens = [len(t) for t in titles]
print(f"Title lengths: min={min(lens)} max={max(lens)} avg={sum(lens)//len(lens)}")
