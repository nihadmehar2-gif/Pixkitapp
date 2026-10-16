/** Quick smoke: console errors + ad-slot absence + note visibility on 3 pages. */
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3100";
const pages = [
  { path: "/", checkAd: true },
  { path: "/image-compressor", checkAd: true },
  { path: "/passport-photo-maker", checkAd: true, checkNote: true },
];

const browser = await chromium.launch();
let fails = 0;
for (const p of pages) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 120)); });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(BASE + p.path, { waitUntil: "networkidle", timeout: 30000 });
  const advCount = await page.locator("text=Advertisement").count();
  const noteCount = p.checkNote
    ? await page.locator("text=Photo requirements vary by country").count()
    : -1;
  const ok = errors.length === 0 && advCount === 0 && (!p.checkNote || noteCount >= 1);
  if (!ok) fails++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${p.path} — consoleErrors=${errors.length} adLabels=${advCount}` +
    (p.checkNote ? ` noteVisible=${noteCount >= 1}` : "") +
    (errors.length ? ` [${errors.join(" | ")}]` : "")
  );
  await ctx.close();
}
await browser.close();
process.exit(fails ? 1 : 0);
