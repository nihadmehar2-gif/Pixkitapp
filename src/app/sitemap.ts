import type { MetadataRoute } from "next";
import { TOOLS, SITE_URL } from "@/lib/tools";
import { CATEGORIES } from "@/lib/tools/categories";
import { IS_PREVIEW } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Preview/staging must not publish the production sitemap (robots.txt
  // already omits the reference; the route itself stays empty there).
  if (IS_PREVIEW) return [];
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const toolPages: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${SITE_URL}/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: t.popular ? 0.9 : 0.7,
  }));
  return [...staticPages, ...categoryPages, ...toolPages];
}
