import { chromium } from "playwright-core";
const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await (await browser.newContext()).newPage();
await page.goto("http://localhost:3000/contact", { waitUntil: "load" });
// invalid states first
await page.locator("#c-name").fill("");
await page.locator('button[type=submit]').click();
const err1 = await page.locator("text=Please enter your name").count();
await page.locator("#c-name").fill("Audit Bot");
await page.locator("#c-email").fill("bad-email");
await page.locator("#c-message").fill("Automated audit message for the contact form.");
await page.locator('button[type=submit]').click();
const err2 = await page.locator("text=valid email").count();
// valid submission
await page.locator("#c-email").fill("audit@test.local");
await page.locator('button[type=submit]').click();
await page.waitForTimeout(600);
const success = await page.locator("text=Your email draft is ready").count();
console.log(`validation-name=${err1 > 0} validation-email=${err2 > 0} success-panel=${success > 0}`);
console.log((err1 && err2 && success) ? "PASS contact form flow works" : "FAIL contact form flow");
await browser.close();
