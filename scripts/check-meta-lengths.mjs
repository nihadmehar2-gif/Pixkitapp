#!/usr/bin/env node
/**
 * Offline metadata length checker — fast iteration without rebuilding.
 * Imports the real tool registry + SEO defs and computes the exact
 * rendered title ("metaTitle | PixKitApp") and description lengths.
 * Usage: bun scripts/check-meta-lengths.mjs [toolSlugFilter]
 */
import { TOOLS } from "../src/lib/tools/index.ts";
import { SEO_BY_SLUG } from "../src/lib/tools/seo/index.ts";
import { CATEGORIES } from "../src/lib/tools/categories.ts";

const filter = process.argv[2] || "";
const rows = [];

for (const t of TOOLS) {
  const seo = SEO_BY_SLUG[t.slug];
  if (!seo) { rows.push({ slug: t.slug, title: -1, tl: -1, desc: "<MISSING SEO>", dl: -1 }); continue; }
  const title = `${seo.metaTitle} | PixKitApp`;
  rows.push({ slug: t.slug, tl: title.length, dl: seo.metaDescription.length, title, desc: seo.metaDescription });
}

const badT = rows.filter(r => filter && r.slug.includes(filter) && (r.tl < 50 || r.tl > 60));
const badD = rows.filter(r => filter && r.slug.includes(filter) && (r.dl < 150 || r.dl > 160));

if (filter === "--stats") {
  const inT = rows.filter(r => r.tl >= 50 && r.tl <= 60).length;
  const inD = rows.filter(r => r.dl >= 150 && r.dl <= 160).length;
  console.log(`tools: ${rows.length} | titles 50-60: ${inT} | descs 150-160: ${inD}`);
  console.log("titles out:", rows.filter(r => r.tl < 50 || r.tl > 60).map(r => `${r.slug}(${r.tl})`).join(" "));
  console.log("descs out:", rows.filter(r => r.dl < 150 || r.dl > 160).map(r => `${r.slug}(${r.dl})`).join(" "));
} else {
  for (const r of badD) console.log(`${r.slug}\t${r.dl}c\t${r.desc}`);
  if (badT.length && !badD.length) for (const r of badT) console.log(`${r.slug}\tTITLE ${r.tl}c\t${r.title}`);
}

// Category descriptions (used by category page metadata)
if (filter === "--cats") {
  for (const c of CATEGORIES) {
    console.log(`${c.id}\tdesc(${(c.description || "").length})\tname=${c.name}\tdesc=${c.description}`);
  }
}
