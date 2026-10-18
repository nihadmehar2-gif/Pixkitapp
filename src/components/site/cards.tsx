import Link from "next/link";
import { ToolIcon } from "./tool-icon";
import type { ToolLite } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

/**
 * Per-category visual identity for tool "logos".
 * Every tool card shows a colorful gradient tile (its category's hue)
 * with a matching glow on hover. All classes are static so Tailwind's
 * JIT compiler keeps them in the build.
 */
const CATEGORY_STYLES: Record<string, { gradient: string; glow: string }> = {
  compression:  { gradient: "from-emerald-500 to-teal-600",   glow: "hover:shadow-emerald-500/25" },
  resizing:     { gradient: "from-sky-500 to-cyan-600",       glow: "hover:shadow-sky-500/25" },
  cropping:     { gradient: "from-violet-500 to-purple-600",  glow: "hover:shadow-violet-500/25" },
  conversion:   { gradient: "from-orange-500 to-amber-600",   glow: "hover:shadow-orange-500/25" },
  rotation:     { gradient: "from-rose-500 to-pink-600",      glow: "hover:shadow-rose-500/25" },
  filters:      { gradient: "from-fuchsia-500 to-purple-600", glow: "hover:shadow-fuchsia-500/25" },
  optimization: { gradient: "from-lime-500 to-green-600",     glow: "hover:shadow-lime-500/25" },
  metadata:     { gradient: "from-slate-500 to-slate-700",    glow: "hover:shadow-slate-500/25" },
  color:        { gradient: "from-red-500 to-orange-600",     glow: "hover:shadow-red-500/25" },
  watermarking: { gradient: "from-teal-500 to-emerald-600",   glow: "hover:shadow-teal-500/25" },
  text:         { gradient: "from-indigo-500 to-blue-600",    glow: "hover:shadow-indigo-500/25" },
  transparency: { gradient: "from-cyan-500 to-sky-600",       glow: "hover:shadow-cyan-500/25" },
  social:       { gradient: "from-pink-500 to-rose-600",      glow: "hover:shadow-pink-500/25" },
  passport:     { gradient: "from-amber-500 to-yellow-600",   glow: "hover:shadow-amber-500/25" },
};

const FALLBACK_STYLE = { gradient: "from-violet-500 to-purple-600", glow: "hover:shadow-violet-500/25" };

/** Gradient + glow pair for a tool's category (falls back to brand violet). */
export function categoryStyle(categoryId: string) {
  return CATEGORY_STYLES[categoryId] ?? FALLBACK_STYLE;
}

export function ToolCard({ tool, className, heading = "h3" }: { tool: ToolLite; className?: string; heading?: "h2" | "h3" }) {
  const Heading = heading;
  const style = categoryStyle(tool.category);
  return (
    <Link
      href={`/${tool.slug}`}
      className={cn(
        "beam-card glass-card group flex h-full flex-col gap-2.5 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] active:shadow-md",
        style.glow,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {/* Tool "logo": gradient tile in the category's hue with a lit edge */}
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg",
          style.gradient
        )}
        aria-hidden="true"
      >
        <ToolIcon name={tool.icon} className="h-5.5 w-5.5" />
      </div>
      {/* heading="h2" when cards sit directly under the page h1 (no intervening
          section h2) so the outline never skips a level. */}
      <Heading className="font-semibold leading-snug">{tool.name}</Heading>
      <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">{tool.description}</p>
      <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">
        Open tool <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}

export function CategoryCard({ category, count }: { category: ToolCategory; count: number }) {
  const style = categoryStyle(category.id);
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="beam-card glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", category.color)} aria-hidden="true" />
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg",
          style.gradient
        )}
        aria-hidden="true"
      >
        <ToolIcon name={category.icon} className="h-6 w-6" />
      </div>
      <h3 className="mt-3 font-semibold">{category.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">{category.description}</p>
      <p className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-primary">
        {count} tools <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">→</span>
      </p>
    </Link>
  );
}
