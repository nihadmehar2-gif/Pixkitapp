/** Dump full tool + SEO inventory for keyword mapping. Run: bun scripts/dump-seo-inventory.ts */
import { TOOLS } from "../src/lib/tools";
import { CATEGORIES } from "../src/lib/tools/categories";
import fs from "fs";

const catName = new Map(CATEGORIES.map((c) => [c.id, c.name]));
const catSlug = new Map(CATEGORIES.map((c) => [c.id, c.slug]));

const rows = TOOLS.map((t) => ({
  slug: t.slug,
  url: `https://pixkitapp.com/${t.slug}`,
  name: t.name,
  h1: t.h1,
  description: t.description,
  category: catName.get(t.category) ?? t.category,
  categorySlug: catSlug.get(t.category) ?? t.category,
  accept: (t.accept ?? []).join(","),
  multiple: !!t.multiple,
  options: t.options.map((o) => `${o.type}:${o.key}${o.type === "select" ? `(${o.options.map((x) => x.value).join("/")})` : ""}`),
  seo: t.seo
    ? {
        title: t.seo.metaTitle,
        description: t.seo.metaDescription,
        primaryKeyword: t.seo.primaryKeyword,
      }
    : null,
  faqCount: t.faq?.length ?? 0,
  keywords: t.keywords,
}));

const cats = CATEGORIES.map((c) => ({ id: c.id, slug: c.slug, name: c.name, tools: TOOLS.filter((t) => t.category === c.id).length }));

fs.writeFileSync("/home/z/my-project/scripts/seo-inventory.json", JSON.stringify({ categories: cats, tools: rows }, null, 1));
console.error(`TOOLS: ${rows.length}, CATEGORIES: ${cats.length}`);
console.error(`NO SEO: ${rows.filter((r) => !r.seo).length}`);
console.error(`NO FAQ: ${rows.filter((r) => r.faqCount === 0).length}`);
