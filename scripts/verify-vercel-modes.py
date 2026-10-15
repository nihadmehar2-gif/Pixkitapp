#!/usr/bin/env python3
"""
Verify that the site emits the correct SEO/indexing artifacts for each
deployment environment, simulating exactly what Vercel builds produce.

Modes:
  none        — no VERCEL_ENV, no NEXT_PUBLIC_INDEXING_MODE (self-hosted /
                ChatZ sandbox production mode)  -> must be INDEXABLE
  production  — VERCEL_ENV=production (Vercel prod deploy) -> must be INDEXABLE
  preview     — VERCEL_ENV=preview (Vercel branch/PR deploy) -> must be NOINDEX
  explicit    — NEXT_PUBLIC_INDEXING_MODE=preview (local dev daemon .env.preview)
                -> must be NOINDEX

Checks per mode (against `next build` output in .next/):
  1. Home HTML robots meta (index,follow vs noindex,nofollow)
  2. robots.txt  (Allow + Sitemap vs Disallow-all + no Sitemap)
  3. sitemap.xml (147 URLs vs empty urlset)
  4. routes-manifest.json X-Robots-Tag header (absent vs present)
  5. sample tool + category page robots meta
  6. og-image.png shipped in standalone public/
  7. canonical + og:image absolute production URL on home
"""
import json
import os
import re
import shutil
import subprocess
import sys

PROJECT = "/home/z/my-project"
APP_DIR = os.path.join(PROJECT, ".next", "server", "app")

MODES = {
    "none":       {"VERCEL_ENV": None, "NEXT_PUBLIC_INDEXING_MODE": None, "expect": "prod"},
    "production": {"VERCEL_ENV": "production", "NEXT_PUBLIC_INDEXING_MODE": None, "expect": "prod"},
    "preview":    {"VERCEL_ENV": "preview", "NEXT_PUBLIC_INDEXING_MODE": None, "expect": "preview"},
    "explicit":   {"VERCEL_ENV": None, "NEXT_PUBLIC_INDEXING_MODE": "preview", "expect": "preview"},
}

BUN = shutil.which("bun") or "/usr/local/bin/bun"


def build(mode: str) -> None:
    cfg = MODES[mode]
    env = {k: v for k, v in os.environ.items() if k not in ("VERCEL_ENV", "NEXT_PUBLIC_INDEXING_MODE")}
    env["NEXT_TELEMETRY_DISABLED"] = "1"
    if cfg["VERCEL_ENV"]:
        env["VERCEL_ENV"] = cfg["VERCEL_ENV"]
    if cfg["NEXT_PUBLIC_INDEXING_MODE"]:
        env["NEXT_PUBLIC_INDEXING_MODE"] = cfg["NEXT_PUBLIC_INDEXING_MODE"]

    dotnext = os.path.join(PROJECT, ".next")
    if os.path.isdir(dotnext):
        shutil.rmtree(dotnext)

    r = subprocess.run(
        [BUN, "run", "build"], cwd=PROJECT, env=env, capture_output=True, text=True, timeout=600
    )
    if r.returncode != 0:
        print(f"[{mode}] BUILD FAILED:\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}")
        sys.exit(1)
    m = re.search(r"Generating static pages \((\d+)\)", r.stdout)
    pages = m.group(1) if m else "count-unknown"
    print(f"[{mode}] build OK, static pages: {pages}")


def read(path: str) -> str:
    with open(path, encoding="utf-8", errors="replace") as f:
        return f.read()


def check(mode: str) -> None:
    cfg = MODES[mode]
    expect_prod = cfg["expect"] == "prod"
    failures = []

    def req(cond: bool, label: str, want: str) -> None:
        status = "PASS" if cond else "FAIL"
        print(f"  [{status}] {label} (want {want})")
        if not cond:
            failures.append(label)

    # --- 1+7: home HTML -----------------------------------------------------
    home_path = os.path.join(APP_DIR, "index.html")
    home = read(home_path)
    has_noindex = "noindex" in home
    req(expect_prod != has_noindex, "home robots meta", "index,follow" if expect_prod else "noindex,nofollow")
    req('rel="canonical" href="https://pixkitapp.com"' in home,
        "home canonical = production root", "https://pixkitapp.com")
    req('property="og:image" content="https://pixkitapp.com/og-image.png"' in home,
        "home og:image absolute production URL", "https://pixkitapp.com/og-image.png")

    # --- 2: robots.txt -------------------------------------------------------
    robots = ""
    for name in ("robots.txt.body", "robots.txt"):
        p = os.path.join(APP_DIR, name)
        if os.path.exists(p):
            robots = read(p)
            break
    req(bool(robots), "robots.txt prerendered", "exists")
    if expect_prod:
        req("Allow: /" in robots, "robots Allow all", "Allow: /")
        req("Sitemap: https://pixkitapp.com/sitemap.xml" in robots, "robots Sitemap ref", "present")
    else:
        req("Disallow: /" in robots, "robots Disallow all", "Disallow: /")
        req("Sitemap" not in robots, "robots has no Sitemap ref", "absent")

    # --- 3: sitemap.xml ------------------------------------------------------
    smap = ""
    for name in ("sitemap.xml.body", "sitemap.xml"):
        p = os.path.join(APP_DIR, name)
        if os.path.exists(p):
            smap = read(p)
            break
    locs = re.findall(r"<loc>([^<]+)</loc>", smap)
    if expect_prod:
        req(len(locs) == 147, f"sitemap URL count ({len(locs)})", "147")
        req(all(l.startswith("https://pixkitapp.com") for l in locs), "sitemap all https production", "yes")
    else:
        req(len(locs) == 0, f"sitemap URL count ({len(locs)})", "0 (empty)")

    # --- 4: X-Robots-Tag header in routes manifest ---------------------------
    manifest = read(os.path.join(PROJECT, ".next", "routes-manifest.json"))
    has_header = "X-Robots-Tag" in manifest
    req(expect_prod != has_header, "X-Robots-Tag header config", "absent" if expect_prod else "present")

    # --- 5: sample tool + category pages -------------------------------------
    sample = read(os.path.join(APP_DIR, "image-compressor.html"))
    req(("noindex" in sample) != expect_prod, "tool page robots meta",
        "index,follow" if expect_prod else "noindex,nofollow")
    # pick first category html found
    cat = None
    catdir = os.path.join(APP_DIR, "categories")
    if os.path.isdir(catdir):
        for f in sorted(os.listdir(catdir)):
            if f.endswith(".html"):
                cat = read(os.path.join(catdir, f))
                break
    if cat:
        req(("noindex" in cat) != expect_prod, "category page robots meta",
            "index,follow" if expect_prod else "noindex,nofollow")
    else:
        print("  [WARN] no category page artifact found (skipped)")

    # --- 6: og-image in standalone output ------------------------------------
    og = os.path.join(PROJECT, ".next", "standalone", "public", "og-image.png")
    req(os.path.exists(og), "og-image.png in standalone public", "exists")

    if failures:
        print(f"[{mode}] RESULT: {len(failures)} FAILURE(S): {failures}\n")
        sys.exit(1)
    print(f"[{mode}] RESULT: all checks passed\n")


if __name__ == "__main__":
    modes = sys.argv[1:] or ["none", "production", "preview", "explicit"]
    print(f"Verifying Vercel build modes: {', '.join(modes)}\n")
    for mode in modes:
        if mode not in MODES:
            print(f"Unknown mode: {mode}")
            sys.exit(2)
        build(mode)
        check(mode)
    print("ALL MODES VERIFIED — production indexable, Vercel previews auto-noindex.")
