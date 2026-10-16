// PART 5: axe-core + custom a11y scan across key pages, light & dark themes.
// Usage: node a11y-scan.mjs <base_url> <label>
// Needs server already running on base_url.
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const base = process.argv[2] || 'http://127.0.0.1:3100';
const label = process.argv[3] || 'run';
const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const pages = ['/', '/image-compressor', '/image-resizer', '/webp-to-jpg', '/passport-photo-maker', '/tools', '/about', '/contact', '/privacy', '/terms', '/category/compress', '/nonexistent-page-404'];

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });

for (const theme of ['light', 'dark']) {
  for (const path of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(base + path, { waitUntil: 'networkidle', timeout: 30000 });
      if (theme === 'dark') {
        await page.emulateMedia({ colorScheme: 'dark' });
        // site default is system; forcing via localStorage for next-themes
        await page.evaluate(() => localStorage.setItem('theme', 'dark'));
        await page.reload({ waitUntil: 'networkidle' });
      }
      await page.waitForTimeout(400);

      // axe-core
      await page.addScriptTag({ content: AXE });
      const axe = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          resultTypes: ['violations'],
          rules: { 'color-contrast': { enabled: true } },
        });
        return r.violations.map((v) => ({
          id: v.id, impact: v.impact, count: v.nodes.length,
          sample: v.nodes.slice(0, 3).map((n) => ({
            target: (n.target || []).join(' ').slice(0, 90),
            html: (n.html || '').slice(0, 110),
            msg: (n.any?.[0]?.message || '').slice(0, 120),
          })),
        }));
      });

      // custom: headings, small tap targets, imgs w/o alt, unlabeled form controls
      const custom = await page.evaluate(() => {
        const out = {};
        // headings
        const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => parseInt(h.tagName[1]));
        out.h1Count = hs.filter((l) => l === 1).length;
        out.headingOrder = hs.join(',');
        let skipped = 0, prev = 0;
        for (const l of hs) { if (prev && l > prev + 1) skipped++; prev = l; }
        out.headingSkips = skipped;
        // tap targets (visible buttons/links/role=button in main, excluding sr-only & scroll containers)
        const small = [];
        const els = document.querySelectorAll('main a, main button, header a, header button, [role="button"]');
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none') {
            const w = r.width, h = r.height;
            if ((w < 42 || h < 42) && !el.classList.contains('sr-only')) {
              small.push({ t: el.tagName, w: Math.round(w), h: Math.round(h), label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40) });
            }
          }
        });
        out.smallTapTargets = small.slice(0, 12);
        out.smallTapCount = small.length;
        // images without alt
        out.imgsNoAlt = [...document.querySelectorAll('img')].filter((i) => i.getAttribute('alt') === null).length;
        out.imgsEmptyAlt = [...document.querySelectorAll('img')].filter((i) => i.getAttribute('alt') === '').length;
        // unlabeled form controls
        const unlabeled = [];
        document.querySelectorAll('main input, main select, main textarea').forEach((el) => {
          const id = el.id;
          const hasLabel = (id && document.querySelector(`label[for="${id}"]`)) || el.closest('label') || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
          if (!hasLabel) unlabeled.push(el.tagName + ':' + (el.getAttribute('name') || el.getAttribute('placeholder') || '').slice(0, 30));
        });
        out.unlabeledFormControls = unlabeled;
        // focus visibility: tab to first 3 focusable and check outline
        return out;
      });

      // keyboard focus visibility
      const focusCheck = await page.evaluate(async () => {
        const focusables = [...document.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        }).slice(0, 4);
        const results = [];
        for (const el of focusables) {
          el.focus();
          await new Promise((r) => setTimeout(r, 50));
          const cs = getComputedStyle(el);
          const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
          const boxShadow = cs.boxShadow !== 'none';
          const ring = [...el.classList].some((c) => c.includes('ring') || c.includes('focus'));
          results.push({ tag: el.tagName, outline, boxShadow, ring, hasFocusVisible: el.matches(':focus-visible') });
        }
        return results;
      });

      console.log(JSON.stringify({ label, theme, page: path, axeViolations: axe, ...custom, focusCheck }));
    } catch (e) {
      console.log(JSON.stringify({ label, theme, page: path, error: String(e).slice(0, 150) }));
    }
    await ctx.close();
  }
}
await browser.close();
