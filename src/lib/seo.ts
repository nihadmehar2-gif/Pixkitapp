import type { Metadata } from "next";
import { SITE_URL } from "@/lib/tools";

/**
 * Indexing mode switch.
 *
 * "preview" (staging / ChatZ preview environment): every page emits
 * `noindex, nofollow`, robots.txt disallows all crawlers and the sitemap
 * route returns an empty document — the temporary preview domain must never
 * become indexable and must not publish production SEO signals.
 *
 * Any other value or unset → normal indexable production configuration.
 * Production deployments must NOT set NEXT_PUBLIC_INDEXING_MODE=preview.
 */
export const IS_PREVIEW = process.env.NEXT_PUBLIC_INDEXING_MODE === "preview";

/** Robots directive applied site-wide (inherited by every page). */
export const ROBOTS_DIRECTIVES: Metadata["robots"] = IS_PREVIEW
  ? { index: false, follow: false, googleBot: { index: false, follow: false } }
  : { index: true, follow: true };

/**
 * Stable, publicly served social sharing image — 1200×630 PNG in /public.
 * Resolves to the absolute production URL https://pixkitapp.com/og-image.png
 * via metadataBase, so scrapers always see a production asset that will
 * exist once the site is deployed (it ships in /public).
 */
export const OG_IMAGE = "/og-image.png";
export const OG_IMAGE_ALT =
  "PixKitApp — 127 free online image tools that run privately in your browser";

/** Shared Open Graph image entries (absolute URLs resolved via metadataBase). */
export const OG_IMAGES = [
  { url: OG_IMAGE, width: 1200, height: 630, alt: OG_IMAGE_ALT },
];

/**
 * Complete, consistent Open Graph + Twitter card metadata for a page.
 * Every indexable page spreads this in, so social tags are never missing
 * and never conflict (exactly one og:title/og:image/... per page).
 */
export function socialMeta(opts: {
  title: string;
  description: string;
  /** Path beginning with "/" — canonical + og:url are built from SITE_URL. */
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const url = `${SITE_URL}${opts.path}`;
  return {
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "PixKitApp",
      type: "website",
      images: OG_IMAGES,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: OG_IMAGES,
    },
  };
}
