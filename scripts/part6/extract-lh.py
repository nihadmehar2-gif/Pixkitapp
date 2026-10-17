#!/usr/bin/env python3
"""PART 6: extract category scores + core web vitals + JS transfer from all
Lighthouse JSON generations (baseline -> clean -> clean2 -> final2 -> final3)."""
import json, glob, os

FILES = [
    ("baseline", "scripts/lh5-home-baseline.json", "home"),
    ("baseline", "scripts/lh5-tool-baseline.json", "tool"),
    ("clean (P5 run1)", "scripts/lh5-home-clean.json", "home"),
    ("clean (P5 run1)", "scripts/lh5-tool-clean.json", "tool"),
    ("clean2 (P5 run2)", "scripts/lh5-home-clean2.json", "home"),
    ("clean2 (P5 run2)", "scripts/lh5-tool-clean2.json", "tool"),
    ("final2 (P5 final)", "scripts/lh5-home-final2.json", "home"),
    ("final2 (P5 final)", "scripts/lh5-tool-final2.json", "tool"),
    ("final3 (PART 6)", "scripts/lh5-home-final3.json", "home"),
    ("final3 (PART 6)", "scripts/lh5-tool-final3.json", "tool"),
]

def get(d, path, default=None):
    cur = d
    for p in path:
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            return default
    return cur

rows = []
for label, path, page in FILES:
    if not os.path.exists(path):
        rows.append((label, page, "MISSING FILE", None))
        continue
    d = json.load(open(path))
    cats = {}
    for k in ("performance", "accessibility", "best-practices", "seo"):
        cats[k] = get(d, ["categories", k, "score"])
    lcp = get(d, ["audits", "largest-contentful-paint", "numericValue"])
    cls = get(d, ["audits", "cumulative-layout-shift", "numericValue"])
    tbt = get(d, ["audits", "total-blocking-time", "numericValue"])
    si = get(d, ["audits", "speed-index", "numericValue"])
    srt = get(d, ["audits", "server-response-time", "numericValue"])
    tbw = get(d, ["audits", "total-byte-weight", "numericValue"])
    # JS transfer from Lighthouse's own network-requests audit
    net = get(d, ["audits", "network-requests", "details", "items"], []) or []
    js_bytes = sum(r.get("transferSize", 0) for r in net if r.get("resourceType") == "Script")
    js_count = sum(1 for r in net if r.get("resourceType") == "Script")
    img_bytes = sum(r.get("transferSize", 0) for r in net if r.get("resourceType") == "Image")
    font_bytes = sum(r.get("transferSize", 0) for r in net if r.get("resourceType") == "Font")
    total_bytes = sum(r.get("transferSize", 0) for r in net)
    reqs = len(net)
    rows.append((label, page, dict(
        perf=cats["performance"], a11y=cats["accessibility"], bp=cats["best-practices"],
        seo=cats["seo"], lcp=lcp, cls=cls, tbt=tbt, si=si, srt=srt,
        tbw=tbw, js=js_bytes, js_n=js_count, img=img_bytes, font=font_bytes,
        total=total_bytes, reqs=reqs), None))

print(f"{'run':<20} {'page':<5} {'perf':>5} {'a11y':>5} {'bp':>5} {'seo':>5} "
      f"{'LCP_s':>6} {'CLS':>6} {'TBT_ms':>7} {'SI_s':>6} {'JS_KB':>6} {'JS#':>4} {'total_KB':>8} {'reqs':>5}")
for label, page, payload, _ in rows:
    if payload == "MISSING FILE" or payload is None:
        print(f"{label:<20} {page:<5} {payload}")
        continue
    f = lambda v, div=1: "?" if v is None else f"{v/div:.2f}"
    print(f"{label:<20} {page:<5} {f(payload['perf']):>5} {f(payload['a11y']):>5} {f(payload['bp']):>5} {f(payload['seo']):>5} "
          f"{f(payload['lcp'],1000):>6} {f(payload['cls']):>6} {f(payload['tbt']):>7} {f(payload['si'],1000):>6} "
          f"{f(payload['js'],1024):>6} {payload['js_n']:>4} {f(payload['total'],1024):>8} {payload['reqs']:>5}")

# persist machine-readable summary
summary = [{"run": l, "page": p, **(x if isinstance(x, dict) else {"error": x})}
           for l, p, x, _ in rows]
with open("scripts/part6/lh-summary.json", "w") as f:
    json.dump(summary, f, indent=1)
print("\nsaved scripts/part6/lh-summary.json")
