// PART 5: generate PWA/social icons from the brand logo.
// Renders: icon-192.png, icon-512.png (any), icon-512-maskable.png (maskable),
// apple-touch-icon.png (180, opaque), favicon source PNG for PIL ICO packaging.
// Usage: NODE_PATH=/home/z/.npm-global/lib/node_modules node scripts/gen-icons.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const logo = readFileSync("public/logo.svg");

// Full-bleed variant: gradient rect expanded to the full canvas (opaque, no
// transparent corners) with the mark scaled to fill — used for apple-touch and
// favicon where transparent rounded corners look broken on opaque surfaces.
const FULL_BLEED = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="32" height="32" fill="url(#g)"/>
  ${inner}
</svg>`;

const MARK = `<g transform="scale(1.142857) translate(-2 -2)">
    <path d="M9 22V10h6.2c2.9 0 4.8 1.8 4.8 4.4s-1.9 4.4-4.8 4.4H12.4V22H9zm3.4-5.9h2.4c1.2 0 2-.7 2-1.7s-.8-1.7-2-1.7h-2.4v3.4z" fill="#fff"/>
    <rect x="21.5" y="18.5" width="4" height="4" rx="1" fill="#fff" opacity="0.95"/>
  </g>`;

// Maskable: content confined to the 80% safe zone (scaled 0.62, centered).
const MARK_SAFE = `<g transform="translate(6.1 6.1) scale(0.62)">
    <path d="M9 22V10h6.2c2.9 0 4.8 1.8 4.8 4.4s-1.9 4.4-4.8 4.4H12.4V22H9zm3.4-5.9h2.4c1.2 0 2-.7 2-1.7s-.8-1.7-2-1.7h-2.4v3.4z" fill="#fff"/>
    <rect x="21.5" y="18.5" width="4" height="4" rx="1" fill="#fff" opacity="0.95"/>
  </g>`;

const fullBleedSvg = Buffer.from(FULL_BLEED(MARK));
const maskableSvg = Buffer.from(FULL_BLEED(MARK_SAFE));

await sharp(logo).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(logo).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(maskableSvg).resize(512, 512).png().toFile("public/icon-512-maskable.png");
await sharp(fullBleedSvg).resize(180, 180).png().toFile("public/apple-touch-icon.png");
// 256px master for the ICO packager (PIL step in Python)
await sharp(logo).resize(256, 256).png().toFile("/tmp/icon-256.png");
// favicon.ico wants opaque; use the full-bleed master for ICO too
await sharp(fullBleedSvg).resize(256, 256).png().toFile("/tmp/icon-256-opaque.png");

console.log("icons rendered");
