/** Rich tool inventory for the audit harness. Run: bun scripts/dump-tools-rich.ts */
import { TOOLS } from "../src/lib/tools";

const out = TOOLS.map((t) => ({
  slug: t.slug,
  name: t.name,
  h1: t.h1,
  desc: t.description,
  cat: t.category,
  accept: t.accept ?? [],
  multiple: !!t.multiple,
  interactive: t.interactive ?? null,
  options: t.options.map((o) => ({ key: o.key, type: o.type, def: o.default })),
  params: t.params ?? {},
  processor: t.processor,
}));

import { writeFileSync } from "node:fs";
writeFileSync("scripts/tools-rich.json", JSON.stringify(out, null, 1));
console.error(`TOTAL: ${out.length}`);
