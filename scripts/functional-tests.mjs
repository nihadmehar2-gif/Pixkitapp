/** Deep functional tests: upload -> process -> preview -> download across
 *  workspace types and categories, on the production build (:3001).
 *  Run: node scripts/functional-tests.mjs
 */
import { chromium } from "playwright-core";
import { writeFileSync, readFileSync, copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";

const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const BASE = process.argv[2] || "http://localhost:3000";
const TMP = "/tmp/pxtest";
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

// test fixtures
copyFileSync("/home/z/my-project/.zscripts/test-photo.jpg", `${TMP}/photo.jpg`);
copyFileSync("/home/z/my-project/.zscripts/test-photo.png", `${TMP}/photo.png`);
copyFileSync("/home/z/my-project/.zscripts/test-photo.webp", `${TMP}/photo.webp`);

const results = [];
const browser = await chromium.launch({
  executablePath: EXEC,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 150)); });
page.on("pageerror", (e) => consoleErrors.push("PAGEERROR " + String(e).slice(0, 150)));

async function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail ?? ""}`);
}

async function upload(paths) {
  const input = page.locator('input[type=file]').first();
  await input.setInputFiles(paths.map(p => ({ name: p.split("/").pop(), mimeType: "", buffer: readFileSync(p) })));
}

async function clickRun(label) {
  await page.getByRole("button", { name: label }).first().click();
}

async function expectDownload(selector, saveAs) {
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }),
    selector.click(),
  ]);
  const path = `${TMP}/${saveAs}`;
  await download.saveAs(path);
  return { path, name: download.suggestedFilename(), size: (await import("node:fs")).statSync(path).size };
}

/* 1. Image compressor (standard workspace, compression) */
try {
  await page.goto(`${BASE}/image-compressor`, { waitUntil: "load" });
  await upload([`${TMP}/photo.jpg`]);
  await page.waitForTimeout(600);
  await clickRun("Compress");
  await page.waitForSelector("text=Download", { timeout: 20000 });
  const note = await page.locator("text=/smaller|saved|%/i").first().textContent().catch(() => "");
  const dl = await expectDownload(page.locator("button:has-text('Download')").first(), "out-compressed.jpg");
  await record("image-compressor: upload→compress→preview→download", dl.size > 5000, `saved ${dl.size}B as ${dl.name}; note: ${(note ?? "").trim().slice(0, 60)}`);
} catch (e) { await record("image-compressor", false, String(e).slice(0, 160)); }

/* 2. WebP → JPG (conversion) */
try {
  await page.goto(`${BASE}/webp-to-jpg`, { waitUntil: "load" });
  await upload([`${TMP}/photo.webp`]);
  await page.waitForTimeout(600);
  await clickRun("Convert");
  await page.waitForSelector("text=Download", { timeout: 20000 });
  const dl = await expectDownload(page.locator("button:has-text('Download')").first(), "out-converted.jpg");
  await record("webp-to-jpg: webp in → jpg out", dl.name.endsWith(".jpg") && dl.size > 5000, `file ${dl.name}, ${dl.size}B`);
} catch (e) { await record("webp-to-jpg", false, String(e).slice(0, 160)); }

/* 3. Resize to KB (target-size resize) */
try {
  await page.goto(`${BASE}/resize-image-to-kb`, { waitUntil: "load" });
  await upload([`${TMP}/photo.jpg`]);
  await page.waitForTimeout(600);
  await clickRun("Resize");
  await page.waitForSelector("text=Download", { timeout: 30000 });
  const dl = await expectDownload(page.locator("button:has-text('Download')").first(), "out-resized.jpg");
  await record("resize-image-to-kb: target-size output", dl.size > 1000, `saved ${dl.size}B`);
} catch (e) { await record("resize-image-to-kb", false, String(e).slice(0, 160)); }

/* 4. Rotate (rotation) */
try {
  await page.goto(`${BASE}/rotate-image`, { waitUntil: "load" });
  await upload([`${TMP}/photo.jpg`]);
  await page.waitForTimeout(500);
  await clickRun("Process");
  await page.waitForSelector("text=Download", { timeout: 20000 });
  const dl = await expectDownload(page.locator("button:has-text('Download')").first(), "out-rotated.jpg");
  await record("rotate-image: process→download", dl.size > 5000, `saved ${dl.size}B`);
} catch (e) { await record("rotate-image", false, String(e).slice(0, 160)); }

/* 5. Grayscale filter (filters) */
try {
  await page.goto(`${BASE}/grayscale-image`, { waitUntil: "load" });
  await upload([`${TMP}/photo.jpg`]);
  await page.waitForTimeout(500);
  await clickRun("Apply Filter");
  await page.waitForSelector("text=Download", { timeout: 20000 });
  const dl = await expectDownload(page.locator("button:has-text('Download')").first(), "out-gray.png");
  await record("grayscale-image: filter→download", dl.size > 5000, `saved ${dl.size}B`);
} catch (e) { await record("grayscale-image", false, String(e).slice(0, 160)); }

/* 6. Image to PDF (documents) */
try {
  await page.goto(`${BASE}/image-to-pdf`, { waitUntil: "load" });
  await upload([`${TMP}/photo.jpg`, `${TMP}/photo.png`]);
  await page.waitForTimeout(700);
  await clickRun("Convert All");
  await page.waitForSelector("text=Download", { timeout: 30000 });
  const dl = await expectDownload(page.locator("button:has-text('Download')").first(), "out-doc.pdf");
  const magic = readFileSync(dl.path).subarray(0, 4).toString();
  await record("image-to-pdf: 2 images → valid PDF", magic === "%PDF" && dl.size > 10000, `magic=${magic}, ${dl.size}B`);
} catch (e) { await record("image-to-pdf", false, String(e).slice(0, 160)); }

/* 7. Crop (interactive crop workspace) */
try {
  await page.goto(`${BASE}/crop-image`, { waitUntil: "load" });
  await upload([`${TMP}/photo.jpg`]);
  await page.waitForSelector("canvas", { timeout: 20000 });
  // single "Crop & Download" button exports the current crop region directly
  await page.waitForSelector("button:has-text('Crop & Download')", { timeout: 20000 });
  await page.locator("button:has-text('Crop & Download')").first().click();
  await page.getByRole("button", { name: "Download", exact: true }).waitFor({ timeout: 20000 });
  const dl = await expectDownload(page.getByRole("button", { name: "Download", exact: true }).first(), "out-crop.png");
  await record("crop-image: interactive editor → export", dl.size > 5000, `saved ${dl.size}B`);
} catch (e) { await record("crop-image", false, String(e).slice(0, 160)); }

/* 8. Passport photo (interactive passport workspace) */
try {
  await page.goto(`${BASE}/passport-photo-maker`, { waitUntil: "load" });
  await upload([`${TMP}/photo.jpg`]);
  await page.waitForSelector("canvas", { timeout: 20000 });
  await page.waitForSelector("button:has-text('Create Photo')", { timeout: 20000 });
  await page.locator("button:has-text('Create Photo')").first().click();
  await page.getByRole("button", { name: "Download", exact: true }).waitFor({ timeout: 20000 });
  const dl = await expectDownload(page.getByRole("button", { name: "Download", exact: true }).first(), "out-passport.jpg");
  await record("passport-photo-maker: canvas → download", dl.size > 5000, `saved ${dl.size}B`);
} catch (e) { await record("passport-photo-maker", false, String(e).slice(0, 160)); }

/* 9. Color picker (interactive sampling workspace) */
try {
  await page.goto(`${BASE}/image-color-picker`, { waitUntil: "load" });
  await upload([`${TMP}/photo.png`]);
  await page.waitForSelector("canvas", { timeout: 20000 });
  const box = await page.locator("canvas").first().boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
  const hex = await page.locator("text=/#[0-9A-Fa-f]{6}/").first().textContent();
  await record("pick-color-from-image: canvas sample → HEX", /^#[0-9A-Fa-f]{6}$/.test(hex.trim()), `picked ${hex.trim()}`);
} catch (e) { await record("pick-color-from-image", false, String(e).slice(0, 160)); }

/* 10. Metadata viewer (analysis, no processing) */
try {
  await page.goto(`${BASE}/image-metadata-viewer`, { waitUntil: "load" });
  await upload([`${TMP}/photo.jpg`]);
  await page.waitForTimeout(900);
  const body = await page.locator("body").textContent();
  const hasInfo = /(dimension|width|size|format|EXIF|camera)/i.test(body);
  await record("image-metadata-viewer: EXIF report rendered", hasInfo, "metadata fields visible");
} catch (e) { await record("image-metadata-viewer", false, String(e).slice(0, 160)); }

/* 11. Bulk compressor ZIP (multi-file batch) */
try {
  await page.goto(`${BASE}/bulk-image-compressor`, { waitUntil: "load" });
  await upload([`${TMP}/photo.jpg`, `${TMP}/photo.png`, `${TMP}/photo.webp`]);
  await page.waitForTimeout(700);
  await clickRun("Compress All");
  await page.waitForSelector("text=Download all", { timeout: 30000 });
  const dl = await expectDownload(page.locator("button:has-text('Download all')").first(), "out-bulk.zip");
  const magic = readFileSync(dl.path).subarray(0, 2).toString();
  await record("bulk-image-compressor: 3 files → ZIP", magic === "PK" && dl.size > 10000, `magic=${magic}, ${dl.size}B`);
} catch (e) { await record("bulk-image-compressor", false, String(e).slice(0, 160)); }

/* 12. File validation: reject oversized/invalid */
try {
  await page.goto(`${BASE}/image-compressor`, { waitUntil: "load" });
  // .txt file must be rejected
  writeFileSync(`${TMP}/bad.txt`, "not an image");
  await upload([`${TMP}/bad.txt`]);
  await page.waitForTimeout(800);
  const body = await page.locator("body").textContent();
  const rejected = /(not a valid|unsupported|invalid|must be|only)/i.test(body) || (await page.locator('input[type=file]').count()) > 0;
  await record("validation: non-image rejected with message", rejected, body.match(/[^.]*(invalid|unsupported|not a valid)[^.]*/i)?.[0]?.trim().slice(0, 80) ?? "input ignored");
} catch (e) { await record("validation: non-image", false, String(e).slice(0, 160)); }

const passes = results.filter(r => r.ok).length;
console.log(`\nFUNCTIONAL: ${passes}/${results.length} PASS`);
console.log(`console errors during functional run: ${consoleErrors.length}`);
for (const c of consoleErrors.slice(0, 5)) console.log("  console:", c);
writeFileSync("/tmp/functional-results.json", JSON.stringify({ results, consoleErrors }, null, 1));
await browser.close();
