import type { NextConfig } from "next";

// Preview/staging environments set NEXT_PUBLIC_INDEXING_MODE=preview (loaded
// by scripts/dev-daemon.py from .env.preview). Production deploys must leave
// it unset. Belt-and-braces: sends X-Robots-Tag on every response in preview
// so even non-HTML assets and mis-crawled URLs are excluded from indexes.
const IS_PREVIEW = process.env.NEXT_PUBLIC_INDEXING_MODE === "preview";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Framing: the sandbox preview embeds this site in a cross-origin iframe,
  // so frame-ancestors must allow any parent. X-Frame-Options:SAMEORIGIN was
  // removed because it made the preview show "refused to connect" and cannot
  // express per-origin allowlists. The site has no authenticated actions, so
  // embeddability is acceptable.
  { key: "Content-Security-Policy", value: "frame-ancestors *" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No camera/mic/geolocation needed — image processing is canvas-only.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(IS_PREVIEW ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
