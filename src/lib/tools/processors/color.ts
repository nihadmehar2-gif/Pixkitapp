/** Color utilities & transparency processors. */

import type { LoadedImage } from "@/lib/image/loader";
import type { ProcessedResult, ProcessContext, ToolOptionValues } from "../types";
import { createCanvas, ctx2d, canvasToBlob } from "@/lib/image/canvas";
import { getPixels, putPixels, hexToRgb, rgbToHex } from "@/lib/image/encoders";
import { num, str, bool, encodeImageResult, canvasFromImage } from "./helpers";

/* ---------- Replace color ---------- */
export async function replaceColor(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const from = hexToRgb(str(o, "fromColor", "#ff0000"));
  const to = hexToRgb(str(o, "toColor", "#0000ff"));
  const tol = num(o, "tolerance", 30) * 2.55;
  for (const img of images) {
    const canvas = canvasFromImage(img);
    const px = getPixels(canvas);
    const d = px.data;
    for (let p = 0; p < d.length; p += 4) {
      const dist = Math.abs(d[p] - from.r) + Math.abs(d[p + 1] - from.g) + Math.abs(d[p + 2] - from.b);
      if (dist <= tol) {
        d[p] = to.r; d[p + 1] = to.g; d[p + 2] = to.b;
      }
    }
    putPixels(canvas, px);
    const result = await encodeImageResult(img, canvas, { format: "image/png", quality: 1 }, "recolored");
    result.note = `${str(o, "fromColor", "#ff0000")} → ${str(o, "toColor", "#0000ff")} (tolerance ${num(o, "tolerance", 30)}%)`;
    out.push(result);
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

/* ---------- Remove color → transparent ---------- */
export async function removeColor(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const target = hexToRgb(str(o, "keyColor", "#ffffff"));
  const tol = num(o, "tolerance", 20) * 2.55;
  const feather = num(o, "feather", 0);
  for (const img of images) {
    const canvas = canvasFromImage(img);
    const px = getPixels(canvas);
    const d = px.data;
    for (let p = 0; p < d.length; p += 4) {
      const dist = Math.abs(d[p] - target.r) + Math.abs(d[p + 1] - target.g) + Math.abs(d[p + 2] - target.b);
      if (dist <= tol) {
        d[p + 3] = 0;
      } else if (feather > 0 && dist <= tol + feather * 2.55) {
        d[p + 3] = Math.round(255 * ((dist - tol) / (feather * 2.55)));
      }
    }
    putPixels(canvas, px);
    const result = await encodeImageResult(img, canvas, { format: "image/png", quality: 1 }, "keyed");
    result.note = `Removed ${str(o, "keyColor", "#ffffff")} (tolerance ${num(o, "tolerance", 20)}%)`;
    out.push(result);
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

/* ---------- Remove white background ---------- */
export async function removeWhiteBackground(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const tol = num(o, "tolerance", 15) * 2.55;
  const connected = bool(o, "connectedOnly", true);
  for (const img of images) {
    const canvas = canvasFromImage(img);
    const px = getPixels(canvas);
    const d = px.data;
    const w = px.width, h = px.height;
    const isWhiteish = (p: number) =>
      d[p] >= 255 - tol * 0.6 && d[p + 1] >= 255 - tol * 0.6 && d[p + 2] >= 255 - tol * 0.6 &&
      Math.abs(d[p] - d[p + 1]) < tol && Math.abs(d[p + 1] - d[p + 2]) < tol;

    if (connected) {
      // Flood fill from edges — keeps white objects inside the subject
      const visited = new Uint8Array(w * h);
      const stack: number[] = [];
      for (let x = 0; x < w; x++) { stack.push(x, x + (h - 1) * w); }
      for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
      while (stack.length) {
        const idx = stack.pop()!;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const p = idx * 4;
        if (!isWhiteish(p)) continue;
        d[p + 3] = 0;
        const x = idx % w, y = (idx / w) | 0;
        if (x > 0) stack.push(idx - 1);
        if (x < w - 1) stack.push(idx + 1);
        if (y > 0) stack.push(idx - w);
        if (y < h - 1) stack.push(idx + w);
      }
    } else {
      for (let p = 0; p < d.length; p += 4) {
        if (isWhiteish(p)) d[p + 3] = 0;
      }
    }
    putPixels(canvas, px);
    const result = await encodeImageResult(img, canvas, { format: "image/png", quality: 1 }, "transparent");
    result.note = `White removed (tolerance ${num(o, "tolerance", 15)}%) → transparent PNG`;
    out.push(result);
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

/* ---------- Add background color ---------- */
export async function addBackground(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const color = str(o, "color", "#ffffff");
  for (const img of images) {
    const src = canvasFromImage(img);
    const canvas = createCanvas(src.width, src.height);
    const c = ctx2d(canvas, false);
    c.fillStyle = color;
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.drawImage(src, 0, 0);
    const result = await encodeImageResult(img, canvas, { format: str(o, "format", "image/jpeg") as never, quality: num(o, "quality", 92) / 100 }, "bg");
    result.note = `Background set to ${color}`;
    out.push(result);
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

/* ---------- Round corners ---------- */
export async function roundCorners(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const radiusPct = num(o, "radius", 10);
  for (const img of images) {
    const src = canvasFromImage(img);
    const canvas = createCanvas(src.width, src.height);
    const c = ctx2d(canvas);
    const r = (Math.min(src.width, src.height) / 2) * (radiusPct / 100);
    c.beginPath();
    c.moveTo(r, 0);
    c.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
    c.arcTo(canvas.width, canvas.height, 0, canvas.height, r);
    c.arcTo(0, canvas.height, 0, 0, r);
    c.arcTo(0, 0, canvas.width, 0, r);
    c.closePath();
    c.clip();
    c.drawImage(src, 0, 0);
    const result = await encodeImageResult(img, canvas, { format: "image/png", quality: 1 }, "rounded");
    result.note = `Corners rounded at ${radiusPct}% radius`;
    out.push(result);
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

/* ---------- Transparent PNG maker (binarize alpha) ---------- */
export async function transparentPng(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const threshold = num(o, "alphaThreshold", 50) * 2.55;
  const binarize = bool(o, "binarize", true);
  for (const img of images) {
    const canvas = canvasFromImage(img);
    const px = getPixels(canvas);
    const d = px.data;
    if (binarize) {
      for (let p = 0; p < d.length; p += 4) {
        d[p + 3] = d[p + 3] >= threshold ? 255 : 0;
      }
    }
    putPixels(canvas, px);
    const blob = await canvasToBlob(canvas, "image/png");
    out.push({
      id: `${img.id}-tp${Math.random().toString(36).slice(2, 6)}`,
      sourceId: img.id,
      sourceName: img.name,
      name: `${img.name.replace(/\.[^.]+$/, "")}-transparent.png`,
      blob,
      width: canvas.width,
      height: canvas.height,
      originalSize: img.size,
      previewUrl: URL.createObjectURL(blob),
      note: `PNG with ${binarize ? "hard" : "preserved"} alpha (threshold ${num(o, "alphaThreshold", 50)}%)`,
    });
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

/* ---------- Drop shadow for transparent PNGs ---------- */
export async function dropShadow(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const blur = num(o, "blur", 12);
  const offsetX = num(o, "offsetX", 0);
  const offsetY = num(o, "offsetY", 6);
  const color = str(o, "color", "#000000");
  const opacity = num(o, "opacity", 40) / 100;
  const expand = blur * 2 + Math.abs(offsetX) + Math.abs(offsetY);
  for (const img of images) {
    const src = canvasFromImage(img);
    const canvas = createCanvas(src.width + expand * 2, src.height + expand * 2);
    const c = ctx2d(canvas);
    c.shadowColor = color + Math.round(opacity * 255).toString(16).padStart(2, "0");
    c.shadowBlur = blur;
    c.shadowOffsetX = offsetX;
    c.shadowOffsetY = offsetY;
    c.drawImage(src, expand, expand);
    // Draw again without shadow on top for crisp subject
    c.shadowColor = "transparent";
    c.drawImage(src, expand, expand);
    const result = await encodeImageResult(img, canvas, { format: "image/png", quality: 1 }, "shadow");
    result.note = `Shadow: ${blur}px blur, ${offsetX},${offsetY} offset, ${Math.round(opacity * 100)}% opacity`;
    out.push(result);
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

/* ---------- Color picker (analysis, no image transform) ---------- */
export async function pickColor(images: LoadedImage[], o: ToolOptionValues): Promise<{ hex: string; r: number; g: number; b: number; x: number; y: number; canvasUrl: string }> {
  const img = images[0];
  const canvas = canvasFromImage(img);
  const x = Math.round(num(o, "px", img.width / 2));
  const y = Math.round(num(o, "py", img.height / 2));
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const d = ctx.getImageData(Math.min(x, canvas.width - 1), Math.min(y, canvas.height - 1), 1, 1).data;
  return { hex: rgbToHex(d[0], d[1], d[2]), r: d[0], g: d[1], b: d[2], x, y, canvasUrl: canvas.toDataURL() };
}

/* ---------- Palette extraction ---------- */
export async function extractPalette(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const { quantizeCanvas } = await import("@/lib/image/encoders");
  const count = Math.round(num(o, "colors", 8));
  const out: ProcessedResult[] = [];
  for (const img of images) {
    const canvas = canvasFromImage(img);
    const palette = quantizeCanvas(canvas, count).slice(0, count);
    // Build swatch sheet PNG
    const swatchH = 60;
    const sheet = createCanvas(Math.max(600, palette.length * 90), swatchH + 34);
    const c = ctx2d(sheet);
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, sheet.width, sheet.height);
    const swW = sheet.width / Math.max(1, palette.length);
    palette.forEach((hex, i) => {
      c.fillStyle = hex;
      c.fillRect(i * swW, 0, swW, swatchH);
      c.fillStyle = "#111111";
      c.font = "13px monospace";
      c.textAlign = "center";
      c.fillText(hex.toUpperCase(), i * swW + swW / 2, swatchH + 22);
    });
    const blob = await canvasToBlob(sheet, "image/png");
    const report = palette.map((h, i) => `${i + 1}. ${h.toUpperCase()}`).join("\n");
    out.push({
      id: `${img.id}-pal${Math.random().toString(36).slice(2, 6)}`,
      sourceId: img.id,
      sourceName: img.name,
      name: `${img.name.replace(/\.[^.]+$/, "")}-palette.png`,
      blob,
      width: sheet.width,
      height: sheet.height,
      originalSize: img.size,
      previewUrl: URL.createObjectURL(blob),
      note: report,
    });
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

/* ---------- Dominant / average color ---------- */
export async function dominantColor(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const { quantizeCanvas } = await import("@/lib/image/encoders");
  const mode = str(o, "__mode", "dominant");
  const out: ProcessedResult[] = [];
  for (const img of images) {
    const canvas = canvasFromImage(img);
    let hex: string;
    if (mode === "average") {
      const px = getPixels(canvas);
      const d = px.data;
      let r = 0, g = 0, b = 0, n = 0;
      const stride = Math.max(1, Math.floor((px.width * px.height) / 50000)) * 4;
      for (let p = 0; p < d.length; p += stride) {
        if (d[p + 3] < 128) continue;
        r += d[p]; g += d[p + 1]; b += d[p + 2]; n++;
      }
      hex = rgbToHex(r / n, g / n, b / n);
    } else {
      const palette = quantizeCanvas(canvas, 5);
      // pick most saturated/darkest of top palette as "dominant"
      hex = palette[0] ?? "#000000";
    }
    const swatch = createCanvas(400, 200);
    const c = ctx2d(swatch);
    c.fillStyle = hex;
    c.fillRect(0, 0, 400, 200);
    c.fillStyle = luminance(hex) > 0.5 ? "#111111" : "#ffffff";
    c.font = "bold 28px monospace";
    c.textAlign = "center";
    c.fillText(hex.toUpperCase(), 200, 108);
    const blob = await canvasToBlob(swatch, "image/png");
    out.push({
      id: `${img.id}-${mode}${Math.random().toString(36).slice(2, 6)}`,
      sourceId: img.id,
      sourceName: img.name,
      name: `${img.name.replace(/\.[^.]+$/, "")}-${mode}-color.png`,
      blob,
      width: 400,
      height: 200,
      originalSize: img.size,
      previewUrl: URL.createObjectURL(blob),
      note: `${mode === "average" ? "Average" : "Dominant"} color: ${hex.toUpperCase()}`,
    });
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export const colorProcessors = {
  replaceColor, removeColor, removeWhiteBackground, addBackground,
  roundCorners, transparentPng, dropShadow, extractPalette, dominantColor,
};
