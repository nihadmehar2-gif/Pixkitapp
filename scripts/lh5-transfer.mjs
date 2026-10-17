// PART 5: JS transfer size, console errors, broken assets for 3 pages x 3 viewports.
// Usage: node lh5-transfer.mjs <base_url> <label>
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://127.0.0.1:3100';
const label = process.argv[3] || 'run';

const pages = ['/', '/image-compressor', '/tools'];
const viewports = [
  ['mobile', { width: 390, height: 844 }],
  ['tablet', { width: 768, height: 1024 }],
  ['desktop', { width: 1440, height: 900 }],
];

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });

for (const [vpName, viewport] of viewports) {
  for (const path of pages) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    let jsTransfer = 0, jsRequests = 0, totalTransfer = 0, totalRequests = 0;
    const consoleErrors = [];
    const failedRequests = [];

    page.on('response', (res) => {
      const type = res.request().resourceType();
      const headers = res.headers();
      const len = parseInt(headers['content-length'] || '0', 10);
      totalRequests += 1;
      totalTransfer += isNaN(len) ? 0 : len;
      if (type === 'script') { jsRequests += 1; jsTransfer += isNaN(len) ? 0 : len; }
    });
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200)); });
    page.on('pageerror', (err) => consoleErrors.push('PAGEERROR: ' + String(err).slice(0, 200)));
    page.on('requestfailed', (req) => failedRequests.push(`${req.url().slice(0, 120)} :: ${req.failure()?.errorText}`));

    try {
      await page.goto(base + path, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(800);
    } catch (e) {
      consoleErrors.push('NAV: ' + String(e).slice(0, 120));
    }

    const overflow = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const bad = [];
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 5 && (r.right > docW + 2 || r.left < -2) && getComputedStyle(el).position !== 'fixed') {
          bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} right=${Math.round(r.right)} left=${Math.round(r.left)}`);
        }
      });
      return { docW, scrollW: document.documentElement.scrollWidth, count: bad.length, sample: bad.slice(0, 6) };
    });

    console.log(JSON.stringify({
      label, viewport: vpName, page: path,
      jsTransferKB: Math.round(jsTransfer / 1024), jsRequests,
      totalTransferKB: Math.round(totalTransfer / 1024), totalRequests,
      consoleErrors: consoleErrors.slice(0, 5), consoleErrorCount: consoleErrors.length,
      failedRequests: failedRequests.slice(0, 5),
      overflow, lang: await page.evaluate(() => document.documentElement.lang),
    }));
    await ctx.close();
  }
}
await browser.close();
