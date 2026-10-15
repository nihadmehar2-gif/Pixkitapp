/** Full sweep of all tool pages on the production build:
 *  - loads each URL in headless Chrome
 *  - collects console errors, page errors, failed requests
 *  - verifies H1 present + workspace UI mounts (file input or canvas appears)
 *  Run: node scripts/sweep-all.mjs
 */
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const BASE = "http://localhost:3000";
const slugs = readFileSync("/tmp/tool-slugs.txt", "utf-8").split("\n").map(s => s.trim()).filter(Boolean);

const browser = await chromium.launch({
  executablePath: EXEC,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

let consoleErrors = [], pageErrors = [], failedRequests = [];

page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 200)));
page.on("requestfailed", (r) => failedRequests.push(`${r.url().slice(0, 100)} ${r.failure()?.errorText}`));

const problems = [];
const t0 = Date.now();
for (let i = 0; i < slugs.length; i++) {
  const slug = slugs[i];
  consoleErrors = []; pageErrors = []; failedRequests = [];
  let status = 0, h1 = false, ui = false, title = "";
  try {
    const resp = await page.goto(`${BASE}/${slug}`, { waitUntil: "load", timeout: 30000 });
    status = resp?.status() ?? 0;
    title = await page.title();
    // give the dynamic workspace chunk a moment to hydrate
    await page.waitForTimeout(700);
    h1 = await page.locator("h1").count() > 0;
    ui = (await page.locator("input[type=file]").count()) > 0 || (await page.locator("canvas").count()) > 0;
  } catch (e) {
    problems.push({ slug, status, issue: `EXCEPTION ${String(e).slice(0, 120)}`, consoleErrors, pageErrors, failedRequests });
    continue;
  }
  const issues = [];
  if (status !== 200) issues.push(`status=${status}`);
  if (!h1) issues.push("no H1");
  if (!ui) issues.push("no workspace UI (no file input / canvas)");
  if (consoleErrors.length) issues.push(`consoleErrors: ${consoleErrors.join(" || ")}`);
  if (pageErrors.length) issues.push(`pageErrors: ${pageErrors.join(" || ")}`);
  if (failedRequests.length) issues.push(`failedRequests: ${failedRequests.join(" || ")}`);
  if (issues.length) problems.push({ slug, issue: issues.join("; "), consoleErrors, pageErrors, failedRequests });
  if ((i + 1) % 20 === 0) console.log(`progress: ${i + 1}/${slugs.length} (${Math.round((Date.now() - t0) / 1000)}s)`);
}

console.log(`\nSWEPT ${slugs.length} tool pages in ${Math.round((Date.now() - t0) / 1000)}s`);
console.log(`PAGES WITH PROBLEMS: ${problems.length}`);
for (const p of problems) console.log(`- ${p.slug}: ${p.issue}`);
writeFileSync("/tmp/sweep-problems.json", JSON.stringify(problems, null, 1));
await browser.close();
