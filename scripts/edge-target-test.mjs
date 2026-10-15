/** Edge cases for KB-target tools: extreme 10KB target, custom target change,
 *  tiny-source (output must never exceed target), WebP format path. */
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from "node:fs";
const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const TMP = "/tmp/pxaudit";
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });
const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true })).newPage();
const out = [];
const rec = (n, ok, d) => { out.push({ n, ok, d }); console.log(`${ok ? "PASS" : "FAIL"} ${n} ${d}`); };

async function run(slug, file, setup, btnName) {
  await page.goto(`http://localhost:3000/${slug}`, { waitUntil: "load" });
  await page.locator('input[type=file]').first().setInputFiles([{ name: file.split("/").pop(), mimeType: "", buffer: readFileSync(file) }]);
  await page.waitForTimeout(800);
  if (setup) await setup();
  const btn = page.getByRole("button", { name: btnName }).first();
  await btn.click();
  return btn;
}
async function firstDownload() {
  const dlBtn = page.getByRole("button", { name: /^Download$/ }).first();
  await dlBtn.waitFor({ timeout: 40000 });
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 25000 }),
    dlBtn.click(),
  ]);
  const p = `${TMP}/edge-${Date.now()}.bin`;
  await download.saveAs(p);
  return { path: p, name: download.suggestedFilename(), size: statSync(p).size };
}

// 1. custom target lowered to 10KB via number input on the big photo
try {
  await run("compress-image-to-specific-size", `${TMP}/big.jpg`, async () => {
    const num = page.locator('input[type=number]').first();
    await num.fill("10");
    await num.dispatchEvent("change");
  }, /^Compress$/);
  const dl = await firstDownload();
  const ok = dl.size <= 10 * 1024;
  rec("custom-target-10KB big.jpg", ok, `${dl.size}B ${ok ? "<=" : ">"} 10240B (${dl.name})`);
} catch (e) { rec("custom-target-10KB", false, String(e).slice(0, 140)); }

// 2. resize-image-to-kb custom 30KB
try {
  await run("resize-image-to-kb", `${TMP}/big.jpg`, async () => {
    const num = page.locator('input[type=number]').first();
    await num.fill("30");
    await num.dispatchEvent("change");
  }, /^Resize$/);
  const dl = await firstDownload();
  const ok = dl.size <= 30 * 1024;
  rec("resize-to-kb 30KB big.jpg", ok, `${dl.size}B ${ok ? "<=" : ">"} 30720B (${dl.name})`);
} catch (e) { rec("resize-to-kb-30KB", false, String(e).slice(0, 140)); }

// 3. tiny source vs big target: output must never EXCEED target even if source smaller
try {
  await run("compress-image-to-500kb", `${TMP}/photo.jpg`, null, /^Compress$/);
  const dl = await firstDownload();
  const ok = dl.size <= 500 * 1024;
  rec("tiny-source 500KB-target", ok, `source ${statSync(`${TMP}/photo.jpg`).size}B -> out ${dl.size}B, still <= 512000B`);
} catch (e) { rec("tiny-source", false, String(e).slice(0, 140)); }

// 4. WebP format path on 50KB tool
try {
  await run("compress-image-to-50kb", `${TMP}/big.jpg`, async () => {
    const trig = page.locator('button[role=combobox]').first();
    await trig.scrollIntoViewIfNeeded();
    await trig.click();
    await page.getByRole("option", { name: /WebP/ }).first().click();
  }, /^Compress$/);
  const dl = await firstDownload();
  const buf = readFileSync(dl.path);
  const isWebp = buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";
  const ok = isWebp && dl.size <= 50 * 1024;
  rec("50KB WebP output", ok, `${dl.name} ${dl.size}B webp-magic=${isWebp}`);
} catch (e) { rec("50KB-webp", false, String(e).slice(0, 140)); }

// 5. optimizer filename after fix (no 100000kb leak)
try {
  await run("image-optimizer", `${TMP}/photo.jpg`, null, /^Compress$/);
  const dl = await firstDownload();
  rec("optimizer filename", !/100000kb/.test(dl.name), dl.name);
} catch (e) { rec("optimizer-filename", false, String(e).slice(0, 140)); }

console.log(`\nEDGE: ${out.filter(o => o.ok).length}/${out.length} PASS`);
writeFileSync("/tmp/edge-results.json", JSON.stringify(out, null, 1));
await browser.close();
