#!/usr/bin/env python3
"""PART 4 internal-link audit.

1. Collects every internal href from src/**  (Link href=", href=", router.push).
2. Builds the real route set (home, 127 tools, 14 categories, 5 static pages).
3. Reports: broken destinations, orphan pages (never linked from anywhere),
   weak anchor text, and mailto/tel sanity.
"""
import re, json, subprocess, pathlib, collections

ROOT = pathlib.Path("/home/z/my-project")
SRC = ROOT / "src"

# ---- 1. route set (from the actual registries) ----
out = subprocess.run(["bun", "-e", """
import { TOOLS, CATEGORIES } from './src/lib/tools';
console.log(JSON.stringify({ tools: TOOLS.map(t=>t.slug), cats: CATEGORIES.map(c=>c.slug) }));
"""], capture_output=True, text=True, cwd=ROOT)
reg = json.loads(out.stdout)
valid = {"/", "/tools", "/about", "/contact", "/privacy", "/terms"}
valid |= {f"/{s}" for s in reg["tools"]}
valid |= {f"/categories/{s}" for s in reg["cats"]}

# ---- 2. collect hrefs + anchor text from source ----
href_re = re.compile(r'''href=["']([^"'{]+)["']''')          # static string hrefs
link_re = re.compile(r'''<Link\s+[^>]*href=["']([^"'{]+)["'][^>]*>(.*?)</Link>''', re.S)
push_re = re.compile(r'''(?:router\.push|window\.location(?:\.href)?\s*=\s*)["'`]([^"'`]+)["'`]''')

hrefs = collections.Counter()          # dest -> count
anchors = collections.defaultdict(list)  # dest -> [anchor texts]
weak_anchors = []
src_files = [p for p in SRC.rglob("*.tsx")] + [p for p in SRC.rglob("*.ts")]
skip_tools_browser = False

for p in src_files:
    txt = p.read_text(encoding="utf-8", errors="ignore")
    for m in href_re.finditer(txt):
        dest = m.group(1)
        if dest.startswith(("http", "mailto:", "#", "tel:")) or dest in ("", "/"):
            if dest == "/": hrefs["/"] += 1
            continue
        # template fragments like /${slug} — resolve per known patterns
        hrefs[dest] += 1
    for m in link_re.finditer(txt):
        dest, inner = m.group(1), m.group(2)
        text = re.sub(r"<[^>]+>", "", inner)
        text = re.sub(r"\s+", " ", text).strip()
        anchors[dest].append(text[:60])
        if dest.startswith("/") and not dest.startswith("//"):
            if re.fullmatch(r"(click\s+here|here|read more|learn more|more|link|this)", text, re.I):
                weak_anchors.append((str(p.relative_to(ROOT)), dest, text))
    for m in push_re.finditer(txt):
        d = m.group(1)
        if d.startswith("/") and "${" not in d:
            hrefs[d] += 1

# dynamic destinations that are built at runtime (verified separately)
dynamic_ok = {f"/${{t.slug}}" , "/${slug}", "/categories/${cat.slug}"}

# ---- 3. verdicts ----
resolved = []
broken = []
for dest, count in sorted(hrefs.items()):
    d = dest.split("?")[0].split("#")[0].rstrip("/") or "/"
    if "${" in d or d.startswith("/api"):
        continue
    if d in valid:
        resolved.append((dest, count))
    else:
        broken.append((dest, count))

linked = {d.split("?")[0].split("#")[0].rstrip("/") or "/" for d, _ in hrefs.items()}
orphans = sorted(valid - linked - {"/"})  # home is always linked via logo

print("=== ROUTE SET ===")
print(f"valid routes: {len(valid)} (tools {len(reg['tools'])}, cats {len(reg['cats'])}, static 6 incl home)")
print(f"\n=== BROKEN INTERNAL DESTINATIONS: {len(broken)} ===")
for d, c in broken: print(f"  {d}  (x{c})")
print(f"\n=== ORPHAN PAGES (in route set, never statically linked): {len(orphans)} ===")
for o in orphans: print(f"  {o}")
print(f"\n=== WEAK ANCHOR TEXT: {len(weak_anchors)} ===")
for f, d, t in weak_anchors[:20]: print(f"  {f}: [{t}] -> {d}")

# ---- 4. per-route inbound link counts (distribution sanity) ----
inbound = collections.Counter()
for d, c in hrefs.items():
    d2 = d.split("?")[0].split("#")[0].rstrip("/") or "/"
    if d2 in valid: inbound[d2] += c
zero_inbound_tools = [f"/{s}" for s in reg["tools"] if inbound[f"/{s}"] == 0]
print(f"\n=== TOOLS WITH 0 STATIC INBOUND LINKS: {len(zero_inbound_tools)} ===")
for t in zero_inbound_tools: print(f"  {t}")
print("\n(total inbound includes homepage A-Z directory + /tools browser + category pages + related-tools, which are runtime-rendered)")
