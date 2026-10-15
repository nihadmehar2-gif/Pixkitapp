// Quick end-to-end tool smoke test: proves image tools still process + download
// after the SEO metadata changes. Runs against the preview dev server.
// 1) image-compressor: upload JPEG -> compress -> verify download (JPEG magic bytes)
// 2) webp-to-jpg: upload WebP -> convert -> verify download (JPEG magic bytes)
import { chromium } from "playwright-core";
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const BASE = "http://localhost:3000";
const TMP = mkdtempSync(join(tmpdir(), "pxseo-"));
const fails = [];
const ok = (n, c, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${c ? "" : " — " + d}`); if (!c) fails.push(n); };

// --- fixtures ---------------------------------------------------------------
const photo = join(TMP, "photo.jpg");
if (!existsSync(photo)) {
  execSync(`ffmpeg -y -f lavfi -i testsrc2=size=1200x800:rate=1 -frames:v 1 -q:v 2 "${photo}" -loglevel error`);
}
// WebP fixture via canvas-free route: ffmpeg encodes webp directly
const webp = join(TMP, "photo.webp");
if (!existsSync(webp)) {
  execSync(`ffmpeg -y -i "${photo}" -frames:v 1 "${webp}" -loglevel error`);
}

const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));

async function runTool(slug, file, expectMagic, label) {
  await page.goto(`${BASE}/${slug}`, { waitUntil: "load", timeout: 60000 });
  await page.setInputFiles("input[type=file]", file);
  await page.waitForTimeout(800);
  // click the primary action button (Process/Compress/Convert)
  const btn = page.getByRole("button", { name: /compress|convert|process|resize/i }).first();
  await btn.click({ timeout: 15000 });
  // wait for a download-enabled result button
  await page.waitForTimeout(3500);
  const dl = page.waitForEvent("download", { timeout: 30000 });
  await page.getByRole("button", { name: /download/i }).first().click({ timeout: 15000 });
  const download = await dl;
  const out = join(TMP, `out-${label}`);
  await download.saveAs(out);
  const buf = readFileSync(out);
  const magic = [...buf.slice(0, 3)].map((b) => b.toString(16).padStart(2, "0")).join(" ");
  ok(`${slug}: download produced (${buf.length} bytes)`, buf.length > 1000);
  ok(`${slug}: ${expectMagic.desc}`, expectMagic.test(buf), magic);
}

await runTool("image-compressor", photo, {
  desc: "output is valid JPEG (ff d8 ff)",
  test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
}, "comp.jpg");

await runTool("webp-to-jpg", webp, {
  desc: "output is valid JPEG (ff d8 ff)",
  test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
}, "conv.jpg");

ok("zero page errors during tool flows", consoleErrors.length === 0, consoleErrors.join("; ").slice(0, 200));
await browser.close();
console.log(fails.length ? `SMOKE FAILED: ${fails.length}` : "TOOL SMOKE: ALL PASS");
process.exit(fails.length ? 1 : 0);
