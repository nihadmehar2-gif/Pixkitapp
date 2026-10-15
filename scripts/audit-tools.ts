/** Final completeness audit of the tool registry. Run: bun scripts/audit-tools.ts */
import { TOOLS } from "../src/lib/tools";
import { getProcessor } from "../src/lib/tools/processors";

interface Issue {
  slug: string;
  problems: string[];
}

const issues: Issue[] = [];
const add = (slug: string, p: string) => {
  let e = issues.find((i) => i.slug === slug);
  if (!e) issues.push({ slug, problems: [p] });
  else e.problems.push(p);
};

const slugs = new Set<string>();
for (const t of TOOLS) {
  if (slugs.has(t.slug)) add(t.slug, "duplicate slug");
  slugs.add(t.slug);

  if (!t.name) add(t.slug, "missing name");
  if (!t.h1) add(t.slug, "missing h1");
  if (!t.description || t.description.length < 40) add(t.slug, "missing/short description");
  if (!t.category) add(t.slug, "missing category");
  if (!t.keywords || t.keywords.length === 0) add(t.slug, "missing keywords");
  if (!t.accept || t.accept.length === 0) add(t.slug, "missing accept types");
  if (!t.processor) add(t.slug, "missing processor key");
  else if (t.processor !== "pickColor") {
    // "pickColor" is a reserved marker routed to the dedicated interactive
    // ColorPickerWorkspace in tool-page-client.tsx — not a registry processor.
    const fn = getProcessor(t.processor);
    if (typeof fn !== "function") add(t.slug, `processor "${t.processor}" not registered`);
  }
  if (!t.options) add(t.slug, "missing options array");
  if (!t.about) add(t.slug, "missing about guide");
  if (!t.seo) add(t.slug, "missing SEO block");
  else {
    if (!t.seo.metaTitle) add(t.slug, "missing seo.metaTitle");
    if (!t.seo.metaDescription) add(t.slug, "missing seo.metaDescription");
    if (!t.seo.primaryKeyword) add(t.slug, "missing seo.primaryKeyword");
    if (!t.seo.guide) add(t.slug, "missing seo.guide");
  }
  if (!t.faq || t.faq.length === 0) add(t.slug, "missing FAQ");
}

// workspace mapping: every slug must have a page at src/app/[slug] (SSG) — check via generateStaticParams equivalence
const catCount = new Map<string, number>();
for (const t of TOOLS) catCount.set(t.category, (catCount.get(t.category) ?? 0) + 1);

console.log(`TOTAL TOOLS: ${TOOLS.length}`);
console.log(`CATEGORIES: ${[...catCount.entries()].map(([c, n]) => `${c}=${n}`).join(", ")}`);
console.log(`UNIQUE SLUGS: ${slugs.size}`);
console.log(`TOOLS WITH ISSUES: ${issues.length}`);
if (issues.length) {
  for (const i of issues.slice(0, 40)) console.log(`- ${i.slug}: ${i.problems.join("; ")}`);
} else {
  console.log("ALL TOOLS COMPLETE: every tool has name/h1/description/category/keywords/accept/processor(registered)/options/about/SEO block/FAQ");
}
