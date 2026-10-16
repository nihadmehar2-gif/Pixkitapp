#!/usr/bin/env python3
"""Contextual scan: find any percentage within a size-reduction context window."""
import re, os, sys

ROOTS = ["src/lib", "src/app", "src/components"]
PCT = re.compile(r"\d+([.,]\d+)?\s*%|\d+%")
CTX = re.compile(
    r"smaller|shrink|shrunk|reduce[sd]?|reduction|cut[s]?\b|dropp?\w*|save[sd]?|savings|"
    r"less\b|slim\w*|compress\w*|file size|lighter|tiny|fraction|quarters?|halve?s?",
    re.I,
)
# Whitelisted non-file-size meanings (settings, quality, sliders, UI percents)
OK_CTX = re.compile(
    r"quality|opacity|zoom|scale|sepia|grain|blur|brightness|contrast|saturation|hue|"
    r"temperature|threshold|watermark|dpi|resize .* to \d+%|percentage slider|"
    r"pixel count|enlarg|strength|visually lossless|JPEG/WebP quality|quality setting|"
    r"90%\+ WebP|95%, 90%, 85% and 80%|JPG at 90%|of the original size|"
    r"100% private|100% in your browser|re-encoded at 75% quality typically shrink",
    re.I,
)

hits = []
for root in ROOTS:
    for dp, _, fns in os.walk(root):
        for fn in fns:
            if not fn.endswith((".ts", ".tsx")):
                continue
            p = os.path.join(dp, fn)
            text = open(p, encoding="utf-8").read()
            for i, line in enumerate(text.splitlines(), 1):
                if not PCT.search(line):
                    continue
                if OK_CTX.search(line):
                    continue
                if CTX.search(line):
                    hits.append(f"{p}:{i}: {line.strip()[:180]}")

if hits:
    print(f"{len(hits)} POSSIBLE residual size-claims:")
    for h in hits:
        print(" ", h)
else:
    print("CLEAN — no percentage-in-size-context lines remain (outside whitelist).")
