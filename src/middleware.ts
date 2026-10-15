import { NextRequest, NextResponse } from "next/server";

/**
 * Hostname-based staging protection (runtime defense-in-depth layer).
 *
 * Every response served from ANY host other than the production domains
 * gets `X-Robots-Tag: noindex, nofollow` — regardless of build-time
 * environment variables. This covers localhost, the temporary ChatZ
 * preview (*.space-z.ai), Vercel branch/PR deployments, and any future
 * staging hostname by default.
 *
 * This complements (does not replace) the build-time switches in
 * src/lib/seo.ts:
 *   1. NEXT_PUBLIC_INDEXING_MODE=preview  — explicit opt-in (.env.preview,
 *      loaded by scripts/dev-daemon.py in dev mode only)
 *   2. VERCEL_ENV != "production"         — Vercel-injected per deployment
 * Those bake `noindex, nofollow` meta into prerendered HTML, Disallow-all
 * robots.txt and an empty sitemap at build time; this middleware adds the
 * runtime header so even a production build served on the wrong hostname
 * stays out of search indexes. A layout-level inline script additionally
 * flips the robots <meta> to noindex at runtime on non-production
 * hostnames, so JS-rendering crawlers see the meta signal too.
 *
 * robots.txt is deliberately NOT Disallow-ed here: crawlers blocked from
 * crawling can still index a URL if they never see its noindex directive.
 * Leaving staging crawlable lets them fetch the page and honor noindex.
 */

const PRODUCTION_HOSTS = new Set(["pixkitapp.com", "www.pixkitapp.com"]);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Lowercase and strip any port ("localhost:3000" -> "localhost").
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  if (host && !PRODUCTION_HOSTS.has(host)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  // Skip only immutable build assets (content-hashed) and the image
  // optimizer for performance; every page, data route and public asset
  // still receives the host-based header.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
