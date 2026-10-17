#!/usr/bin/env python3
"""Final verification sweep for the accuracy-fix pass.
Checks against the running prod server (127.0.0.1:3100):
 1. canonical on every sitemap URL == https://pixkitapp.com/<path>
 2. passport note visible on all 6 passport/ID tool pages + category page
 3. no "Advertisement" placeholder label anywhere
 4. no fixed-percentage size claims in served HTML
 5. passport category meta description updated
"""
import re
import subprocess
import sys
import urllib.request

BASE = "http://127.0.0.1:3100"
FAIL = []

def get(path, host=None):
    req = urllib.request.Request(BASE + path)
    if host:
        req.add_header("Host", host)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, dict(r.headers), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8", "replace")

# --- 1) canonical sweep over all sitemap URLs --------------------------------
sm = get("/sitemap.xml")[2]
urls = re.findall(r"<loc>([^<]+)</loc>", sm)
print(f"sitemap URLs: {len(urls)}")
bad_canon = 0
for i, u in enumerate(urls):
    path = u.replace("https://pixkitapp.com", "") or "/"
    code, hdr, body = get(path)
    m = re.search(r'<link rel="canonical" href="([^"]+)"', body)
    # Root canonical is the bare origin (no trailing slash) — correct form.
    want = "https://pixkitapp.com" if path == "/" else f"https://pixkitapp.com{path}"
    if code != 200 or not m or m.group(1) != want:
        bad_canon += 1
        FAIL.append(f"canonical {path}: status={code} got={m.group(1) if m else None} want={want}")
    if (i + 1) % 50 == 0:
        print(f"  canonical checked {i+1}/{len(urls)}")
print(f"canonical mismatches: {bad_canon}")

# --- 2) passport note visibility ---------------------------------------------
NOTE = "Photo requirements vary by country and change over time. Always check the official requirements of the issuing authority before submitting."
passport_pages = [
    "/passport-photo-maker", "/us-passport-photo", "/schengen-visa-photo",
    "/china-visa-photo", "/id-photo-1-inch", "/photo-print-sheet",
    "/linkedin-profile-photo",  # expected WITHOUT note (no issuing authority)
    "/categories/passport-photos",
]
for p in passport_pages:
    code, _, body = get(p)
    present = NOTE in body
    expect = p != "/linkedin-profile-photo"
    status = "OK" if present == expect else "MISMATCH"
    if present != expect:
        FAIL.append(f"passport note {p}: present={present} expected={expect}")
    print(f"  note on {p}: {'present' if present else 'absent'} (expected {'present' if expect else 'absent'}) -> {status}")

# --- 3) Advertisement placeholder absent --------------------------------------
adv_pages = ["/", "/image-compressor", "/tools", "/categories/compress"]
for p in adv_pages:
    _, _, body = get(p)
    if "Advertisement" in body:
        FAIL.append(f"'Advertisement' label still rendered on {p}")
        print(f"  'Advertisement' label on {p}: STILL PRESENT (BAD)")
    else:
        print(f"  'Advertisement' label on {p}: absent (good)")

# --- 4) fixed-percentage claims in served HTML --------------------------------
CLAIM = re.compile(r"up to 90%|90% smaller|25[–-]50%|40[–-]70%|50[–-]90%|60[–-]90%|30[–-]70%|70%\+|96%|Shrink Bitmaps 95")
claim_hits = 0
for p in ["/", "/image-compressor", "/png-to-jpg", "/jpg-to-webp", "/bmp-to-jpg",
          "/compress-png-image", "/resize-image-by-percentage", "/png-to-webp", "/bmp-to-png"]:
    _, _, body = get(p)
    hits = CLAIM.findall(body)
    if hits:
        claim_hits += 1
        FAIL.append(f"percentage claim on {p}: {hits[:3]}")
        print(f"  claims on {p}: {hits[:3]} (BAD)")
    else:
        print(f"  claims on {p}: none (good)")
print(f"pages with claims: {claim_hits}")

# --- 5) category meta updated --------------------------------------------------
_, _, body = get("/categories/passport-photos")
m = re.search(r'<meta name="description" content="([^"]*)"', body)
print(f"passport category desc: {m.group(1) if m else 'NOT FOUND'}")
if m and "official size guides" in m.group(1):
    FAIL.append("passport category desc still says 'official size guides'")

print()
if FAIL:
    print(f"RESULT: {len(FAIL)} FAILURES")
    for f in FAIL:
        print(" -", f)
    sys.exit(1)
print("RESULT: ALL CHECKS PASS")
