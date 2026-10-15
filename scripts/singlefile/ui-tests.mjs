/** UI tests for the single-file index.html: navigation, search, static pages,
 *  dark mode, contact form, 404, per-route titles, mobile layout, console. */
import { chromium } from "playwright-core";

const EXEC = "/home/z/.agent-browser/browsers/chrome-155.0.8059.39/chrome";
const BASE = "http://localhost:3456/index.html";

const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text().slice(0, 200)); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 200)));

let pass = 0, fail = 0;
const fails = [];
async function check(name, fn) {
  try { await fn(); pass++; console.log("PASS " + name); }
  catch (e) { fail++; fails.push(`${name}: ${String(e.message || e).slice(0, 160)}`); console.log("FAIL " + name + " — " + String(e.message || e).slice(0, 120)); }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

// 1. Home
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1200);
await check("home renders hero + counts", async () => {
  const h1 = await page.textContent("[data-page=home] h1");
  expect(/Every image tool you need/.test(h1), "hero h1 wrong: " + h1);
  const cards = await page.locator("[data-page=home] [data-tool-card]").count();
  expect(cards === 8, "popular cards expected 8, got " + cards);
  const catCards = await page.locator("[data-page=home] a[href^='#/c/']").count();
  expect(catCards >= 14, "category cards expected >=14, got " + catCards);
});
await check("home title + meta description", async () => {
  const t = await page.title();
  expect(t.includes("PixKitApp"), "title missing brand: " + t);
  const d = await page.getAttribute("meta[name=description]", "content");
  expect(d && d.length > 80, "meta description too short");
});
await check("structured data present", async () => {
  const n = await page.locator("script[type='application/ld+json']").count();
  expect(n >= 1, "no JSON-LD");
  const txt = await page.locator("script[type='application/ld+json']").first().textContent();
  expect(txt.includes("WebSite") && txt.includes("FAQPage") && txt.includes("ItemList"), "JSON-LD missing expected types");
});

// 2. Tools index + filter
await page.goto(BASE + "#/tools", { waitUntil: "load" });
await page.waitForTimeout(800);
await check("tools index shows 127 + filter works", async () => {
  const total = await page.locator("[data-tools-grid] [data-tool-card]").count();
  expect(total === 127, "expected 127 cards, got " + total);
  await page.fill("[data-tools-filter]", "webp");
  await page.waitForTimeout(300);
  const shown = await page.locator("[data-tools-grid] [data-tool-card]:not([hidden])").count();
  expect(shown > 2 && shown < 40, "webp filter count odd: " + shown);
  await page.fill("[data-tools-filter]", "");
  await page.waitForTimeout(200);
  await page.click("[data-chip='conversion']");
  await page.waitForTimeout(300);
  const conv = await page.locator("[data-tools-grid] [data-tool-card]:not([hidden])").count();
  expect(conv === 20, "conversion chips expected 20, got " + conv);
  const countText = await page.textContent("[data-tools-count]");
  expect(/20 tools matching/.test(countText), "count text: " + countText);
});

// 3. Category page
await check("category page renders tools", async () => {
  await page.goto(BASE + "#/c/compress", { waitUntil: "load" });
  await page.waitForTimeout(700);
  const cards = await page.locator("[data-page=category] [data-tool-card]").count();
  expect(cards === 11, "compression category expected 11, got " + cards);
  const t = await page.title();
  expect(t.includes("Compression"), "category title: " + t);
});

// 4. Tool page content
await check("tool page: breadcrumb/h1/about/FAQ/related + workspace mounts", async () => {
  await page.goto(BASE + "#/t/image-compressor", { waitUntil: "load" });
  await page.waitForSelector("#pk-workspace input[type=file]", { timeout: 20000, state: "attached" });
  const h1 = await page.textContent("[data-page=tool] h1");
  expect(h1.includes("Image Compressor"), "tool h1: " + h1);
  const about = await page.textContent("[data-page=tool]");
  expect(about.includes("About this tool"), "about section missing");
  const faq = await page.locator("[data-page=tool] details").count();
  expect(faq >= 2, "faq count " + faq);
  const related = await page.locator("[data-page=tool] a[href^='#/t/']").count();
  expect(related >= 4, "related tools " + related);
  const title = await page.title();
  expect(/Compress|PixKitApp/.test(title), "tool title: " + title);
});

// 5. Search dialog
await check("search dialog finds and navigates", async () => {
  await page.click("[data-search-open] >> nth=0");
  await page.waitForSelector("[data-search-dialog][open]", { timeout: 5000 });
  await page.fill("[data-search-input]", "passport");
  await page.waitForTimeout(400);
  const results = await page.locator("[data-search-results] a").count();
  expect(results >= 3, "search results " + results);
  await page.locator("[data-search-results] a").first().click();
  await page.waitForTimeout(900);
  expect(page.url().includes("#/t/"), "did not navigate: " + page.url());
  const mounted = await page.locator("#pk-workspace input[type=file]").count();
  expect(mounted === 1, "workspace did not mount after search nav");
});

// 6. Static pages
await check("about page content", async () => {
  await page.goto(BASE + "#/about", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const body = await page.textContent("[data-page=about]");
  expect(body.includes("About PixKitApp") && body.includes("127 free image tools"), "about content wrong");
});
await check("privacy + terms content", async () => {
  await page.goto(BASE + "#/privacy", { waitUntil: "load" });
  await page.waitForTimeout(400);
  const p = await page.textContent("[data-page=privacy]");
  expect(p.includes("Privacy Policy") && p.includes("never uploaded"), "privacy content wrong");
  await page.goto(BASE + "#/terms", { waitUntil: "load" });
  await page.waitForTimeout(400);
  const t = await page.textContent("[data-page=terms]");
  expect(t.includes("Terms of Service"), "terms content wrong");
});

// 7. Contact form
await check("contact form validation + mailto routing", async () => {
  await page.goto(BASE + "#/contact", { waitUntil: "load" });
  await page.waitForTimeout(400);
  await page.click("[data-contact-form] button[type=submit]");
  await page.waitForTimeout(200);
  let err = await page.textContent("[data-contact-error]");
  expect(err.includes("name"), "name validation: " + err);
  await page.fill("[data-c-name]", "Test User");
  await page.fill("[data-c-email]", "bad-email");
  await page.fill("[data-c-message]", "Automated audit message for the contact form.");
  await page.click("[data-contact-form] button[type=submit]");
  await page.waitForTimeout(200);
  err = await page.textContent("[data-contact-error]");
  expect(err.includes("valid email"), "email validation: " + err);
  await page.fill("[data-c-email]", "audit@test.local");
  let mailtoFired = false;
  page.once("framenavigated", (f) => { if (f.url().startsWith("mailto:")) mailtoFired = true; });
  await page.click("[data-contact-form] button[type=submit]");
  await page.waitForTimeout(1200);
  const success = await page.locator("[data-contact-success]:not([hidden])").count();
  expect(success === 1, "success panel not shown");
  const mailHref = await page.evaluate(() => document.body.innerHTML.includes("nihadmehar2@gmail.com"));
  expect(mailHref, "owner email missing on contact page");
});

// 8. Dark mode
await check("dark mode toggle + persistence", async () => {
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  await page.click("[data-theme-toggle] >> nth=0");
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  expect(before !== after, "dark class did not toggle");
  const stored = await page.evaluate(() => localStorage.getItem("pixkit-theme"));
  expect(stored === (after ? "dark" : "light"), "theme not persisted: " + stored);
});

// 9. 404 + back/forward
await check("unknown route shows 404", async () => {
  await page.goto(BASE + "#/not-a-real-page", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const visible = await page.locator("[data-page=notfound]:not([hidden])").count();
  expect(visible === 1, "404 section not shown");
});
await check("hash back/forward navigation", async () => {
  await page.goto(BASE + "#/tools", { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.goto(BASE + "#/c/compress", { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.goBack();
  await page.waitForTimeout(600);
  const toolsVisible = await page.locator("[data-page=tools]:not([hidden])").count();
  expect(toolsVisible === 1, "back did not return to tools");
  await page.goForward();
  await page.waitForTimeout(600);
  const catVisible = await page.locator("[data-page=category]:not([hidden])").count();
  expect(catVisible === 1, "forward did not return to category");
});

// 10. Mobile 375px
const mctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" });
const mp = await mctx.newPage();
mp.on("console", (m) => { if (m.type() === "error") errors.push("MOBILE CONSOLE: " + m.text().slice(0, 200)); });
mp.on("pageerror", (e) => errors.push("MOBILE PAGEERROR: " + String(e).slice(0, 200)));
for (const route of ["", "#/tools", "#/t/image-compressor", "#/contact", "#/c/compress"]) {
  await check("mobile 375px no overflow: " + (route || "home"), async () => {
    await mp.goto(BASE + route, { waitUntil: "load" });
    await mp.waitForTimeout(900);
    const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow <= 0, "horizontal overflow " + overflow + "px");
  });
}
await check("mobile: workspace usable (dropzone visible)", async () => {
  await mp.goto(BASE + "#/t/image-compressor", { waitUntil: "load" });
  await mp.waitForSelector("input[type=file]", { timeout: 20000, state: "attached" });
  const box = await mp.locator("#pk-workspace").boundingBox();
  expect(box && box.width > 200, "workspace width odd: " + (box && box.width));
});

console.log(`\nUI TESTS: ${pass}/${pass + fail} PASS`);
if (fails.length) console.log("FAILURES:\n" + fails.join("\n"));
console.log("console errors overall:", errors.length, errors.slice(0, 5));
await browser.close();
process.exit(fail === 0 && errors.length === 0 ? 0 : 1);
