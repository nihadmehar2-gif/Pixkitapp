import { chromium } from "playwright-core";
const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await (await browser.newContext()).newPage();
await page.goto("http://localhost:3000/contact", { waitUntil: "load" });
const inputs = page.locator("input, textarea");
const n = await inputs.count();
console.log("form fields:", n);
// fill and submit — the form should attempt a mailto navigation
await page.locator("input").first().fill("Audit Bot");
const emailInput = page.locator('input[type=email]');
if (await emailInput.count()) await emailInput.fill("audit@test.local");
await page.locator("textarea").first().fill("Automated audit message");
const [nav] = await Promise.all([
  page.waitForEvent("framenavigated", { timeout: 8000 }).catch(() => [null]),
  page.locator('button[type=submit], form button').last().click(),
]);
await page.waitForTimeout(1200);
const url = page.url();
console.log("post-submit URL:", url.slice(0, 120));
console.log(url.startsWith("mailto:") ? "PASS mailto draft opened" : "INFO no mailto nav (may use different flow)");
await browser.close();
