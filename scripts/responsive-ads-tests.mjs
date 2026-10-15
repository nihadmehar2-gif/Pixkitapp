/** Responsive + ad-slot overlap verification on the production build.
 *  Viewports: 375 / 768 / 1440. Checks horizontal overflow on key pages,
 *  then measures ad containers vs. interactive controls for overlap.
 *  Run: node scripts/responsive-ads-tests.mjs
 */
import { chromium } from "playwright-core";

const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"] });

const PAGES = ["/", "/image-compressor", "/crop-image", "/passport-photo-maker"];
const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

let allOk = true;
for (const vp of VIEWPORTS) {
  const page = await (await browser.newContext({ viewport: { width: vp.width, height: vp.height } })).newPage();
  for (const p of PAGES) {
    await page.goto(`${BASE}${p}`, { waitUntil: "load" });
    await page.waitForTimeout(900);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const ok = overflow <= 1;
    if (!ok) allOk = false;
    console.log(`${ok ? "PASS" : "FAIL"} ${vp.name} ${p} — horizontal overflow: ${overflow}px`);
  }
  if (vp.name === "mobile-375") {
    await page.goto(`${BASE}/image-compressor`, { waitUntil: "load" });
    await page.screenshot({ path: "/tmp/pxtest/resp-375-tool.png" });
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.screenshot({ path: "/tmp/pxtest/resp-375-home.png" });
  }
  await page.close();
}

/* Ad-slot overlap check at 375 and 1440 on a tool page */
for (const vp of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  const page = await (await browser.newContext({ viewport: vp })).newPage();
  await page.goto(`${BASE}/image-compressor`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const report = await page.evaluate(() => {
    const ads = [...document.querySelectorAll('[aria-label="Advertisement space"], [aria-label="Advertisement"]')];
    // interactive controls: buttons + inputs inside main workspace area
    const controls = [...document.querySelectorAll("main button, main input, main select, main textarea")];
    const boxes = (el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; };
    const overlaps = [];
    for (const ad of ads) {
      const a = boxes(ad);
      for (const c of controls) {
        const b = boxes(c);
        const v = !(b.bottom <= a.top || b.top >= a.bottom);
        const h = !(b.right <= a.left || b.left >= a.right);
        if (v && h) overlaps.push(`${c.tagName}:${(c.textContent || c.type || "").slice(0, 20)} inside ad box`);
      }
    }
    return {
      adCount: ads.length,
      adBoxes: ads.map((a) => { const b = boxes(a); return `top=${Math.round(b.top)} h=${Math.round(b.bottom - b.top)}`; }),
      controlCount: controls.length,
      overlaps,
    };
  });
  const ok = report.overlaps.length === 0;
  if (!ok) allOk = false;
  console.log(`${ok ? "PASS" : "FAIL"} ad-overlap ${vp.width}px — ads: ${report.adCount} [${report.adBoxes.join(", ")}], controls checked: ${report.controlCount}, overlaps: ${report.overlaps.length}`);
  report.overlaps.slice(0, 3).forEach((o) => console.log("   overlap:", o));
  if (vp.width === 1440) await page.screenshot({ path: "/tmp/pxtest/ads-1440.png", fullPage: true });
  await page.close();
}

console.log(allOk ? "\nRESPONSIVE+ADS: ALL PASS" : "\nRESPONSIVE+ADS: FAILURES PRESENT");
await browser.close();
