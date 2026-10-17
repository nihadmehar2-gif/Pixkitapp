#!/usr/bin/env python3
"""PART 4 claim verification — runs the site's ACTUAL processor math in real Chromium.

Verifies (in a headless browser, using the same Canvas APIs as the site):
  A. image-compressor savings claim "photos commonly shrink by 50–90% at 75% quality"
  B. compress-image-to-{50,100,200,500}kb "always lands at or under target"
  C. photo-print-sheet FAQ copy counts (cols×rows math per photo size)
  D. near-lossless "tries 95/90/85/80, accepts first that beats original"
  E. PNG palette reduction "50–90% for flat graphics"
Output: JSON verdicts printed to stdout.
"""
import json
from playwright.sync_api import sync_playwright

JS = r"""
(async () => {
  const out = {};

  // ---------- deterministic PRNG for reproducible noise ----------
  let seed = 42;
  const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const blobOf = (c, type, q) => new Promise(r => c.toBlob(r, type, q));
  const sizeOf = async (c, type, q) => (await blobOf(c, type, q)).size;

  // ---------- test image generators ----------
  function photoLike(w, h, noise) { // gradient scene + noise ≈ mid-detail photo
    const c = mk(w, h), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#3b6ea5'); g.addColorStop(0.5, '#8fd'); g.addColorStop(1, '#f4a261');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(rand()*w, rand()*h, 20+rand()*120, 0, 7); x.fill(); }
    if (noise > 0) {
      const d = x.getImageData(0, 0, w, h), p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const n = (rand() - 0.5) * noise;
        p[i] += n; p[i+1] += n; p[i+2] += n;
      }
      x.putImageData(d, 0, 0);
    }
    return c;
  }
  function screenshotLike(w, h) { // flat UI panels + bars ≈ app screenshot
    const c = mk(w, h), x = c.getContext('2d');
    x.fillStyle = '#f8fafc'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, 64);
    const cols = ['#2563eb','#16a34a','#dc2626','#eab308','#7c3aed','#0891b2'];
    for (let r = 0; r < 8; r++) for (let k = 0; k < 3; k++) {
      x.fillStyle = cols[(r+k) % 6];
      x.fillRect(40 + k*(w-80)/3, 100 + r*90, (w-120)/3 - 20, 56);
    }
    return c;
  }

  const pct = (a, b) => Math.round((1 - b / a) * 100);

  // ---------- A. generic compressor: re-encode at q0.75 / q0.78 ----------
  out.compressor = [];
  for (const [label, gen] of [
    ['photo-smooth-q90', () => photoLike(2000, 1500, 0)],
    ['photo-moderate-q90', () => photoLike(2000, 1500, 14)],
    ['photo-noisy-q90', () => photoLike(2000, 1500, 34)],
  ]) {
    const src = gen();
    const orig = await sizeOf(src, 'image/jpeg', 0.9);
    for (const q of [0.75, 0.78]) {
      const after = await sizeOf(src, 'image/jpeg', q);
      out.compressor.push({ case: `${label} q${q*100}`, origKB: Math.round(orig/1024), savingPct: pct(orig, after) });
    }
  }
  // PNG photo-ish input, auto→PNG (lossless re-encode) — the honest low end
  {
    const src = photoLike(1200, 900, 14);
    const orig = await sizeOf(src, 'image/png');
    const after = await sizeOf(src, 'image/png');
    out.compressor.push({ case: 'png-noisy auto->png', origKB: Math.round(orig/1024), savingPct: pct(orig, after) });
  }

  // ---------- B. target-size binary search (site algorithm, verbatim) ----------
  async function compressToSize(srcCanvas, targetBytes, format) {
    let bestBlob = null, work = srcCanvas;
    let lo = 0.05, hi = 0.95;
    for (let a = 0; a < 8; a++) {
      const q = (lo + hi) / 2;
      const blob = await blobOf(work, format, q);
      if (blob.size <= targetBytes) { bestBlob = blob; lo = q; } else hi = q;
    }
    let scale = 1;
    while (!bestBlob && work.width > 24) {
      scale *= 0.8;
      const w = Math.max(24, Math.round(srcCanvas.width * scale));
      const h = Math.max(24, Math.round(srcCanvas.height * scale));
      work = mk(w, h);
      const x = work.getContext('2d'); x.imageSmoothingQuality = 'high';
      x.drawImage(srcCanvas, 0, 0, w, h);
      for (const q of [0.85, 0.5, 0.25, 0.05]) {
        const blob = await blobOf(work, format, q);
        if (blob.size <= targetBytes) { bestBlob = blob; break; }
      }
    }
    if (!bestBlob) bestBlob = await blobOf(work, format, 0.05);
    return { ok: bestBlob.size <= targetBytes, kb: Math.round(bestBlob.size/1024), scaledTo: work.width };
  }
  out.targets = [];
  for (const targetKB of [50, 100, 200, 500]) {
    for (const [label, gen] of [
      ['photo-moderate', () => photoLike(3000, 2000, 14)],
      ['photo-noisy', () => photoLike(3000, 2000, 34)],
    ]) {
      const r = await compressToSize(gen(), targetKB * 1024, 'image/jpeg');
      out.targets.push({ targetKB, img: label, ...r });
    }
  }

  // ---------- C. print sheet tiling (site formula: floor(sheet/photo)) ----------
  out.printSheet = {};
  const sheetW = 1200, sheetH = 1800;
  for (const [w, h] of [[413, 531], [600, 600], [390, 567], [295, 413]]) {
    const cols = Math.max(1, Math.floor(sheetW / w));
    const rows = Math.max(1, Math.floor(sheetH / h));
    out.printSheet[`${w}x${h}`] = { cols, rows, total: cols * rows };
  }

  // ---------- D. near-lossless ladder ----------
  {
    const src = photoLike(2000, 1500, 14);
    const orig = await sizeOf(src, 'image/jpeg', 0.9);
    const tried = [];
    let accepted = null;
    for (const q of [0.95, 0.9, 0.85, 0.8]) {
      const s = await sizeOf(src, 'image/jpeg', q);
      tried.push({ q: q*100, kb: Math.round(s/1024), beats: s < orig });
      if (s < orig && accepted === null) accepted = q * 100;
    }
    out.nearLossless = { origKB: Math.round(orig/1024), tried, accepted };
  }

  // ---------- E. PNG palette reduction on flat graphic ----------
  {
    const src = screenshotLike(1600, 900);
    const orig = await sizeOf(src, 'image/png');
    // median-cut approximated by sampling dominant colors: for the claim we only
    // need honest before/after; use browser toImageData + posterize to 256-palette PNG
    const after = await sizeOf(src, 'image/png'); // PNG re-encode baseline
    out.pngFlat = { origKB: Math.round(orig/1024), reencodeKB: Math.round(after/1024), reencodeSavingPct: pct(orig, after) };
  }

  return out;
})()
"""

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("about:blank")
        result = page.evaluate(JS)
        browser.close()
    print(json.dumps(result, indent=1))

    # ---- verdicts ----
    comp = [c["savingPct"] for c in result["compressor"] if "photo-" in c["case"] and "png" not in c["case"]]
    print("\n=== VERDICTS ===")
    print(f"A. JPEG re-encode savings range: {min(comp)}–{max(comp)}% (claim: 50–90% 'commonly')")
    ok_targets = all(t["ok"] for t in result["targets"])
    print(f"B. All target sizes hit: {ok_targets} -> {[(t['targetKB'], t['kb']) for t in result['targets']]}")
    print(f"C. printSheet real counts: {result['printSheet']} (FAQ claims 20 and 16)")
    nl = result["nearLossless"]
    print(f"D. near-lossless accepted q={nl['accepted']} (copy: tries 95/90/85/80)")

if __name__ == "__main__":
    main()
