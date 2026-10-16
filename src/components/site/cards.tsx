import Link from "next/link";
import { ToolIcon } from "./tool-icon";
import type { ToolLite } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

export function ToolCard({ tool, className, heading = "h3" }: { tool: ToolLite; className?: string; heading?: "h2" | "h3" }) {
  const Heading = heading;
  return (
    <Link
      href={`/${tool.slug}`}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <ToolIcon name={tool.icon} className="h-5 w-5" />
      </div>
      {/* heading="h2" when cards sit directly under the page h1 (no intervening
          section h2) so the outline never skips a level. */}
      <Heading className="font-semibold leading-snug">{tool.name}</Heading>
      <p className="line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
    </Link>
  );
}

export function CategoryCard({ category, count }: { category: ToolCategory; count: number }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", category.color)} aria-hidden="true" />
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow", category.color)}>
        <ToolIcon name={category.icon} className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-semibold">{category.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
      <p className="mt-2 text-xs font-medium text-primary">{count} tools →</p>
    </Link>
  );
}
