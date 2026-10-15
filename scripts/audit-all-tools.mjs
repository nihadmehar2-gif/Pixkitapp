/** Full functional audit of all PixKitApp tools on the dev server (:3000).
 *  Per tool: navigate -> upload fixture -> run -> verify preview, download,
 *  magic bytes, real pixel dimensions (createImageBitmap), ZIP integrity,
 *  KB-target compliance, console/page errors.
 *  Run: node scripts/audit-all-tools.mjs [--only slug,slug] [--skip-zip]
 */
import { chromium } from "playwright-core";
import { writeFileSync, readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";

const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const BASE = process.env.AUDIT_BASE || "http://localhost:3000";
const TMP = "/tmp/pxaudit";
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

const argv = process.argv.slice(2);
const onlyArg = argv.includes("--only") ? argv[argv.indexOf("--only") + 1].split(",") : null;
const skipZip = argv.includes("--skip-zip");

const TOOLS = JSON.parse(readFileSync("/home/z/my-project/scripts/tools-rich.json", "utf8"));
const targets = onlyArg ? TOOLS.filter((t) => onlyArg.includes(t.slug)) : TOOLS;

/* ---------------- fixtures ---------------- */
async function makeFixtures(page) {
  await page.goto("about:blank");
  const fx = await page.evaluate(async () => {
    function draw(ctx, w, h, variant) {
      // layered gradients + shapes + pixel noise => realistic, hard-to-compress
      const g = ctx.createLinearGradient(0, 0, w, h);
      const hue = 200 + variant * 70;
      g.addColorStop(0, `hsl(${hue},70%,55%)`);
      g.addColorStop(0.5, `hsl(${hue + 40},60%,35%)`);
      g.addColorStop(1, `hsl(${hue + 90},75%,60%)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, 20 + Math.random() * (w / 8), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${(hue + i * 25) % 360},80%,${30 + Math.random() * 45}%,0.5)`;
        ctx.fill();
      }
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.round(w / 12)}px sans-serif`;
      ctx.fillText(`PixKit ${variant}`, w / 10, h / 6);
      const img = ctx.getImageData(0, 0, w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 26;
        d[i] += n; d[i + 1] += n; d[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
    }
    async function blobB64(canvas, type, q) {
      const blob = await new Promise((res) => canvas.toBlob(res, type, q));
      const buf = await blob.arrayBuffer();
      let s = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192));
      return { b64: btoa(s), size: blob.size };
    }
    function mk(w, h, variant) {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      draw(c.getContext("2d"), w, h, variant);
      return c;
    }
    const photo = mk(1200, 800, 1);
    const photo2 = mk(1100, 900, 2);
    const photo3 = mk(1000, 700, 3);
    const big = mk(2400, 1600, 4);
    const pngC = mk(800, 600, 5);
    // transparency for PNG fixture
    const pctx = pngC.getContext("2d");
    pctx.globalCompositeOperation = "destination-out";
    pctx.beginPath(); pctx.arc(pngC.width / 2, pngC.height / 2, 140, 0, Math.PI * 2); pctx.fill();
    pctx.globalCompositeOperation = "source-over";
    const logo = mk(300, 300, 6);
    const doc = document.createElement("canvas");
    doc.width = 900; doc.height = 1200;
    const dctx = doc.getContext("2d");
    dctx.fillStyle = "#ffffff"; dctx.fillRect(0, 0, 900, 1200);
    dctx.fillStyle = "#111111";
    for (let i = 0; i < 30; i++) dctx.fillRect(80, 80 + i * 34, 740 - (i % 4) * 90, 12);
    const [jpg, jpg2, jpg3, bigJ, png, webp, logoP, docP] = await Promise.all([
      blobB64(photo, "image/jpeg", 0.85),
      blobB64(photo2, "image/jpeg", 0.85),
      blobB64(photo3, "image/jpeg", 0.85),
      blobB64(big, "image/jpeg", 0.9),
      blobB64(pngC, "image/png"),
      blobB64(photo, "image/webp", 0.85),
      blobB64(logo, "image/png"),
      blobB64(doc, "image/png"),
    ]);
    return { jpg, jpg2, jpg3, bigJ, png, webp, logoP, docP };
  });
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="#7c3aed"/><circle cx="120" cy="110" r="60" fill="#fbbf24"/><rect x="40" y="180" width="160" height="24" fill="#fff"/></svg>`
  );
  const save = (name, o) => { writeFileSync(`${TMP}/${name}`, Buffer.from(o.b64, "base64")); return `${TMP}/${name}`; };
  const paths = {
    jpg: save("photo.jpg", fx.jpg),
    jpg2: save("photo2.jpg", fx.jpg2),
    jpg3: save("photo3.jpg", fx.jpg3),
    big: save("big.jpg", fx.bigJ),
    png: save("photo.png", fx.png),
    webp: save("photo.webp", fx.webp),
    logo: save("logo.png", fx.logoP),
    doc: save("doc.png", fx.docP),
    svg: `${TMP}/logo.svg`,
  };
  writeFileSync(paths.svg, svg);
  // base64 fixture for base64-to-image (data URI of the PNG)
  writeFileSync(`${TMP}/encoded.txt`, `data:image/png;base64,${fx.png.b64}`);
  paths.b64txt = `${TMP}/encoded.txt`;
  return paths;
}

/* ---------------- helpers ---------------- */
const MAGIC = [
  { re: /\.(jpe?g)$/i, test: (b) => b[0] === 0xff && b[1] === 0xd8 },
  { re: /\.png$/i, test: (b) => b[0] === 0x89 && b[1] === 0x50 },
  { re: /\.webp$/i, test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  { re: /\.pdf$/i, test: (b) => b.subarray(0, 4).toString() === "%PDF" },
  { re: /\.zip$/i, test: (b) => b[0] === 0x50 && b[1] === 0x4b },
  { re: /\.bmp$/i, test: (b) => b[0] === 0x42 && b[1] === 0x4d },
  { re: /\.ico$/i, test: (b) => b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0 },
  { re: /\.txt$/i, test: () => true },
];

const MIME_BY_EXT = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  gif: "image/gif", bmp: "image/bmp", avif: "image/avif", svg: "image/svg+xml",
  txt: "text/plain", ico: "image/x-icon",
};

async function realDims(page, filePath) {
  const b64 = readFileSync(filePath).toString("base64");
  return await page.evaluate(async (d) => {
    try {
      const blob = await (await fetch(`data:application/octet-stream;base64,${d}`)).blob();
      const bmp = await createImageBitmap(blob);
      const dims = { w: bmp.width, h: bmp.height };
      bmp.close();
      return dims;
    } catch {
      return null;
    }
  }, b64);
}

function zipEntries(buf) {
  let n = 0;
  for (let i = 0; i < buf.length - 3; i++) {
    if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x01 && buf[i + 3] === 0x02) n++;
  }
  return n;
}

function pickFixtures(t, fx) {
  const accept = t.accept;
  if (t.slug === "base64-to-image") return [fx.b64txt];
  if (t.slug === "add-logo-watermark") return null; // handled specially
  if (accept.some((a) => a.includes("svg"))) return [fx.svg];
  if (accept.some((a) => a.includes("gif"))) return [fx.gif];
  if (accept.some((a) => a.includes("bmp"))) return [fx.bmp];
  if (accept.some((a) => a.includes("avif"))) return [fx.avif];
  const singles = [];
  if (accept.some((a) => a.includes("jpeg"))) singles.push(fx.jpg);
  else if (accept.some((a) => a.includes("png"))) singles.push(fx.png);
  else if (accept.some((a) => a.includes("webp"))) singles.push(fx.webp);
  else singles.push(fx.jpg);
  if (t.multiple) {
    const more = [];
    const isAcc = (type) => accept.length === 0 || accept.some((a) => a.includes(type));
    if (isAcc("png") && !singles.includes(fx.png)) more.push(fx.png);
    if (isAcc("webp") && !singles.includes(fx.webp)) more.push(fx.webp);
    if (isAcc("jpeg") && more.length < 2 && !singles.includes(fx.jpg)) more.push(fx.jpg2);
    return [...singles, ...more].slice(0, 3);
  }
  return singles;
}

function actionLabelPattern(t) {
  if (t.processor === "metadataReport") return "Read Metadata";
  if (t.processor === "base64Decode") return "Decode Image";
  if (t.cat === "compression" || t.cat === "optimization") return "Compress( All)?";
  if (t.cat === "conversion") return "Convert( All)?";
  if (t.cat === "resizing") return "Resize( All)?";
  if (t.cat === "filters") return "Apply Filter";
  return "Process( Image| \\d+ Images)?";
}

/* KB-target tools get strict checks */
const KB_TARGETS = {
  "compress-image-to-50kb": 50,
  "compress-image-to-100kb": 100,
  "compress-image-to-200kb": 200,
  "compress-image-to-500kb": 500,
  "compress-image-to-specific-size": 150, // default targetKB=150
  "resize-image-to-kb": 200, // default targetKB=200
};

/* ---------------- main ---------------- */
const browser = await chromium.launch({
  executablePath: EXEC,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await context.newPage();

console.log("Generating fixtures…");
const fx = await makeFixtures(page);
// GIF/BMP/AVIF fixtures via ffmpeg from the noisy photo.jpg — pickFixtures()
// expects test.gif / test.bmp / test.avif; regenerate any that are missing.
const FFMPEG_FIXTURES = [
  ["test.bmp", ["-y", "-i", `${TMP}/photo.jpg`, "-frames:v", "1", `${TMP}/test.bmp`]],
  ["test.gif", ["-y", "-i", `${TMP}/photo.jpg`, "-loop", "1", "-t", "0.4", "-r", "10", `${TMP}/test.gif`]],
  ["test.avif", ["-y", "-i", `${TMP}/photo.jpg`, "-frames:v", "1", `${TMP}/test.avif`]],
];
for (const [name, args] of FFMPEG_FIXTURES) {
  if (!existsSync(`${TMP}/${name}`)) {
    execSync(`ffmpeg ${args.map((a) => JSON.stringify(a)).join(" ")} -loglevel error`);
  }
}
fx.gif = `${TMP}/test.gif`;
fx.bmp = `${TMP}/test.bmp`;
fx.avif = `${TMP}/test.avif`;
console.log("Fixtures ready:", Object.keys(fx).join(", "));

const results = [];
let current = { console: [], requests: [] };
page.on("console", (m) => { if (m.type() === "error") current.console.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => current.console.push("PAGEERROR " + String(e).slice(0, 200)));
page.on("requestfailed", (r) => {
  const u = r.url();
  if (u.startsWith(BASE)) current.requests.push(`FAIL ${r.failure()?.errorText} ${u.slice(BASE.length).slice(0, 120)}`);
});

async function downloadVia(selectorish, saveAs) {
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 25000 }),
    selectorish.click(),
  ]);
  const path = `${TMP}/${saveAs}`;
  await download.saveAs(path);
  return { path, name: download.suggestedFilename(), size: statSync(path).size };
}

async function auditTool(t) {
  current = { console: [], requests: [] };
  const r = { slug: t.slug, cat: t.cat, processor: t.processor, ok: false, checks: [], notes: [], console: [], zip: null };
  const note = (m) => r.notes.push(m);
  try {
    const resp = await page.goto(`${BASE}/${t.slug}`, { waitUntil: "load", timeout: 45000 });
    if (resp && resp.status() !== 200) throw new Error(`HTTP ${resp.status()}`);
    await page.waitForSelector('input[type=file]', { timeout: 30000, state: "attached" });

    // ---- upload ----
    let uploadCount = 0;
    if (t.slug === "add-logo-watermark") {
      const inputs = page.locator('input[type=file]');
      await inputs.nth(0).setInputFiles([fx.jpg]);
      await page.waitForTimeout(400);
      await inputs.nth(1).setInputFiles([fx.logo]);
      uploadCount = 1;
      r.checks.push("uploaded image+logo");
    } else {
      const files = pickFixtures(t, fx);
      uploadCount = files.length;
      const main = page.locator('input[type=file]').first();
      await main.setInputFiles([...new Set(files)].map((p) => {
        const ext = p.split(".").pop().toLowerCase();
        return { name: p.split("/").pop(), mimeType: MIME_BY_EXT[ext] ?? "", buffer: readFileSync(p) };
      }));
      r.checks.push(`uploaded ${new Set(files).size} file(s)`);
    }
    await page.waitForTimeout(700);

    let downloadSeen = false;
    const isInteractivePassport = t.interactive === "passport";
    const isInteractiveCrop = t.interactive === "crop";
    const isPicker = t.processor === "pickColor";
    const isMeta = t.processor === "metadataReport";

    if (isPicker) {
      await page.waitForSelector("canvas", { timeout: 20000 });
      const box = await page.locator("canvas").first().boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(600);
      const hex = await page.locator("text=/#[0-9A-Fa-f]{6}/").first().textContent({ timeout: 10000 });
      r.checks.push(`picked ${hex.trim()}`);
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex.trim())) throw new Error("no valid HEX sampled");
      r.ok = true;
    } else if (isMeta) {
      await page.getByRole("button", { name: "Read Metadata" }).first().click();
      await page.waitForTimeout(1500);
      const body = await page.locator("body").textContent();
      const has = /(dimension|width|height|format|type|size)/i.test(body);
      if (!has) throw new Error("metadata report not rendered");
      r.checks.push("metadata report rendered");
      r.ok = true;
    } else {
      // ---- run ----
      if (isInteractiveCrop) {
        await page.waitForSelector("canvas", { timeout: 20000 });
        await page.locator("button:has-text('Crop & Download')").first().click();
      } else if (isInteractivePassport) {
        await page.waitForSelector("canvas", { timeout: 20000 });
        await page.locator("button:has-text('Create Photo')").first().click();
      } else {
        const label = actionLabelPattern(t);
        const btn = page.getByRole("button", { name: new RegExp(`^(${label})$`, "i") });
        await btn.first().click({ timeout: 15000 });
      }

      // ---- wait for results ----
      const dlBtn = page.getByRole("button", { name: /^Download$/ }).first();
      await dlBtn.waitFor({ timeout: 40000 });
      await page.waitForTimeout(300);
      downloadSeen = true;

      // dims text on results?
      const bodyText = await page.locator("body").textContent();
      const dimsM = bodyText.match(/(\d{1,5})×(\d{1,5})/);
      if (dimsM) r.checks.push(`panel dims ${dimsM[1]}×${dimsM[2]}`);

      // ---- first download ----
      const dl = await downloadVia(dlBtn, `out-${t.slug}.bin`);
      const buf = readFileSync(dl.path);
      r.file = { name: dl.name, size: dl.size };
      const magic = MAGIC.find((m) => m.re.test(dl.name));
      if (magic && !magic.test(buf)) throw new Error(`magic bytes wrong for ${dl.name}`);
      r.checks.push(`download ${dl.name} ${dl.size}B magic-ok`);
      if (dl.size < 100) throw new Error(`suspiciously tiny output (${dl.size}B)`);

      // real pixel dims of the output
      const dims = await realDims(page, dl.path);
      if (dims) {
        r.outDims = `${dims.w}×${dims.h}`;
        // social + exact-dimension verification
        const expW = t.params?.__w ?? t.params?.width;
        const expH = t.params?.__h ?? t.params?.height;
        if (t.processor === "socialResize" && expW && expH) {
          if (dims.w !== expW || dims.h !== expH) throw new Error(`dims ${dims.w}×${dims.h} != expected ${expW}×${expH}`);
          r.checks.push(`exact dims ${expW}×${expH} OK`);
        }
        if (t.processor === "faviconPack") r.checks.push(`favicon first output ${dims.w}×${dims.h}`);
      } else {
        r.checks.push("dims: not decodable (txt/pdf/ico ok)");
      }

      // ---- KB-target compliance ----
      if (KB_TARGETS[t.slug] !== undefined) {
        const targetBytes = KB_TARGETS[t.slug] * 1024;
        if (dl.size > targetBytes) throw new Error(`TARGET EXCEEDED: ${dl.size}B > ${KB_TARGETS[t.slug]}KB`);
        r.checks.push(`target ${KB_TARGETS[t.slug]}KB met (${dl.size}B)`);
      }

      // ---- ZIP check ----
      if (!skipZip) {
        const zipBtn = page.getByRole("button", { name: /Download all \(ZIP\)/i }).first();
        if (await zipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          const z = await downloadVia(zipBtn, `zip-${t.slug}.zip`);
          const zbuf = readFileSync(z.path);
          const entries = zipEntries(zbuf);
          r.zip = { name: z.name, size: z.size, entries };
          if (zbuf[0] !== 0x50 || zbuf[1] !== 0x4b) throw new Error("ZIP magic wrong");
          if (entries < 1) throw new Error("ZIP has 0 entries");
          r.checks.push(`zip ok (${entries} entries, ${z.size}B)`);
        }
      }
      r.ok = true;
    }
  } catch (e) {
    r.error = String(e).slice(0, 220);
  }
  r.console = current.console;
  if (current.requests.length) r.net = current.requests.slice(0, 3);
  if (r.console.length > 0) r.ok = false;
  const status = r.ok ? "PASS" : "FAIL";
  console.log(`${status}  ${t.slug}  ${r.error ?? r.checks.join(" | ")}`);
  return r;
}

const out = [];
for (let i = 0; i < targets.length; i++) {
  const t = targets[i];
  let r = await auditTool(t);
  if (!r.ok && onlyArg) {
    // retry once for --only runs to rule out flakiness
    console.log(`RETRY ${t.slug}`);
    r = await auditTool(t);
  }
  out.push(r);
  if ((i + 1) % 20 === 0) console.log(`--- ${i + 1}/${targets.length} done ---`);
}

writeFileSync("/tmp/audit-results.json", JSON.stringify(out, null, 1));
const pass = out.filter((r) => r.ok).length;
console.log(`\nAUDIT: ${pass}/${out.length} PASS`);
const failed = out.filter((r) => !r.ok);
for (const f of failed) console.log(`FAIL ${f.slug}: ${f.error ?? "console errors: " + f.console.join(" ; ")}`);
await browser.close();
process.exit(0);
