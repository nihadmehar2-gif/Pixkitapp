/** Node-side dump for the single-file build:
 *  1. Full tool registry JSON (incl. options, about, faq, seo)
 *  2. lucide icon SVG map (every icon name the registry references)
 *  3. Server-rendered HTML for the About / Privacy / Terms pages
 *     (rendered from the REAL page components via react-dom/server)
 * Run via: esbuild-bundle then `node`. Writes /tmp/singlefile-meta.json */
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { TOOLS, SITE_URL, popularTools, categoriesWithCounts } from "@/lib/tools";
import { CATEGORIES } from "@/lib/tools/categories";
import AboutPage from "@/app/about/page";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import * as Lucide from "lucide-react";
import { writeFileSync } from "node:fs";

// ---- 1. registry -----------------------------------------------------------
const tools = TOOLS.map((t) => ({
  slug: t.slug, name: t.name, h1: t.h1, description: t.description,
  keywords: t.keywords, category: t.category, icon: t.icon,
  popular: !!t.popular, accept: t.accept ?? [], multiple: !!t.multiple,
  interactive: t.interactive ?? null, options: t.options, params: t.params ?? {},
  processor: t.processor, about: t.about ?? "", faq: t.faq ?? [],
  seo: t.seo ? { metaTitle: t.seo.metaTitle, metaDescription: t.seo.metaDescription } : null,
}));
const categories = CATEGORIES.map((c) => ({ ...c }));
const counts = Object.fromEntries(categoriesWithCounts().map((c) => [c.id, c.count]));
const popular = popularTools(8).map((t) => t.slug);

// ---- 2. icons ---------------------------------------------------------------
const iconNames = new Set<string>();
for (const t of TOOLS) iconNames.add(t.icon);
for (const c of CATEGORIES) iconNames.add(c.icon);
for (const n of ["Search", "Sun", "Moon", "Menu", "X", "Mail", "Heart", "ShieldCheck", "Zap", "Globe", "Lock", "Smartphone", "BadgeCheck", "ChevronRight", "Sparkles", "Upload", "Wifi", "Star"]) iconNames.add(n);
const icons: Record<string, string> = {};
for (const name of iconNames) {
  const Icon = (Lucide as unknown as Record<string, Lucide.LucideIcon>)[name] ?? Lucide.Wand2;
  icons[name] = renderToStaticMarkup(createElement(Icon, { className: "h-5 w-5", "aria-hidden": "true" }));
}

// ---- 3. static pages --------------------------------------------------------
const pages = {
  about: renderToStaticMarkup(createElement(AboutPage)),
  privacy: renderToStaticMarkup(createElement(PrivacyPage)),
  terms: renderToStaticMarkup(createElement(TermsPage)),
};

writeFileSync("/tmp/singlefile-meta.json", JSON.stringify({
  tools, categories, counts, popular, icons, pages, siteUrl: SITE_URL,
}));
console.log("meta written:", tools.length, "tools,", Object.keys(icons).length, "icons");
