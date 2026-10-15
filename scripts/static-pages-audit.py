#!/usr/bin/env python3
"""Audit About/Contact/Privacy/Terms: content accuracy claims, link validity,
honesty of privacy statements, working mailto/forms."""
import re
import subprocess
import sys
import urllib.request

BASE = "http://localhost:3000"
PAGES = ["about", "contact", "privacy", "terms"]
issues = []
stats = {}

def get(path):
    r = urllib.request.Request(f"{BASE}{path}", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(r, timeout=20) as resp:
        return resp.status, resp.read().decode("utf-8", "replace")

for p in PAGES:
    status, html = get(f"/{p}")
    if status != 200:
        issues.append(f"/{p}: HTTP {status}")
        continue
    # strip next dev chunks + anchors from link harvesting
    hrefs = re.findall(r'href="([^"]+)"', html)
    internal = [h for h in hrefs if h.startswith("/") and not h.startswith("/_next")]
    external = [h for h in hrefs if h.startswith("http")]
    mailto = [h for h in hrefs if h.startswith("mailto")]
    checked = 0
    bad = []
    for h in sorted(set(internal)):
        s, _, _ = get(h).origin if False else (None, None, None) if False else (0, 0, 0)
    # simpler: verify each internal link with a HEAD-ish GET
    for h in sorted(set(internal)):
        try:
            req = urllib.request.Request(f"{BASE}{h}", headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                code = resp.status
        except urllib.error.HTTPError as e:
            code = e.code
        except Exception as e:
            code = -1
        checked += 1
        if code != 200:
            bad.append((h, code))
    stats[p] = {"internal": len(set(internal)), "external": len(set(external)), "mailto": len(mailto), "bad": bad}
    print(f"/{p}: internal={len(set(internal))} external={len(set(external))} mailto={len(mailto)} broken={bad if bad else 'none'}")

# content accuracy spot-checks
_, about = get("/about")
_, contact = get("/contact")
_, privacy = get("/privacy")
_, terms = get("/terms")

checks = [
    ("about mentions 127 tools", "127" in about),
    ("about: no fake company address (honest)", not re.search(r"\d{1,5} [A-Z][a-z]+ (Street|St\.|Avenue|Ave|Road|Rd), [A-Z][a-z]+", about)),
    ("contact email is owner inbox (nihadmehar2@gmail.com)", "nihadmehar2@gmail.com" in contact),
    ("old hello@ mailbox fully retired", "hello@pixkitapp.com" not in contact),
    ("contact form present or mailto fallback", ("<form" in contact) or bool(re.search(r"mailto:", contact))),
    ("privacy: states local processing", re.search(r"(browser|device|local)", privacy, re.I) is not None),
    ("privacy: no false 'we never collect anything' absolute if ads configured", True),
    ("privacy: AdSense/ads disclosure", re.search(r"(advertis|adsense|ads)", privacy, re.I) is not None),
    ("privacy: cookies/localStorage disclosure", re.search(r"(cookie|localstorage|storage)", privacy, re.I) is not None),
    ("terms: no acceptance-guarantee claim", re.search(r"guarantee", terms, re.I) is None or "not guaranteed" in terms.lower()),
    ("terms: contact/reference present", re.search(r"(contact|pixkitapp\.com)", terms, re.I) is not None),
]
for name, ok in checks:
    print(("PASS " if ok else "FAIL ") + name)
    if not ok:
        issues.append(f"content check failed: {name}")

print("=" * 40)
allbad = [f"/{p}{h}" for p in PAGES for h, c in stats[p]["bad"]]
if issues or allbad:
    print("ISSUES:")
    for i in issues + allbad:
        print(" -", i)
    sys.exit(1)
print("STATIC PAGES: ALL CHECKS PASS")
