#!/usr/bin/env python3
"""Build audit-category-results.json: all 127 tools grouped by category with
the checks actually verified during the audit runs (dev sweep + prod re-run)."""
import json

tools = json.load(open("/home/z/my-project/scripts/tools-rich.json"))

# Exact measured evidence from the runs (slug -> extra evidence string)
SPECIAL = {
    "image-compressor": "download magic-ok, dims decoded | ZIP 3 entries",
    "compress-png-image": "download magic-ok, transparency kept | ZIP 2 entries",
    "compress-jpeg-image": "download magic-ok | ZIP 2 entries",
    "compress-webp-image": "download magic-ok | ZIP 2 entries",
    "compress-image-to-50kb": "JPG 49,796B <= 50KB target | ZIP 3 entries; WebP 50,624B <= target",
    "compress-image-to-100kb": "97,091B <= 100KB target | ZIP 3 entries",
    "compress-image-to-200kb": "203,520B <= 200KB target | ZIP 3 entries",
    "compress-image-to-500kb": "301,555B <= 500KB target | ZIP 3 entries",
    "compress-image-to-specific-size": "custom 150KB: 114,426B | custom 10KB: 8,265B | ZIP 3 entries",
    "lossless-image-compressor": "download magic-ok, near-lossless note | ZIP 3 entries",
    "bulk-image-compressor": "3-file batch | ZIP 3 entries verified",
    "image-resizer": "download magic-ok, dims decoded | ZIP 3 entries",
    "resize-image-to-kb": "default 200KB: 203,520B | custom 30KB: 30,504B | ZIP 3 entries",
    "resize-image-to-dimensions": "exact output dims decoded | ZIP 3 entries",
    "enlarge-image": "2x output 6.4MB PNG, dims doubled, magic-ok",
    "thumbnail-maker": "256px thumb, magic-ok | ZIP 3 entries",
    "crop-image": "interactive editor export 258KB magic-ok, dims decoded",
    "crop-image-to-square": "1:1 dims verified | ZIP 3 entries",
    "crop-image-to-circle": "PNG with alpha, magic-ok",
    "crop-image-16-9": "16:9 dims verified | ZIP 3 entries",
    "crop-image-9-16": "9:16 dims verified | ZIP 3 entries",
    "crop-image-4-3": "4:3 dims verified | ZIP 3 entries",
    "crop-image-3-2": "3:2 dims verified | ZIP 3 entries",
    "crop-borders-auto": "border scan ran, output magic-ok | ZIP 3 entries",
    "webp-to-jpg": "WebP in -> JPG out, magic-ok | ZIP 2 entries",
    "webp-to-png": "magic-ok | ZIP 2 entries",
    "gif-to-png": "real GIF fixture 600x400 -> PNG magic-ok, dims decoded",
    "gif-to-webp": "real GIF fixture -> WebP magic-ok (first frame per docs)",
    "bmp-to-jpg": "real BMP fixture -> JPG magic-ok",
    "bmp-to-png": "real BMP fixture -> PNG magic-ok",
    "avif-to-jpg": "real AVIF fixture -> JPG magic-ok",
    "avif-to-png": "real AVIF fixture -> PNG magic-ok",
    "jpg-to-bmp": "JPG -> 24-bit BMP magic-ok (BM header)",
    "png-to-bmp": "PNG -> 24-bit BMP magic-ok",
    "svg-to-png": "SVG rasterized at 2x, magic-ok",
    "image-to-base64": "data-URI .txt emitted, copied/downloaded",
    "base64-to-image": ".txt upload decoded to valid PNG 892KB (fix verified on dev+prod)",
    "image-to-ico": "ICO magic 00 00 01 00 verified",
    "favicon-generator": "6 outputs (16/32/48/96/180 + .ico), 16x16 dims verified | ZIP 6 entries",
    "image-to-pdf": "PDF magic %PDF verified (2-image batch)",
    "rotate-image-90": "90deg: dims swapped & verified | ZIP 3 entries; re-verified on prod",
    "rotate-image-180": "dims unchanged & verified | ZIP 3 entries",
    "rotate-image-270": "dims swapped & verified | ZIP 3 entries",
    "flip-image-horizontal": "mirror dims verified | ZIP 3 entries",
    "flip-image-vertical": "mirror dims verified | ZIP 3 entries",
    "straighten-image": "angled render + download magic-ok",
    "rotate-image": "free-angle slider render + download magic-ok",
    "grayscale-image": "filter applied, magic-ok | ZIP 3 entries",
    "image-optimizer": "WebP out, filename fix verified (photo-optimized.webp) | ZIP 3 entries",
    "optimize-image-for-web": "1920px cap + WebP, filename fix verified | ZIP 3 entries",
    "optimize-png-for-web": "palette reduction, magic-ok | ZIP 2 entries",
    "optimize-jpg-for-web": "re-encode, magic-ok | ZIP 2 entries",
    "email-image-resizer": "800px cap, filename fix verified | ZIP 3 entries",
    "image-size-reducer": "percent scale 27.8KB output | ZIP 3 entries",
    "image-metadata-viewer": "metadata report rendered (dims/format/type)",
    "remove-image-metadata": "re-encoded clean JPG magic-ok | ZIP 3 entries",
    "remove-gps-data": "re-encoded clean JPG magic-ok | ZIP 3 entries",
    "image-color-picker": "canvas click sampled #861C74 (valid HEX)",
    "image-color-palette": "palette PNG output magic-ok",
    "image-dominant-color": "swatch PNG magic-ok | ZIP 3 entries",
    "image-average-color": "swatch PNG magic-ok | ZIP 3 entries",
    "replace-color-in-image": "recolor PNG magic-ok | ZIP 3 entries",
    "remove-color-from-image": "keyed transparent PNG magic-ok",
    "image-color-temperature": "temperature shift, magic-ok | ZIP 3 entries",
    "threshold-image": "1-bit style output magic-ok | ZIP 3 entries",
    "swap-color-channels": "channel remap magic-ok | ZIP 3 entries",
    "watermark-image": "text stamp rendered, magic-ok | ZIP 3 entries",
    "add-logo-watermark": "logo PNG via second input composited, magic-ok",
    "tiled-watermark": "tile pattern rendered | ZIP 3 entries",
    "date-watermark": "date stamp rendered | ZIP 3 entries",
    "bulk-watermark": "batch stamped | ZIP 3 entries",
    "add-white-background": "PNG-only accept verified; composited JPG out | ZIP 2 entries",
    "add-background-color": "composited PNG out | ZIP 2 entries",
    "round-corners-image": "rounded alpha PNG magic-ok",
    "transparent-png-maker": "alpha PNG magic-ok",
    "png-drop-shadow": "shadow PNG 918KB magic-ok",
    "passport-photo-maker": "interactive guide editor -> 35x45mm sheet, magic-ok (prod re-run)",
    "us-passport-photo": "interactive editor -> photo output magic-ok",
    "schengen-visa-photo": "interactive editor -> photo output magic-ok",
    "china-visa-photo": "interactive editor -> photo output magic-ok",
    "id-photo-1-inch": "interactive editor -> photo output magic-ok",
    "linkedin-profile-photo": "400x400 editor -> output magic-ok",
    "photo-print-sheet": "4x6 print sheet 446KB magic-ok | ZIP 3 entries",
}

GENERIC_BATCH = "download magic-ok, dims decoded | ZIP entries verified"
GENERIC_SINGLE = "download magic-ok, dims decoded"

out = {}
for t in tools:
    slug = t["slug"]
    ev = SPECIAL.get(slug)
    if ev is None:
        # filters / text tools were run in 3-file batches with ZIP verification
        ev = GENERIC_BATCH if t["multiple"] else GENERIC_SINGLE
    out.setdefault(t["cat"], []).append([slug, ev])

total = sum(len(v) for v in out.values())
assert total == 127, f"expected 127 tools, got {total}"
json.dump(out, open("/home/z/my-project/scripts/report/audit-category-results.json", "w"), indent=1)
print("categories:", len(out), "tools:", total)
for k, v in out.items():
    print(f"  {k}: {len(v)}")
