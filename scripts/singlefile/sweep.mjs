/** Full functional sweep of download/index.html (served on :3456).
 *  For EVERY tool: navigate → upload fixture(s) → run → capture download →
 *  verify size + magic bytes → collect console/page errors.
 *  Special text-verified tools: pickColor, metadataReport.
 *  Usage: node scripts/singlefile/sweep.mjs [--start N] [--end N] [--only a,b]  */
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, statSync, mkdirSync } from "node:fs";

const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const BASE = "http://localhost:3456";
const FX = "/tmp/pxsweep";
const OUTDIR = "/tmp/pxsweep/dl";
mkdirSync(OUTDIR, { recursive: true });

const argv = process.argv.slice(2);
const start = argv.includes("--start") ? +argv[argv.indexOf("--start") + 1] : 0;
const end = argv.includes("--end") ? +argv[argv.indexOf("--end") + 1] : Infinity;
const only = argv.includes("--only") ? argv[argv.indexOf("--only") + 1].split(",") : null;

const meta = JSON.parse(readFileSync("/tmp/singlefile-meta.json", "utf8"));
const tools = only ? meta.tools.filter((t) => only.includes(t.slug)) : meta.tools.slice(start, end === Infinity ? undefined : end);

const MAGIC = [
  { re: /\.(jpe?g)$/i, test: (b) => b[0] === 0xff && b[1] === 0xd8 },
  { re: /\.png$/i, test: (b) => b[0] === 0x89 && b[1] === 0x50 },
  { re: /\.webp$/i, test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  { re: /\.gif$/i, test: (b) => b.subarray(0, 3).toString() === "GIF" },
  { re: /\.bmp$/i, test: (b) => b[0] === 0x42 && b[1] === 0x4d },
  { re: /\.pdf$/i, test: (b) => b.subarray(0, 4).toString() === "%PDF" },
  { re: /\.zip$/i, test: (b) => b[0] === 0x50 && b[1] === 0x4b },
  { re: /\.ico$/i, test: (b) => b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0 },
  { re: /\.svg$/i, test: (b) => b.toString().slice(0, 200).includes("<svg") },
  { re: /\.(txt|base64)$/i, test: () => true },
];

function pickFixtures(t) {
  const accept = t.accept || [];
  if (t.slug === "base64-to-image") return [`${FX}/encoded.txt`];
  if (accept.some((a) => a.includes("svg"))) return [`${FX}/logo.svg`];
  if (accept.some((a) => a.includes("gif"))) return [`${FX}/test.gif`];
  if (accept.some((a) => a.includes("bmp"))) return [`${FX}/test.bmp`];
  if (accept.some((a) => a.includes("avif"))) return [`${FX}/test.avif`];
  const singles = [];
  if (accept.some((a) => a.includes("jpeg"))) singles.push(`${FX}/photo.jpg`);
  else if (accept.some((a) => a.includes("png"))) singles.push(`${FX}/photo.png`);
  else if (accept.some((a) => a.includes("webp"))) singles.push(`${FX}/photo.webp`);
  else singles.push(`${FX}/photo.jpg`);
  if (t.multiple) {
    const more = [];
    const isAcc = (type) => accept.length === 0 || accept.some((a) => a.includes(type));
    if (isAcc("png")) more.push(`${FX}/photo.png`);
    if (isAcc("webp")) more.push(`${FX}/photo.webp`);
    if (isAcc("jpeg") && more.length < 2) more.push(`${FX}/photo2.jpg`);
    return [...singles, ...more].slice(0, 3);
  }
  return singles;
}

const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", bmp: "image/bmp", avif: "image/avif", svg: "image/svg+xml", txt: "text/plain" };

const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await context.newPage();

let current = { console: [] };
page.on("console", (m) => { if (m.type() === "error") current.console.push(m.text().slice(0, 180)); });
page.on("pageerror", (e) => current.console.push("PAGEERROR " + String(e).slice(0, 180)));
page.on("requestfailed", (r) => { const u = r.url(); if (u.startsWith(BASE)) current.console.push("REQFAIL " + u.slice(BASE.length).slice(0, 100)); });

let n = 0;
async function auditTool(t) {
  const r = { slug: t.slug, cat: t.cat || t.category, ok: false, checks: [], error: null, console: [] };
  current = { console: [] };
  try {
    await page.goto(`${BASE}/#/t/${t.slug}`, { waitUntil: "load", timeout: 45000 });
    await page.waitForSelector("input[type=file]", { timeout: 25000, state: "attached" });
    await page.waitForTimeout(250);

    // ---- upload ----
    if (t.slug === "add-logo-watermark") {
      const inputs = page.locator("input[type=file]");
      await inputs.nth(0).setInputFiles([{ name: "photo.jpg", mimeType: "image/jpeg", buffer: readFileSync(`${FX}/photo.jpg`) }]);
      await page.waitForTimeout(350);
      await inputs.nth(1).setInputFiles([{ name: "logo.png", mimeType: "image/png", buffer: readFileSync(`${FX}/logo.png`) }]);
      r.checks.push("uploaded image+logo");
    } else {
      const files = pickFixtures(t);
      const main = page.locator("input[type=file]").first();
      await main.setInputFiles(files.map((p) => {
        const ext = p.split(".").pop().toLowerCase();
        return { name: p.split("/").pop(), mimeType: MIME[ext] || "application/octet-stream", buffer: readFileSync(p) };
      }));
      r.checks.push(`uploaded ${files.length} file(s)`);
    }
    await page.waitForTimeout(300);

    // ---- act ----
    if (t.interactive === "crop" || t.interactive === "passport") {
      const btn = page.getByRole("button", { name: /Crop & Download|Create Photo/ });
      await btn.waitFor({ timeout: 20000 });
      // Some crop modes download directly; others reveal a Download button.
      let dl = null;
      try {
        [dl] = await Promise.all([page.waitForEvent("download", { timeout: 8000 }), btn.click()]);
      } catch {
        const dlBtn = page.getByRole("button", { name: "Download", exact: true }).first();
        await dlBtn.waitFor({ timeout: 25000 });
        [dl] = await Promise.all([page.waitForEvent("download", { timeout: 40000 }), dlBtn.click()]);
      }
      const path = `${OUTDIR}/${t.slug}-out`;
      await dl.saveAs(path);
      const size = statSync(path).size;
      const name = dl.suggestedFilename();
      const rule = MAGIC.find((m) => m.re.test(name));
      const magicOk = rule ? rule.test(readFileSync(path).subarray(0, 32).length ? readFileSync(path) : Buffer.alloc(0)) : true;
      r.checks.push(`${t.interactive} export ${name} ${size}B magic=${rule ? magicOk : "n/a"}`);
      if (size < 500) throw new Error(`suspiciously small output ${size}B`);
      if (rule && !magicOk) throw new Error(`bad magic bytes for ${name}`);
    } else if (t.processor === "pickColor") {
      // ColorPickerWorkspace shows colors right after upload — no action button.
      await page.waitForTimeout(900);
      const body = await page.textContent("body");
      if (!/#[0-9a-f]{6}/i.test(body)) throw new Error("color picker: no hex value rendered");
      r.checks.push("color info verified (no download by design)");
    } else {
      const run = page.getByRole("button", { name: /^(Compress|Convert|Resize|Apply Filter|Process( \d+)? Images?|Read Metadata|Decode Image)( All)?$/i }).first();
      await run.waitFor({ timeout: 15000 });
      await run.click();
      const dlBtn = page.getByRole("button", { name: "Download", exact: true }).first();
      let gotDownload = true;
      try {
        await dlBtn.waitFor({ timeout: 25000 });
      } catch {
        gotDownload = false;
      }
      if (gotDownload) {
        const [dl] = await Promise.all([
          page.waitForEvent("download", { timeout: 40000 }),
          dlBtn.click(),
        ]);
        const path = `${OUTDIR}/${t.slug}-out`;
        await dl.saveAs(path);
        const size = statSync(path).size;
        const name = dl.suggestedFilename();
        const buf = readFileSync(path);
        const rule = MAGIC.find((m) => m.re.test(name));
        const magicOk = rule ? rule.test(buf) : true;
        r.checks.push(`download ${name} ${size}B magic=${rule ? magicOk : "n/a"}`);
        if (size < 50) throw new Error(`suspiciously small output ${size}B`);
        if (rule && !magicOk) throw new Error(`bad magic bytes for ${name}`);
      } else if (t.processor === "pickColor") {
        // ColorPickerWorkspace shows colors right after upload — no action button.
        await page.waitForTimeout(800);
        const body = await page.textContent("body");
        if (!/#[0-9a-f]{6}/i.test(body)) throw new Error("color picker: no hex value rendered");
        r.checks.push("color info verified (no download by design)");
      } else if (t.processor === "metadataReport") {
        const body = (await page.textContent("body")) || "";
        if (!/dimension|width|height|exif|metadata/i.test(body) || body.length < 400) throw new Error("metadata report: no report rendered");
        r.checks.push("metadata report verified (no download by design)");
      } else {
        throw new Error("no Download button and no text-verification path");
      }
    }
    r.ok = current.console.length === 0;
    if (current.console.length) r.console = current.console;
  } catch (e) {
    r.error = String(e && e.message || e).slice(0, 220);
    r.console = current.console.slice(0, 3);
    try {
      const errText = await page.evaluate(() => {
        const el = document.querySelector(".text-destructive");
        const toasts = [...document.querySelectorAll("[role=status], [role=alert]")].map((x) => x.textContent.trim().slice(0, 100));
        return (el ? "fieldErr:" + el.textContent.slice(0, 100) + " " : "") + (toasts.length ? "toasts:" + toasts.join(" ~ ") : "");
      });
      if (errText.trim()) r.error += " " + errText;
    } catch {}
  }
  const status = r.ok ? "PASS" : "FAIL";
  console.log(`${status}  ${t.slug}  ${r.error ?? r.checks.join(" | ")}`);
  return r;
}

const results = [];
for (const t of tools) {
  results.push(await auditTool(t));
  if (++n % 20 === 0) console.log(`--- ${n}/${tools.length} done ---`);
  writeFileSync("/tmp/singlefile-sweep.json", JSON.stringify(results, null, 1));
}
const pass = results.filter((r) => r.ok).length;
console.log(`\nSWEEP: ${pass}/${results.length} PASS`);
for (const f of results.filter((r) => !r.ok)) console.log(`FAIL ${f.slug}: ${f.error}${f.console.length ? " | console: " + f.console.join(" ; ") : ""}`);
await browser.close();
process.exit(pass === results.length ? 0 : 1);
