import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { AdSlot } from "@/components/site/ad-slot";
import { SITE_URL } from "@/lib/tools";
import { OG_IMAGES, ROBOTS_DIRECTIVES } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PixKitApp — 127 Free Online Image Tools (No Upload)",
    template: "%s | PixKitApp",
  },
  description:
    "127 free browser-based image tools: compress, resize, crop, convert, watermark, filters, passport photos and more. Images are processed on your device and never uploaded.",
  // No site-wide `keywords` tag: Google ignores meta keywords, and a generic
  // inherited list on every page is metadata noise. Tool pages still emit
  // their own deduplicated, tool-specific keyword lists.
  authors: [{ name: "PixKitApp" }],
  creator: "PixKitApp",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "PixKitApp — Free Online Image Tools",
    description: "127 private, browser-based image tools. No uploads, no signups, no watermarks.",
    url: SITE_URL,
    siteName: "PixKitApp",
    type: "website",
    locale: "en_US",
    images: OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "PixKitApp — Free Online Image Tools",
    description: "127 private, browser-based image tools. No uploads required.",
    images: OG_IMAGES,
  },
  // Preview/staging environments must never be indexable (see src/lib/seo.ts).
  robots: ROBOTS_DIRECTIVES,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1625" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            {/* Ad container below the header — reserved space, in normal flow. */}
            <AdSlot id="top" className="mt-3" />
            <main id="main-content" className="flex-1">{children}</main>
            {/* Ad container before the footer — reserved space, in normal flow. */}
            <AdSlot id="pre-footer" className="mb-6 mt-10" />
            <SiteFooter />
          </div>
          <Toaster />
          {/*
            Runtime hostname guard: on any non-production hostname the
            robots directive is flipped to noindex,nofollow at parse time
            (reuses the existing meta tag, so no duplicates are created).
            Belt-and-braces alongside the build-time env switches and the
            middleware X-Robots-Tag header — see src/middleware.ts.
          */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                'try{if(!/^(www\\.)?pixkitapp\\.com$/.test(location.hostname)){var m=document.querySelector(\'meta[name="robots"]\');if(!m){m=document.createElement("meta");m.setAttribute("name","robots");document.head.appendChild(m)}m.setAttribute("content","noindex, nofollow")}}catch(e){}',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
