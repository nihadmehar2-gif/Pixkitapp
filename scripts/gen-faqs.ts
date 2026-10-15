/**
 * Generate grounded FAQ content for tools that lack a hand-written faq.
 * Every answer is anchored to the tool's REAL attributes (accepted input
 * formats, actual option labels, platform limits).
 *
 * SEO quality rules (revised after the density/duplication audit):
 *  - Answers are NAME-FREE: the tool name appears in at most ~2 questions,
 *    never in answers. This keeps primary-keyword density natural (<~2.5%)
 *    instead of stuffing the name into every Q&A pair.
 *  - Larger variant pools + staggered rotation so two tool pages share as
 *    few fixed 8-gram runs as possible (fights boilerplate duplication).
 *
 * Run: bun scripts/gen-faqs.ts
 * Writes: src/lib/tools/faq/generated-faqs.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
// Import RAW definition files (not the registry) — index.ts attaches generated
// FAQs to TOOLS, so importing it here would make every tool look FAQ-complete.
import { COMPRESSION_TOOLS, OPTIMIZATION_TOOLS } from "../src/lib/tools/definitions/compression";
import { RESIZE_TOOLS, CROP_TOOLS } from "../src/lib/tools/definitions/resizing-cropping";
import { CONVERSION_TOOLS, ROTATION_TOOLS } from "../src/lib/tools/definitions/conversion-rotation";
import { FILTER_TOOLS, COLOR_TOOLS, METADATA_TOOLS } from "../src/lib/tools/definitions/filters-color";
import { WATERMARK_TOOLS, TEXT_TOOLS, TRANSPARENCY_TOOLS } from "../src/lib/tools/definitions/watermark-text";
import { SOCIAL_TOOLS, PASSPORT_TOOLS } from "../src/lib/tools/definitions/social-passport";
import type { ToolDef } from "../src/lib/tools/types";

const TOOLS: ToolDef[] = [
  ...COMPRESSION_TOOLS,
  ...RESIZE_TOOLS,
  ...CROP_TOOLS,
  ...CONVERSION_TOOLS,
  ...ROTATION_TOOLS,
  ...FILTER_TOOLS,
  ...OPTIMIZATION_TOOLS,
  ...METADATA_TOOLS,
  ...COLOR_TOOLS,
  ...WATERMARK_TOOLS,
  ...TEXT_TOOLS,
  ...TRANSPARENCY_TOOLS,
  ...SOCIAL_TOOLS,
  ...PASSPORT_TOOLS,
];

const fmt = (t: ToolDef) =>
  (t.accept ?? [])
    .map((a) => a.replace(/^\./, "").replace(/^image\//, "").toUpperCase())
    .filter((f) => f && f !== "JPEG/JPG" && f !== "JPG/JPEG")
    .map((f) => (f === "JPEG" ? "JPG" : f));

const fmtList = (t: ToolDef): string => {
  const f = [...new Set(fmt(t))];
  return f.length > 1 ? `${f.slice(0, -1).join(", ")} or ${f[f.length - 1]}` : f[0] || "common image formats";
};

const optSummary = (t: ToolDef): string => {
  const l = t.options.map((o) => o.label).filter(Boolean);
  if (!l.length) return "the settings shown on the page";
  if (l.length <= 3) return l.join(", ");
  return `${l.slice(0, 2).join(", ")} and ${l.length - 2} more control${l.length - 2 > 1 ? "s" : ""}`;
};

const CAT_WHY: Record<string, string> = {
  compression: "re-encoding the picture through the browser's canvas encoder at the quality level you choose",
  resizing: "resampling pixels with a high-quality multi-step scaling routine so edges stay clean instead of turning jagged",
  cropping: "cutting away the areas you mark on the interactive canvas and keeping only the framed region",
  conversion: "decoding the source file and re-encoding it in the target format with the browser's built-in codecs",
  rotation: "applying the rotation or flip as a canvas transform and re-rendering the picture in its new orientation",
  filters: "adjusting pixel color values directly on an HTML canvas, pixel by pixel",
  optimization: "trimming hidden overhead such as metadata and applying efficient re-encoding settings",
  metadata: "reading the file's internal structure (EXIF blocks, PNG chunks) and reporting it without altering the file",
  color: "sampling exact pixel values from the loaded picture and converting them between color models",
  watermarking: "drawing your text or logo onto a canvas overlay and flattening it into the exported image",
  text: "rendering your words onto the image canvas with your chosen font settings",
  transparency: "processing the alpha channel so transparent areas are preserved, added, or flattened as you decide",
  social: "drawing the picture onto a preset canvas sized for the platform you picked",
  passport: "rendering your photo at the official size and DPI for the document you selected",
};

const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length];

// --- Q1/A1: privacy -----------------------------------------------------------------
// Name appears in ~half the question variants; answers are always name-free.
const Q1 = [
  (t: ToolDef) => `Is my image uploaded to a server when I use ${t.name}?`,
  (t: ToolDef) => `Do my files leave my device?`,
  (t: ToolDef) => `How private is ${t.name}?`,
  (t: ToolDef) => `Is it safe to use with personal photos?`,
  (t: ToolDef) => `Where are my images processed?`,
  (t: ToolDef) => `Does ${t.name} upload my images anywhere?`,
];
const A1 = [
  () => `No — the file is read straight into your browser tab and processed on your device. Nothing is transmitted, stored, or logged anywhere, and results appear instantly because no server round-trip is involved.`,
  () => `Everything runs locally in your browser via the Canvas API. Your picture never leaves your machine, and the page keeps working even if you go offline after loading it.`,
  () => `Fully local: the picture is decoded into your browser's memory, processed there, and handed straight back to you. No upload step exists at any point.`,
  () => `Your device does all the work — the image is processed inside the browser sandbox and saved back to your disk directly. No server ever sees the file.`,
  () => `Nothing is sent over the internet. The whole pipeline — decode, process, encode, download — happens in this tab, which is also why it stays fast on slow connections.`,
];

// --- Q2/A2: formats -----------------------------------------------------------------
const Q2 = [
  (t: ToolDef) => `Which input formats does ${t.name} accept?`,
  (t: ToolDef) => `Can it open JPG, PNG and WebP files?`,
  (t: ToolDef) => `What kind of image files work with this tool?`,
  (t: ToolDef) => `Which file types are supported?`,
];
const A2 = [
  (t: ToolDef) => `${fmtList(t)} files up to 30 MB each are accepted. Drop one in (or paste or drag it), check the preview, and export in the format shown at the download step.`,
  (t: ToolDef) => `Yes — ${fmtList(t)} inputs work here, up to 30 MB per file. For exotic formats, convert them first with one of the converter tools, then come back.`,
  () => `A thumbnail preview appears after the file loads, before any processing starts, so you can confirm the right picture is queued.`,
  (t: ToolDef) => `Common formats are covered: ${fmtList(t)}, each up to 30 MB. Paste from the clipboard, drag and drop, or use the select button.`,
];

// --- Q3/A3: limits ------------------------------------------------------------------
const Q3 = [
  () => `What are the size and batch limits?`,
  (t: ToolDef) => `Does ${t.name} have usage limits, accounts or watermarks?`,
  () => `How many images can I process at once?`,
  () => `Is there a file size limit?`,
];
const A3 = [
  () => `Up to 10 images per batch, 30 MB per file, and unlimited runs — no signup, no counters, and no watermark stamped on results.`,
  () => `There are no artificial limits: use it as often as you like, free. Practical caps are 30 MB per image and 10 files per batch, and outputs stay watermark-free.`,
  () => `You can queue 10 files per run, each up to 30 MB. Results download individually or bundled as a single ZIP when multiple files are processed.`,
  () => `Batch runs take up to 10 files at once (30 MB each). There's no account, no daily quota and no watermark — process as many batches as you need.`,
];

// --- Q4/A4: controls ----------------------------------------------------------------
const Q4 = [
  () => `What settings can I adjust before exporting?`,
  (t: ToolDef) => `Which controls does ${t.name} offer?`,
  () => `Can I fine-tune the result before downloading?`,
];
const A4 = [
  (t: ToolDef) => `You can adjust ${optSummary(t)}. Results are previewed after processing, so tweak values and re-run until the output looks right.`,
  (t: ToolDef) => `The controls cover ${optSummary(t)}. Nothing is baked in until you press the action button, and every run gives you a fresh preview to check.`,
  (t: ToolDef) => `Yes — settings include ${optSummary(t)}. Each run regenerates the preview, so you can compare options before downloading.`,
];

/** Staggered picks: per-slot multipliers keep (question, answer) variant combos
 *  from aligning across neighbouring tools, cutting template duplication. */
function faqFor(t: ToolDef, i: number): { q: string; a: string }[] {
  const hasOpts = t.options.length > 0;
  const q1 = pick(Q1, i * 2)(t), a1 = pick(A1, i * 5 + 1)();
  const q2 = pick(Q2, i * 3 + 1)(t), a2 = pick(A2, i * 5 + 2)(t);
  const q3 = pick(Q3, i * 2 + 2)(t), a3 = pick(A3, i * 5 + 3)();
  const q4 = pick(Q4, i * 3 + 2)(t), a4 = pick(A4, i * 5 + 4)(t);
  const pairs = [
    { q: q1, a: a1 },
    { q: q2, a: a2 },
    { q: q3, a: a3 },
    ...(hasOpts ? [{ q: q4, a: a4 }] : []),
  ];
  // de-dup questions within a page (pools are distinct topics, but stay safe)
  const seen = new Set<string>();
  return pairs.filter(({ q }) => {
    const k = q.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const out: Record<string, { q: string; a: string }[]> = {};
let generated = 0;
let nameInQ = 0;
let nameInA = 0;
for (let i = 0; i < TOOLS.length; i++) {
  const t = TOOLS[i];
  if (t.faq && t.faq.length > 0) continue; // hand-written FAQ wins
  const faq = faqFor(t, i);
  out[t.slug] = faq;
  generated++;
  const lname = t.name.toLowerCase();
  for (const f of faq) {
    if (f.q.toLowerCase().includes(lname)) nameInQ++;
    if (f.a.toLowerCase().includes(lname)) nameInA++;
  }
}

const header = `/** AUTO-GENERATED FAQ content (scripts/gen-faqs.ts) — grounded per-tool FAQs for
 * tools without hand-written ones. Do not edit by hand; re-run the generator.
 * Answers are deliberately name-free to keep keyword density natural. */
import type { ToolDef } from "../types";

export const GENERATED_FAQS: Record<string, NonNullable<ToolDef["faq"]>> = `;

const body = JSON.stringify(out, null, 2).replace(/\{"q":/g, '{ "q":').replace(/,"a":/g, ',\n    "a":');

mkdirSync("/home/z/my-project/src/lib/tools/faq", { recursive: true });
writeFileSync(
  "/home/z/my-project/src/lib/tools/faq/generated-faqs.ts",
  `${header}${body};\n`,
  "utf-8"
);
console.log(`generated FAQs for ${generated} tools`);
console.log(`total tools: ${TOOLS.length}, hand-written already present: ${TOOLS.length - generated}`);
console.log(`name mentions: in questions ${nameInQ} (~${(nameInQ / generated).toFixed(1)}/tool), in answers ${nameInA} (must be 0)`);
