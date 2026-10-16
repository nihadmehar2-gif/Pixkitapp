#!/usr/bin/env bun
/** Report-only: compare near-duplicate tool texts (KB variants, crop ratios, rotate angles). */
import { TOOLS } from "../src/lib/tools";

const groups: Record<string, string[]> = {
  "Compress-to-KB variants": [
    "compress-image-to-50kb", "compress-image-to-100kb", "compress-image-to-200kb", "compress-image-to-500kb",
  ],
  "Crop aspect variants": ["crop-image-16-9", "crop-image-9-16", "crop-image-4-3", "crop-image-3-2"],
  "Rotate variants": ["rotate-image-90", "rotate-image-180", "rotate-image-270"],
};

for (const [label, slugs] of Object.entries(groups)) {
  console.log(`\n════════ ${label} ════════`);
  for (const s of slugs) {
    const t = TOOLS.find((x) => x.slug === s);
    if (!t) { console.log(`  !! ${s} NOT FOUND`); continue; }
    const seoT = t.seo?.metaTitle ?? "(no seo title)";
    console.log(`\n--- ${s} ---`);
    console.log(`  metaTitle:       ${seoT} | PixKitApp`);
    console.log(`  metaDescription: ${t.seo?.metaDescription ?? t.description}`);
    console.log(`  about/intro:     ${(t.about ?? t.seo?.guide.how ?? "").slice(0, 220)}...`);
  }
}
