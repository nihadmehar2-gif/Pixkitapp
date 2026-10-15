"use client";

/** Client entry for a tool page: picks the right workspace UI for the tool.
 *  Each workspace is code-split with next/dynamic, so a tool page only
 *  downloads the JavaScript for the workspace type it actually uses
 *  (standard / crop / passport / color picker). */

import dynamic from "next/dynamic";
import type { ToolDef } from "@/lib/tools/types";

function WorkspaceSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading tool interface">
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-card/50 p-6">
        <div className="h-14 w-14 animate-pulse rounded-full bg-primary/10" />
        <div className="h-5 w-56 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-72 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-14 w-full max-w-[280px] animate-pulse rounded-lg bg-primary/15" />
      </div>
    </div>
  );
}

const ToolWorkspace = dynamic(() => import("./tool-workspace").then((m) => m.ToolWorkspace), {
  loading: () => <WorkspaceSkeleton />,
  ssr: false,
});

const CropWorkspace = dynamic(() => import("./crop-workspace").then((m) => m.CropWorkspace), {
  loading: () => <WorkspaceSkeleton />,
  ssr: false,
});

const ColorPickerWorkspace = dynamic(() => import("./color-picker-workspace").then((m) => m.ColorPickerWorkspace), {
  loading: () => <WorkspaceSkeleton />,
  ssr: false,
});

export function ToolPageClient({ tool }: { tool: ToolDef }) {
  if (tool.interactive === "crop") return <CropWorkspace tool={tool} mode="crop" />;
  if (tool.interactive === "passport") return <CropWorkspace tool={tool} mode="passport" />;
  if (tool.processor === "pickColor") return <ColorPickerWorkspace />;
  return <ToolWorkspace tool={tool} />;
}
