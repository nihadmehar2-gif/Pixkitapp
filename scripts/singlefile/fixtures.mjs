/** Fixture generator for the single-file sweep (no browser needed).
 *  Uses ffmpeg + node canvas-free tricks to produce real test images. */
import { execSync } from "node:child_process";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";

const DIR = "/tmp/pxsweep";
mkdirSync(DIR, { recursive: true });

// Noisy gradient JPG/PNG via ffmpeg (gradients + testsrc pattern)
const gen = (out, args) => {
  if (!existsSync(`${DIR}/${out}`)) execSync(`ffmpeg -y -loglevel error ${args} ${DIR}/${out}`);
};
gen("photo.jpg", `-f lavfi -i "testsrc2=size=1200x800:rate=1" -frames:v 1 -q:v 3`);
gen("photo2.jpg", `-f lavfi -i "smptebars=size=900x600:rate=1" -frames:v 1 -q:v 3`);
gen("photo3.jpg", `-f lavfi -i "rgbtestsrc=size=800x600:rate=1" -frames:v 1 -q:v 3`);
gen("big.jpg", `-f lavfi -i "testsrc2=size=2400x1600:rate=1" -frames:v 1 -q:v 2`);
gen("photo.png", `-f lavfi -i "testsrc2=size=1000x700:rate=1" -frames:v 1`);
gen("photo.webp", `-f lavfi -i "testsrc2=size=1000x700:rate=1" -frames:v 1 -q:v 80`);
gen("test.gif", `-f lavfi -i "testsrc2=size=640x480:rate=5" -t 0.6 -loop 0`);
gen("test.bmp", `-f lavfi -i "testsrc2=size=640x480:rate=1" -frames:v 1`);
gen("test.avif", `-f lavfi -i "testsrc2=size=640x480:rate=1" -frames:v 1`);
gen("doc.png", `-f lavfi -i "color=c=white:s=800x1000:rate=1" -frames:v 1 -vf "drawtext=text='Document':fontcolor=black:fontsize=48:x=100:y=200"`);
// transparent-ish PNG (alpha) via color + format
gen("alpha.png", `-f lavfi -i "color=c=black@0.0:s=600x600:rate=1,format=rgba" -frames:v 1 -vf "drawbox=x=100:y=100:w=400:h=400:color=red@1:t=fill"`);
// SVG logo
writeFileSync(`${DIR}/logo.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" rx="48" fill="#7c3aed"/><circle cx="120" cy="96" r="48" fill="#fff"/><rect x="48" y="160" width="144" height="24" rx="12" fill="#fff"/></svg>`);
// base64 data-URI txt for base64-decode tools
if (existsSync(`${DIR}/photo.png`)) {
  const b64 = execSync(`base64 -w0 ${DIR}/photo.png`).toString().trim();
  writeFileSync(`${DIR}/encoded.txt`, `data:image/png;base64,${b64}`);
}
// plain jpg copy for logo
if (!existsSync(`${DIR}/logo.png`)) execSync(`cp ${DIR}/photo.png ${DIR}/logo.png`);
console.log("fixtures ready:", execSync(`ls ${DIR}`).toString().trim().split("\n").join(", "));
