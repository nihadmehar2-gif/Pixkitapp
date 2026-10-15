"use client";

/** Searchable, category-filterable grid of all tools. URL-synced (q + cat). */

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ToolCategory } from "@/lib/tools/types";
import type { ToolLite } from "@/lib/tools";
import { ToolCard } from "./cards";
import { ToolIcon } from "./tool-icon";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  categories: ToolCategory[];
  /** Initially displayed list. When the server pre-filters for /tools?q=…,
   * this is the matching subset (server-rendered into the HTML). */
  tools: ToolLite[];
  /** Optional FULL catalog. When present, all client-side filtering and the
   * category counts operate on it, so editing or clearing the query after a
   * server-rendered pre-filter still searches every tool. */
  allTools?: ToolLite[];
}

export function ToolsBrowser({ categories, tools, allTools }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [cat, setCat] = useState(searchParams.get("cat") ?? "all");
  // Filtering source: the full catalog when provided, otherwise the given list.
  const source = allTools ?? tools;

  // sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat !== "all") params.set("cat", cat);
    const qs = params.toString();
    router.replace(qs ? `/tools?${qs}` : "/tools", { scroll: false });
     
  }, [q, cat]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    return source.filter((tool) => {
      if (cat !== "all" && tool.category !== cat) return false;
      if (terms.length === 0) return true;
      const hay = `${tool.name} ${tool.slug} ${tool.description} ${tool.keywords.join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [source, q, cat]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of source) m.set(t.category, (m.get(t.category) ?? 0) + 1);
    return m;
  }, [source]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${source.length} tools — “compress png”, “passport”, “webp”…`}
            aria-label="Search tools"
            className="h-13 w-full rounded-xl border bg-card py-3.5 pl-11 pr-10 text-base outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="thin-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filter by category">
          <button
            onClick={() => setCat("all")}
            role="tab"
            aria-selected={cat === "all"}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              cat === "all" ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent"
            )}
          >
            All ({source.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              role="tab"
              aria-selected={cat === c.id}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                cat === c.id ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent"
              )}
            >
              {c.name} ({counts.get(c.id) ?? 0})
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} tool{filtered.length !== 1 ? "s" : ""} {q || cat !== "all" ? "matching" : "available"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="font-medium">No tools found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}

      <section className="mt-10 border-t pt-8">
        <h2 className="text-lg font-semibold">Browse by category page</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/categories/${c.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ToolIcon name={c.icon} className="h-3.5 w-3.5" />
              {c.name}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
