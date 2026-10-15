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

interface SearchParams {
  q?: string;
  cat?: string;
}

/**
 * Server-side search results.
 *
 * /tools?q=… (and /tools?cat=…) are rendered on the server with the matching
 * tool cards in the initial HTML, which makes the site search genuinely
 * crawlable and justifies the WebSite SearchAction on the homepage. The
 * filtering logic below mirrors ToolsBrowser's client filter exactly, so
 * hydrated results match the prerendered ones 1:1 and the client keeps
 * refining the FULL catalog (passed via allTools) as the user types.
 */
function filterTools(
  tools: ReturnType<typeof liteTools>,
  q: string,
  cat: string
) {
  const terms = q.split(/\s+/).filter(Boolean);
  return tools.filter((tool) => {
    if (cat !== "all" && tool.category !== cat) return false;
    if (terms.length === 0) return true;
    const hay = `${tool.name} ${tool.slug} ${tool.description} ${tool.keywords.join(" ")}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: rawQ, cat: rawCat } = await searchParams;
  const q = (rawQ ?? "").trim().toLowerCase();
  const cat = (rawCat ?? "").trim() || "all";

  const all = liteTools(TOOLS);
  const searching = q.length > 0 || cat !== "all";
  const filtered = searching ? filterTools(all, q, cat) : all;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">All PixKitApp Tools</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every one of our {TOOLS.length} free image tools — searchable, filterable and always processed locally in your browser.
        </p>
        {q.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""} matching &ldquo;{rawQ?.trim() ?? q}&rdquo;
          </p>
        )}
      </header>
      <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading tools…</div>}>
        <ToolsBrowser
          categories={CATEGORIES}
          tools={filtered}
          allTools={all}
        />
      </Suspense>
    </div>
  );
}
