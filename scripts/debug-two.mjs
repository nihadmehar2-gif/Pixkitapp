import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
page.on("console", m => { if (m.type() === "error") console.log("CONSOLE-ERR:", m.text().slice(0, 200)); });
page.on("pageerror", e => console.log("PAGEERROR:", String(e).slice(0, 200)));
await page.goto("http://localhost:3000/add-white-background", { waitUntil: "load" });
const input = page.locator('input[type=file]').first();
await input.setInputFiles([
  { name: "photo.jpg", mimeType: "image/jpeg", buffer: readFileSync("/tmp/pxaudit/photo.jpg") },
  { name: "photo.png", mimeType: "image/png", buffer: readFileSync("/tmp/pxaudit/photo.png") },
]);
await page.waitForTimeout(2000);
const buttons = await page.locator("button").allTextContents();
console.log("BUTTONS:", JSON.stringify(buttons));
const alerts = await page.locator('[role=alert]').allTextContents().catch(() => []);
console.log("ALERTS:", JSON.stringify(alerts));
await page.screenshot({ path: "/tmp/debug-awb.png" });
await browser.close();
