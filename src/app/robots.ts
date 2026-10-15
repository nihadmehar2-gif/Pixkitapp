import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/tools";
import { IS_PREVIEW } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Preview/staging: block every crawler and do NOT advertise a sitemap,
  // so the temporary preview domain can never be indexed and never
  // publishes production SEO signals.
  if (IS_PREVIEW) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
