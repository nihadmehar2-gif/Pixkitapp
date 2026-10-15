import { chromium } from "playwright-core";
const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await (await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })).newPage();
await page.goto("http://localhost:3000/image-compressor", { waitUntil: "load" });
await page.waitForTimeout(900);
const tiny = await page.evaluate(() =>
  [...document.querySelectorAll('button, a')]
    .filter(el => { const r = el.getBoundingClientRect(); return r.height > 0 && r.height < 24 && !el.getAttribute('aria-label'); })
    .map(el => ({ tag: el.tagName, text: (el.textContent || "").trim().slice(0, 30), h: Math.round(el.getBoundingClientRect().height), w: Math.round(el.getBoundingClientRect().width) }))
);
console.log(JSON.stringify(tiny, null, 1));
await browser.close();
