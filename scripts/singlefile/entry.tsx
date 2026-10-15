/** Single-file bundle entry: mounts the REAL PixKitApp tool workspaces
 *  (the same React components the Next.js site ships) into a hash-routed
 *  standalone HTML page. Exposed via window.PixKitBundle. */
import { createRoot, type Root } from "react-dom/client";
import { createElement, StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ToolWorkspace } from "@/components/tool/tool-workspace";
import { CropWorkspace } from "@/components/tool/crop-workspace";
import { ColorPickerWorkspace } from "@/components/tool/color-picker-workspace";
import { TOOLS } from "@/lib/tools";
import { CATEGORIES } from "@/lib/tools/categories";
import type { ToolDef } from "@/lib/tools/types";

const bySlug = new Map<string, ToolDef>(TOOLS.map((t) => [t.slug, t]));
const roots = new Map<HTMLElement, Root>();

export function mountTool(slug: string, el: HTMLElement | null): boolean {
  if (!el) return false;
  const tool = bySlug.get(slug);
  if (!tool) return false;
  // Reuse the existing root when re-mounting the same container.
  let root = roots.get(el);
  if (!root) {
    root = createRoot(el);
    roots.set(el, root);
  }
  let node;
  if (tool.interactive === "crop" || tool.interactive === "passport") {
    node = createElement(CropWorkspace, { tool, mode: tool.interactive, key: slug });
  } else if (tool.processor === "pickColor") {
    node = createElement(ColorPickerWorkspace, { key: slug });
  } else {
    node = createElement(ToolWorkspace, { tool, key: slug });
  }
  root.render(createElement(StrictMode, null, node, createElement(Toaster)));
  return true;
}

export function unmountAll(): void {
  for (const [, root] of roots) root.unmount();
  roots.clear();
}

declare global {
  interface Window {
    PixKitBundle: {
      tools: ToolDef[];
      categories: typeof CATEGORIES;
      mountTool: typeof mountTool;
      unmountAll: typeof unmountAll;
    };
  }
}

window.PixKitBundle = { tools: TOOLS, categories: CATEGORIES, mountTool, unmountAll };
