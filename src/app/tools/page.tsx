import type { Metadata } from "next";
import { Suspense } from "react";
import { TOOLS, liteTools, SITE_URL } from "@/lib/tools";
import { CATEGORIES } from "@/lib/tools/categories";
import { socialMeta } from "@/lib/seo";
import { ToolsBrowser } from "@/components/site/tools-browser";

const TOOLS_DESCRIPTION =
  "Browse all PixKitApp image tools: compression, resizing, cropping, conversion, filters, watermarks, passport photos and more. Search and filter by category.";

export const metadata: Metadata = {
  title: "All Tools — 127 Free Online Image Tools A-Z",
  description: TOOLS_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/tools` },
  ...socialMeta({
    title: "All Tools — 127 Free Online Image Tools A-Z | PixKitApp",
    description: TOOLS_DESCRIPTION,
    path: "/tools",
  }),
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">All PixKitApp Tools</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every one of our {TOOLS.length} free image tools — searchable, filterable and always processed locally in your browser.
        </p>
      </header>
      <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading tools…</div>}>
        <ToolsBrowser categories={CATEGORIES} tools={liteTools(TOOLS)} />
      </Suspense>
    </div>
  );
}
