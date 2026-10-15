import Link from "next/link";
import type { Metadata } from "next";
import { TOOLS, popularTools, categoriesWithCounts, SITE_URL } from "@/lib/tools";
import { CATEGORIES } from "@/lib/tools/categories";
import { socialMeta } from "@/lib/seo";
import { ToolCard, CategoryCard } from "@/components/site/cards";
import { ToolIcon } from "@/components/site/tool-icon";
import { HomeSearch } from "@/components/site/home-search";
import { AdSlot } from "@/components/site/ad-slot";
import { ShieldCheck, Zap, Smartphone, BadgeCheck } from "lucide-react";

const HOME_DESCRIPTION =
  "Compress, resize, crop, convert and edit images online with 127 free browser-based tools. Photos stay on your device — no uploads, no signups, no watermarks.";

export const metadata: Metadata = {
  title: "PixKitApp — 127 Free Online Image Tools (No Upload Required)",
  description: HOME_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  ...socialMeta({
    title: "PixKitApp — 127 Free Online Image Tools (No Upload Required)",
    description: HOME_DESCRIPTION,
    path: "/",
  }),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "PixKitApp",
      url: SITE_URL,
      description: "127 free browser-based image tools with zero uploads.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/tools?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Are PixKitApp tools really free?",
          answer: "Yes — all 127 image tools are completely free with no signup, no watermarks and no usage limits.",
        },
        {
          "@type": "Question",
          name: "Are my images uploaded to a server?",
          answer: "No. Every tool processes images locally in your browser using Canvas and web APIs. Your files never leave your device.",
        },
        {
          "@type": "Question",
          name: "Do the tools work on phones and Chromebooks?",
          answer: "Yes. PixKitApp is mobile-first and works in any modern browser — Android, iPhone, iPad, Chromebook, Windows and Mac.",
        },
      ],
    },
  ],
};

export default function HomePage() {
  const popular = popularTools(12);
  const cats = categoriesWithCounts();

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/8 via-primary/4 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
            <BadgeCheck className="h-4 w-4 text-primary" />
            {TOOLS.length} tools · zero uploads · free forever
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Every image tool you need.{" "}
            <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">Right in your browser.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Compress, resize, crop, convert, watermark and more — {TOOLS.length} free tools that process images on your device.
            Nothing is ever uploaded, so your photos stay private.
          </p>
          <HomeSearch />

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              { icon: ShieldCheck, label: "Private by design" },
              { icon: Zap, label: "Instant results" },
              { icon: Smartphone, label: "Mobile-first" },
              { icon: BadgeCheck, label: "No watermarks" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2 rounded-lg border bg-card px-3 py-2.5">
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular tools */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Popular tools</h2>
            <p className="mt-1 text-muted-foreground">The most-used image utilities on PixKitApp.</p>
          </div>
          <Link href="/tools" className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block">
            View all {TOOLS.length} →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
        <Link href="/tools" className="mt-4 block text-sm font-medium text-primary hover:underline sm:hidden">
          View all {TOOLS.length} tools →
        </Link>
      </section>

      {/* Ad container between content sections — reserved space, in normal flow. */}
      <AdSlot id="in-content" className="py-2" />

      {/* Categories */}
      <section className="border-y bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
          <p className="mt-1 text-muted-foreground">Every tool organized into {CATEGORIES.length} focused categories.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cats.map((cat) => (
              <CategoryCard key={cat.id} category={cat} count={cat.count} />
            ))}
          </div>
        </div>
      </section>

      {/* Why PixKitApp */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why PixKitApp is different</h2>
            <div className="mt-5 space-y-4">
              {[
                {
                  title: "Your images never leave your device",
                  body: "Unlike most online tools, PixKitApp has no upload step. All processing runs locally with the Canvas API and modern browser capabilities — even works offline after the page loads.",
                },
                {
                  title: "Genuinely different tools, not clones",
                  body: "Each of the 127 tools has its own purpose-built interface, options and output — from iterative target-size compression to EXIF inspection to passport photo guides.",
                },
                {
                  title: "Built for every screen",
                  body: "Large touch targets, responsive layouts and keyboard shortcuts make it fast on phones, Chromebooks and desktops alike.",
                },
                {
                  title: "Batch everything",
                  body: "Process up to 10 images per run with per-file stats and one-click ZIP download of all results.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Tool spotlight</h3>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {["image-compressor", "image-to-pdf", "passport-photo-maker", "remove-white-background", "resize-image-to-kb", "image-metadata-viewer"].map((slug) => {
                const tool = TOOLS.find((t) => t.slug === slug)!;
                return (
                  <Link key={slug} href={`/${slug}`} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-accent/40">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ToolIcon name={tool.icon} className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{tool.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* All tools A-Z */}
      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">All {TOOLS.length} tools</h2>
              <p className="mt-1 text-muted-foreground">Everything on PixKitApp, organized by category.</p>
            </div>
            <Link href="/tools" className="shrink-0 text-sm font-medium text-primary hover:underline">
              Search & filter →
            </Link>
          </div>
          <div className="space-y-6">
            {CATEGORIES.map((cat) => {
              const tools = TOOLS.filter((t) => t.category === cat.id);
              if (tools.length === 0) return null;
              return (
                <div key={cat.id}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <ToolIcon name={cat.icon} className="h-4 w-4" />
                    {cat.name}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs normal-case">{tools.length}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tools.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/${t.slug}`}
                        className="rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
