/** Dump tool inventory for SEO content authoring. Run: bun scripts/dump-tools.ts */
import { TOOLS } from "../src/lib/tools";

const out = TOOLS.map((t) => ({
  slug: t.slug,
  name: t.name,
  h1: t.h1,
  desc: t.description,
  kw: t.keywords.join(" | "),
  cat: t.category,
  accept: (t.accept ?? []).join(","),
  multiple: !!t.multiple,
  options: t.options.map((o) => `${o.type}:${o.key}${o.type === "select" ? `(${o.options.map((x) => x.value).join("/")})` : ""}`),
  params: t.params ? Object.entries(t.params).map(([k, v]) => `${k}=${v}`).join(",") : "",
  processor: t.processor,
}));

console.log(JSON.stringify(out, null, 1));
console.error(`TOTAL: ${TOOLS.length}`);
// sanity checks
const slugs = TOOLS.map((t) => t.slug);
const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
console.error(`DUPLICATE SLUGS: ${dupes.length ? dupes.join(",") : "none"}`);
const bad = slugs.filter((s) => s !== s.toLowerCase() || /[^a-z0-9-]/.test(s));
console.error(`NON-CLEAN SLUGS: ${bad.length ? bad.join(",") : "none"}`);
const noAbout = TOOLS.filter((t) => !t.about).map((t) => t.slug);
console.error(`MISSING ABOUT: ${noAbout.length ? noAbout.join(",") : "none"}`);
