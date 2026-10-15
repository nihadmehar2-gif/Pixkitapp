/** Single-file build orchestrator.
 *  Produces /home/z/my-project/download/index.html — the complete PixKitApp
 *  site (shell + compiled Tailwind CSS + real React tool bundle) in ONE file.
 *  Steps:
 *   1. esbuild meta.tsx → run in node → /tmp/singlefile-meta.json
 *   2. write shell.html (static SEO content, hash links)
 *   3. tailwindcss CLI → singlefile.css (scans shell.html + src + entry)
 *   4. esbuild entry.tsx → minified IIFE (React + all 3 workspaces + registry)
 *   5. assemble download/index.html
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = "/home/z/my-project";
const DIR = join(ROOT, "scripts/singlefile");
const DOWNLOAD = join(ROOT, "download");
const ESBUILD = join(ROOT, "node_modules/.bin/esbuild");
const TW = join(ROOT, "node_modules/.bin/tailwindcss");

const aliasArg = `@=${ROOT}/src`;
const shimArg = `next/link=${join(DIR, "next-link-shim.tsx")}`;
const define = ['process.env.NODE_ENV="production"'];

function log(msg) { console.log(`[build] ${msg}`); }

// ---- 1. meta dump -----------------------------------------------------------
log("building meta (registry + icons + static pages)…");
const metaOut = "/tmp/singlefile-meta-entry.cjs";
execFileSync(ESBUILD, [
  join(DIR, "meta.tsx"), "--bundle", "--platform=node", "--format=cjs",
  `--alias:${aliasArg}`, `--alias:${shimArg}`, "--jsx=automatic",
  `--outfile=${metaOut}`,
], { stdio: ["ignore", "ignore", "inherit"] });
rmSync("/tmp/singlefile-meta.json", { force: true });
execFileSync(process.execPath, [metaOut], { stdio: "inherit" });
if (!existsSync("/tmp/singlefile-meta.json")) throw new Error("meta dump failed");
const meta = JSON.parse(readFileSync("/tmp/singlefile-meta.json", "utf8"));
log(`meta ok: ${meta.tools.length} tools, ${meta.categories.length} categories, ${Object.keys(meta.icons).length} icons`);

// ---- 2. shell.html ----------------------------------------------------------
const { head, header, home, toolsIndex, dynamicSections, contactSection, footer, searchDialog, routerJs, esc, makeCtx } = await import("./shell.mjs");
const ctx = makeCtx(meta);

const rewriteHash = (html) =>
  html.replace(/href="\/(tools|about|contact|privacy|terms|categories\/[a-z-]+|[a-z0-9-]+)"/g, 'href="#/$1"');

const staticPages = (name, key) =>
  `<section data-page="${name}" hidden>${rewriteHash(meta.pages[key])}</section>`;

const shell = `<!DOCTYPE html>
<html lang="en">
<head>
${head(ctx)}
  <script>try{var t=localStorage.getItem("pixkit-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}</script>
  <!--STYLES-->
</head>
<body class="flex min-h-screen flex-col">
${header(ctx)}
<main id="main" class="flex-1">
${home(ctx)}
${toolsIndex(ctx)}
${dynamicSections()}
${staticPages("about", "about")}
${contactSection(ctx)}
${staticPages("privacy", "privacy")}
${staticPages("terms", "terms")}
</main>
${footer(ctx)}
${searchDialog(ctx)}
<script>window.PixKitIcons=${JSON.stringify(meta.icons)};</script>
<!--BUNDLE-->
<!--ROUTER-->
</body>
</html>`;

const shellPath = join(DIR, "shell.html");
writeFileSync(shellPath, shell);
log(`shell.html written (${(shell.length / 1024).toFixed(0)} KB)`);

// ---- 3. CSS ------------------------------------------------------------------
log("compiling Tailwind CSS…");
const cssIn = join(DIR, "input.css");
writeFileSync(cssIn, `@import "../../src/app/globals.css";
@source "./shell.html";
@source "../../src";
:root { --font-geist-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; --font-geist-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
`);
const cssOut = join(DIR, "singlefile.css");
execFileSync(TW, ["-i", cssIn, "-o", cssOut, "--minify"], { cwd: DIR, stdio: ["ignore", "ignore", "inherit"] });
const css = readFileSync(cssOut, "utf8");
log(`css ok (${(css.length / 1024).toFixed(0)} KB)`);

// ---- 4. JS bundle --------------------------------------------------------------
log("bundling React app (React + workspaces + registry + processors)…");
const bundleOut = join(DIR, "bundle.js");
execFileSync(ESBUILD, [
  join(DIR, "entry.tsx"), "--bundle", "--format=iife", "--minify",
  "--target=es2019", `--alias:${aliasArg}`, "--jsx=automatic",
  ...define.map((d) => `--define:${d}`),
  `--outfile=${bundleOut}`, "--legal-comments=none",
], { stdio: ["ignore", "ignore", "inherit"] });
const js = readFileSync(bundleOut, "utf8");
log(`bundle ok (${(js.length / 1024).toFixed(0)} KB)`);

// ---- 5. assemble ---------------------------------------------------------------
const router = routerJs(ctx);
// NOTE: replacement MUST be a function — a string replacement would expand
// $& / $` / $' sequences inside the minified JS/CSS and corrupt the code.
let html = shell
  .replace("<!--STYLES-->", () => `<style>${css}</style>`)
  .replace("<!--BUNDLE-->", () => `<script>${js}</script>`)
  .replace("<!--ROUTER-->", () => `<script>${router}</script>`);

mkdirSync(DOWNLOAD, { recursive: true });
const out = join(DOWNLOAD, "index.html");
writeFileSync(out, html);
log(`DONE → ${out} (${(html.length / 1024 / 1024).toFixed(2)} MB, ${(html.length / 1024).toFixed(0)} KB)`);
