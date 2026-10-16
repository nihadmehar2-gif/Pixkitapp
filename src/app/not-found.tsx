import Link from "next/link";
import { popularTools } from "@/lib/tools";
import { ToolCard } from "@/components/site/cards";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <SearchX className="mx-auto h-14 w-14 text-muted-foreground" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        That tool doesn&apos;t exist (yet?). Try one of these popular tools or browse all 127.
      </p>
      <Link
        href="/tools"
        className="mt-5 inline-flex h-12 items-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Browse all tools
      </Link>
      <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
        {popularTools(3).map((tool) => (
          <ToolCard key={tool.slug} tool={tool} heading="h2" />
        ))}
      </div>
    </div>
  );
}
