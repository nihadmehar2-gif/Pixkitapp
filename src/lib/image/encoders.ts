/**
 * Custom client-side encoders: BMP, ICO, PDF, quantization.
 * Everything runs in the browser — no server involved.
 */

import { createCanvas, ctx2d, ctxForRead } from "./canvas";

/* ---------------- Pixel helpers ---------------- */

export interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export function getPixels(canvas: HTMLCanvasElement): PixelData {
  const ctx = ctxForRead(canvas);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data: img.data, width: img.width, height: img.height };
}

export function putPixels(canvas: HTMLCanvasElement, px: PixelData): void {
  const ctx = ctx2d(canvas);
  const imgData = ctx.createImageData(px.width, px.height);
  imgData.data.set(px.data);
  ctx.putImageData(imgData, 0, 0);
}

export function mapPixels(
  canvas: HTMLCanvasElement,
  fn: (r: number, g: number, b: number, a: number) => [number, number, number, number]
): HTMLCanvasElement {
  const px = getPixels(canvas);
  const d = px.data;
  for (let i = 0; i < d.length; i += 4) {
    const [r, g, b, a] = fn(d[i], d[i + 1], d[i + 2], d[i + 3]);
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = a;
  }
  putPixels(canvas, px);
  return canvas;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

/* ---------------- Quantization (median cut) ---------------- */

interface Box {
  pixels: number[][]; // [r,g,b]
}

/** Reduce image to N colors using median-cut quantization. Returns palette. */
export function quantizeCanvas(canvas: HTMLCanvasElement, maxColors: number): string[] {
  const px = getPixels(canvas);
  const d = px.data;
  const pixels: number[][] = [];
  const total = px.width * px.height;
  const stride = Math.max(1, Math.floor(total / 60000)); // sample for speed
  for (let i = 0; i < total; i += stride) {
    const o = i * 4;
    if (d[o + 3] < 128) continue; // skip transparent
    pixels.push([d[o], d[o + 1], d[o + 2]]);
  }
  if (pixels.length === 0) return [];

  let boxes: Box[] = [{ pixels }];
  while (boxes.length < maxColors) {
    // Pick box with largest channel range
    let bestIdx = -1;
    let bestRange = -1;
    let bestChannel = 0;
    boxes.forEach((box, idx) => {
      if (box.pixels.length < 2) return;
      for (let c = 0; c < 3; c++) {
        let min = 255, max = 0;
        for (const p of box.pixels) {
          if (p[c] < min) min = p[c];
          if (p[c] > max) max = p[c];
        }
        const range = (max - min) * box.pixels.length;
        if (range > bestRange) {
          bestRange = range;
          bestIdx = idx;
          bestChannel = c;
        }
      }
    });
    if (bestIdx < 0 || bestRange <= 0) break;
    const box = boxes[bestIdx];
    box.pixels.sort((a, b) => a[bestChannel] - b[bestChannel]);
    const mid = Math.floor(box.pixels.length / 2);
    boxes.splice(bestIdx, 1, { pixels: box.pixels.slice(0, mid) }, { pixels: box.pixels.slice(mid) });
  }

  return boxes
    .filter((b) => b.pixels.length > 0)
    .map((b) => {
      let r = 0, g = 0, bl = 0;
      for (const p of b.pixels) { r += p[0]; g += p[1]; bl += p[2]; }
      const n = b.pixels.length;
      return rgbToHex(r / n, g / n, bl / n);
    })
    .sort((a, b) => {
      const ca = hexToRgb(a), cb = hexToRgb(b);
      const la = 0.299 * ca.r + 0.587 * ca.g + 0.114 * ca.b;
      const lb = 0.299 * cb.r + 0.587 * cb.g + 0.114 * cb.b;
      return la - lb;
    });
}

/** Apply a palette to an image (nearest color mapping) — true color reduction. */
export function applyPalette(canvas: HTMLCanvasElement, palette: string[]): HTMLCanvasElement {
  const colors = palette.map(hexToRgb);
  const px = getPixels(canvas);
  const d = px.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) { d[i] = d[i+1] = d[i+2] = 0; continue; }
    let best = 0, bestDist = Infinity;
    for (let c = 0; c < colors.length; c++) {
      const dr = d[i] - colors[c].r;
      const dg = d[i + 1] - colors[c].g;
      const db = d[i + 2] - colors[c].b;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) { bestDist = dist; best = c; }
    }
    d[i] = colors[best].r;
    d[i + 1] = colors[best].g;
    d[i + 2] = colors[best].b;
  }
  putPixels(canvas, px);
  return canvas;
}

/* ---------------- BMP encoder (24-bit, bottom-up rows) ---------------- */

export function canvasToBmpBlob(canvas: HTMLCanvasElement): Blob {
  const flat = createCanvas(canvas.width, canvas.height);
  const fctx = ctx2d(flat, false);
  fctx.fillStyle = "#ffffff";
  fctx.fillRect(0, 0, flat.width, flat.height);
  fctx.drawImage(canvas, 0, 0);

  const px = getPixels(flat);
  const w = px.width;
  const h = px.height;
  const rowSize = Math.ceil((w * 3) / 4) * 4; // rows padded to 4 bytes
  const dataSize = rowSize * h;
  const fileSize = 54 + dataSize;
  const buf = new ArrayBuffer(fileSize);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  // BITMAPFILEHEADER
  view.setUint8(0, 0x42); view.setUint8(1, 0x4d); // "BM"
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);
  // BITMAPINFOHEADER
  view.setUint32(14, 40, true);
  view.setInt32(18, w, true);
  view.setInt32(22, h, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, dataSize, true);
  view.setUint32(38, 2835, true); // 72 DPI
  view.setUint32(42, 2835, true);

  let off = 54;
  for (let y = h - 1; y >= 0; y--) {
    let xo = off;
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      bytes[xo++] = px.data[o + 2]; // B
      bytes[xo++] = px.data[o + 1]; // G
      bytes[xo++] = px.data[o]; // R
    }
    off += rowSize;
  }
  return new Blob([buf], { type: "image/bmp" });
}

/* ---------------- ICO encoder (wraps multiple PNGs) ---------------- */

export async function canvasToIcoBlob(sizes: number[], render: (size: number) => Promise<HTMLCanvasElement>): Promise<Blob> {
  const pngs: { size: number; data: Uint8Array }[] = [];
  for (const s of sizes) {
    const c = await render(s);
    const blob = await new Promise<Blob>((res, rej) =>
      c.toBlob((b) => (b ? res(b) : rej(new Error("PNG encode failed"))), "image/png")
    );
    pngs.push({ size: s, data: new Uint8Array(await blob.arrayBuffer()) });
  }

  const headerSize = 6 + pngs.length * 16;
  const totalSize = headerSize + pngs.reduce((s, p) => s + p.data.length, 0);
  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, pngs.length, true); // count

  let offset = headerSize;
  pngs.forEach((p, i) => {
    const e = 6 + i * 16;
    view.setUint8(e, p.size >= 256 ? 0 : p.size); // width
    view.setUint8(e + 1, p.size >= 256 ? 0 : p.size); // height
    view.setUint8(e + 2, 0); // palette
    view.setUint8(e + 3, 0); // reserved
    view.setUint16(e + 4, 1, true); // planes
    view.setUint16(e + 6, 32, true); // bpp
    view.setUint32(e + 8, p.data.length, true);
    view.setUint32(e + 12, offset, true);
    bytes.set(p.data, offset);
    offset += p.data.length;
  });
  return new Blob([buf], { type: "image/x-icon" });
}

/* ---------------- Minimal PDF generator (JPEG-embedded pages) ---------------- */

export interface PdfPageInput {
  jpegData: Uint8Array;
  width: number; // in PDF points
  height: number;
}

function pdfEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Build a valid multi-page PDF embedding JPEG images. Runs entirely in browser. */
export function buildPdf(pages: PdfPageInput[]): Blob {
  const objects: string[] = [];
  const binaryChunks: (Uint8Array | null)[] = [];
  let nextId = 1;

  const catalogId = nextId++;
  const pagesId = nextId++;
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  const imageIds: number[] = [];

  for (let i = 0; i < pages.length; i++) {
    pageIds.push(nextId++);
    contentIds.push(nextId++);
    imageIds.push(nextId++);
  }
  const infoId = nextId++;

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    objects[pageIds[i]] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${p.width.toFixed(2)} ${p.height.toFixed(2)}] ` +
      `/Resources << /XObject << /Im${i} ${imageIds[i]} 0 R >> /ProcSet [/PDF /ImageC] >> /Contents ${contentIds[i]} 0 R >>`;

    const content =
      `q\n${p.width.toFixed(2)} 0 0 ${p.height.toFixed(2)} 0 0 cm\n/Im${i} Do\nQ\n`;
    objects[contentIds[i]] = `<< /Length ${content.length} >>\nstream\n${content}endstream`;

    binaryChunks[imageIds[i]] = p.jpegData;
    objects[imageIds[i]] =
      `<< /Type /XObject /Subtype /Image /Width ${Math.round(p.width * 2)} /Height ${Math.round(p.height * 2)} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpegData.length} >>`;
  }
  objects[infoId] = `<< /Title (PixKitApp Image) /Producer (PixKitApp) /Creator (PixKitApp) >>`;

  // Serialize
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [encoder.encode(pdf)];

  for (let id = 1; id < nextId; id++) {
    offsets[id] = pdf.length;
    const header = `${id} 0 obj\n`;
    const body = objects[id] ?? "";
    chunks.push(encoder.encode(header + body));
    if (binaryChunks[id]) {
      chunks.push(encoder.encode("\nstream\n"));
      chunks.push(binaryChunks[id]!);
      chunks.push(encoder.encode("\nendstream"));
    }
    chunks.push(encoder.encode("\nendobj\n"));
    pdf += header + body + (binaryChunks[id] ? "\nstream\n...\nendstream" : "") + "\nendobj\n";
  }

  const xrefStart = pdf.length;
  let xref = `xref\n0 ${nextId}\n0000000000 65535 f \n`;
  for (let id = 1; id < nextId; id++) {
    xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${nextId} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  chunks.push(encoder.encode(xref));

  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}
