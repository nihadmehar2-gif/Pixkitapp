import { chromium } from "playwright-core";
const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const PAGES = ["/", "/image-compressor", "/compress-image-to-50kb", "/crop-image", "/passport-photo-maker", "/about", "/contact", "/privacy", "/terms", "/tools"];
const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" });
const page = await ctx.newPage();
const errs = [];
page.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 120)); });
page.on("pageerror", e => errs.push("PAGEERROR " + String(e).slice(0, 120)));
let fails = 0;
for (const p of PAGES) {
  await page.goto(`http://localhost:3000${p}`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const m = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    tapTargets: [...document.querySelectorAll('button, a')].filter(el => { const r = el.getBoundingClientRect(); return (r.height > 0 && r.height < 24 && !el.getAttribute('aria-label')); }).length,
  }));
  const ok = m.overflow <= 0;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${p} overflow=${m.overflow}px tiny-tap-targets=${m.tapTargets}`);
}
console.log(`console errors: ${errs.length}`, errs.slice(0, 3));
console.log(fails === 0 && errs.length === 0 ? "MOBILE SWEEP: ALL PASS" : `MOBILE SWEEP: ${fails} FAILS`);
await browser.close();
