"""Diagnose keyword stuffing + duplicate content findings in detail."""
import json, re
from collections import defaultdict

BASE = "http://localhost:3000"
audit = json.load(open("/home/z/my-project/scripts/seo-audit.json"))

# --- which pairs share the most 8-grams, and what are those shingles? -------
kw_map = json.load(open("/home/z/my-project/scripts/keyword-map.json"))
slugs = [e["slug"] for e in kw_map]

def fetch_words(path):
    import urllib.request
    from html.parser import HTMLParser
    class P(HTMLParser):
        def __init__(self):
            super().__init__(); self.buf=[]; self.skip=0
        def handle_starttag(self, tag, attrs):
            if tag in ("script","style","noscript"): self.skip+=1
        def handle_endtag(self, tag):
            if tag in ("script","style","noscript") and self.skip: self.skip-=1
        def handle_data(self, d):
            if not self.skip: self.buf.append(d)
    html = urllib.request.urlopen(BASE+path).read().decode("utf-8","replace")
    p = P(); p.feed(html)
    return " ".join(" ".join(p.buf).split()).lower().split()

words = {s: fetch_words("/"+s) for s in slugs}

def shingles(s, n=8, stride=4):
    t = words[s]
    return set(tuple(t[i:i+n]) for i in range(0, max(1,len(t)-n), stride))

sh = {s: shingles(s) for s in slugs}
inv = defaultdict(set)
for s in slugs:
    for g in sh[s]: inv[g].add(s)
pair = defaultdict(list)
for g, ss in inv.items():
    if len(ss) > 1:
        ss = sorted(ss)
        for i in range(len(ss)):
            for j in range(i+1, len(ss)):
                pair[(ss[i], ss[j])].append(g)

top = sorted(pair.items(), key=lambda kv: -len(kv[1]))[:8]
print("=== TOP DUPLICATE PAIRS ===")
for (a,b), gs in top:
    # reconstruct a shared sentence sample
    sample = " ".join(gs[0])
    print(f"{a} <-> {b}: {len(gs)} shared 8-grams | sample: \"{sample[:100]}\"")

print("\n=== KEYWORD DENSITY >3% (full list) ===")
km = {e["slug"]: e["primaryKeyword"] for e in kw_map}
for s in slugs:
    text = " ".join(words[s])
    pk = km[s].lower()
    occ = len(re.findall(re.escape(pk), text))
    dens = occ * len(pk.split()) / len(words[s]) * 100
    if dens > 3.0:
        print(f"{s}: {dens:.2f}%  ({occ}x '{pk}' in {len(words[s])} words)")

# where does the keyword repeat? count per section: title/h1 are fine; find FAQ/guide overuse
print("\n=== CONTEXT SAMPLES (bulk-image-compressor) ===")
s = "bulk-image-compressor"
text = " ".join(words[s])
for m in re.finditer(re.escape(km[s].lower()), text):
    a, b = max(0, m.start()-45), min(len(text), m.end()+45)
    print("  ...", text[a:b].replace("\n"," "), "...")
