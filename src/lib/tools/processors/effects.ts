/** Filters & effects processors. */

import type { LoadedImage } from "@/lib/image/loader";
import type { ProcessedResult, ProcessContext, ToolOptionValues } from "../types";
import { createCanvas, ctx2d } from "@/lib/image/canvas";
import { getPixels, putPixels, hexToRgb, rgbToHex } from "@/lib/image/encoders";
import { num, str, bool, encodeImageResult, canvasFromImage, encodeOpts } from "./helpers";

/** Build a CSS filter string from option values. */
function cssFilter(o: ToolOptionValues, keys: string[]): string {
  const parts: string[] = [];
  if (keys.includes("grayscale") && num(o, "grayscale", 0) > 0) parts.push(`grayscale(${num(o, "grayscale", 0)}%)`);
  if (keys.includes("sepia") && num(o, "sepia", 0) > 0) parts.push(`sepia(${num(o, "sepia", 0)}%)`);
  if (keys.includes("invert") && num(o, "invert", 0) > 0) parts.push(`invert(${num(o, "invert", 0)}%)`);
  if (keys.includes("blur") && num(o, "blur", 0) > 0) parts.push(`blur(${num(o, "blur", 0)}px)`);
  if (keys.includes("brightness") && num(o, "brightness", 100) !== 100) parts.push(`brightness(${num(o, "brightness", 100)}%)`);
  if (keys.includes("contrast") && num(o, "contrast", 100) !== 100) parts.push(`contrast(${num(o, "contrast", 100)}%)`);
  if (keys.includes("saturate") && num(o, "saturate", 100) !== 100) parts.push(`saturate(${num(o, "saturate", 100)}%)`);
  if (keys.includes("hue") && num(o, "hue", 0) !== 0) parts.push(`hue-rotate(${num(o, "hue", 0)}deg)`);
  return parts.join(" ") || "none";
}

/* ---------- Generic CSS filter appliers (one per tool = distinct defaults/params) ---------- */
function cssFilterProcessor(keys: string[]) {
  return async (images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> => {
    const out: ProcessedResult[] = [];
    const filter = cssFilter(o, keys);
    const enc = encodeOpts(o);
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const canvas = createCanvas(img.width, img.height);
      const c = ctx2d(canvas);
      c.filter = filter;
      c.drawImage(img.bitmap as CanvasImageSource, 0, 0, canvas.width, canvas.height);
      c.filter = "none";
      const result = await encodeImageResult(img, canvas, enc, "filtered");
      result.note = `Filter: ${filter}`;
      out.push(result);
      ctx.onProgress?.(i + 1, images.length);
    }
    return out;
  };
}

export const grayscaleProcessor = cssFilterProcessor(["grayscale"]);
export const sepiaProcessor = cssFilterProcessor(["sepia"]);
export const invertProcessor = cssFilterProcessor(["invert"]);
export const blurProcessor = cssFilterProcessor(["blur"]);
export const brightnessProcessor = cssFilterProcessor(["brightness"]);
export const contrastProcessor = cssFilterProcessor(["contrast"]);
export const saturateProcessor = cssFilterProcessor(["saturate"]);
export const hueProcessor = cssFilterProcessor(["hue"]);

/* ---------- Sharpen (convolution) ---------- */
export async function sharpen(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const amount = num(o, "amount", 60) / 100;
  const enc = encodeOpts(o);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const c = ctx2d(canvas);
    const imageData = c.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const copy = new Uint8ClampedArray(data);
    const centerW = 1 + 4 * amount;
    const k = [
      [0, -amount, 0],
      [-amount, centerW, -amount],
      [0, -amount, 0],
    ];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let ch = 0; ch < 3; ch++) {
          const idx = (y * width + x) * 4 + ch;
          let v = 0;
          v += k[0][1] * copy[idx - width * 4];
          v += k[1][0] * copy[idx - 4];
          v += k[1][1] * copy[idx];
          v += k[1][2] * copy[idx + 4];
          v += k[2][1] * copy[idx + width * 4];
          data[idx] = v;
        }
      }
    }
    c.putImageData(imageData, 0, 0);
    const result = await encodeImageResult(img, canvas, enc, "sharpened");
    result.note = `Sharpened at ${Math.round(amount * 100)}% strength`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Posterize ---------- */
export async function posterize(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const levels = Math.max(2, Math.round(num(o, "levels", 6)));
  const step = 255 / (levels - 1);
  const enc = encodeOpts(o);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const px = getPixels(canvas);
    const d = px.data;
    for (let p = 0; p < d.length; p += 4) {
      d[p] = Math.round(d[p] / step) * step;
      d[p + 1] = Math.round(d[p + 1] / step) * step;
      d[p + 2] = Math.round(d[p + 2] / step) * step;
    }
    putPixels(canvas, px);
    const result = await encodeImageResult(img, canvas, enc, "posterized");
    result.note = `Reduced to ${levels} tonal levels per channel`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Pixelate ---------- */
export async function pixelate(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const block = Math.max(2, Math.round(num(o, "block", 12)));
  const enc = encodeOpts(o);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const small = createCanvas(Math.max(1, Math.ceil(canvas.width / block)), Math.max(1, Math.ceil(canvas.height / block)));
    const sctx = ctx2d(small);
    sctx.imageSmoothingEnabled = true;
    sctx.drawImage(canvas, 0, 0, small.width, small.height);
    const out2 = createCanvas(canvas.width, canvas.height);
    const octx = ctx2d(out2);
    octx.imageSmoothingEnabled = false;
    octx.drawImage(small, 0, 0, out2.width, out2.height);
    const result = await encodeImageResult(img, out2, enc, "pixelated");
    result.note = `${block}px pixel blocks`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Duotone ---------- */
export async function duotone(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const dark = hexToRgb(str(o, "shadowColor", "#1a1a2e"));
  const light = hexToRgb(str(o, "highlightColor", "#f0c27b"));
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = createCanvas(img.width, img.height);
    const c = ctx2d(canvas);
    c.filter = "grayscale(100%) contrast(110%)";
    c.drawImage(img.bitmap as CanvasImageSource, 0, 0);
    c.filter = "none";
    const px = getPixels(canvas);
    const d = px.data;
    for (let p = 0; p < d.length; p += 4) {
      const t = (d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114) / 255;
      d[p] = dark.r + (light.r - dark.r) * t;
      d[p + 1] = dark.g + (light.g - dark.g) * t;
      d[p + 2] = dark.b + (light.b - dark.b) * t;
    }
    putPixels(canvas, px);
    const result = await encodeImageResult(img, canvas, { format: "image/png", quality: 1 }, "duotone");
    result.note = `Duotone ${str(o, "shadowColor", "#1a1a2e")} → ${str(o, "highlightColor", "#f0c27b")}`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Film grain ---------- */
export async function filmGrain(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const amount = num(o, "amount", 30);
  const enc = encodeOpts(o);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const px = getPixels(canvas);
    const d = px.data;
    for (let p = 0; p < d.length; p += 4) {
      const noise = (Math.random() - 0.5) * 2 * amount * 1.28;
      d[p] += noise; d[p + 1] += noise; d[p + 2] += noise;
    }
    putPixels(canvas, px);
    const result = await encodeImageResult(img, canvas, enc, "grain");
    result.note = `Film grain at ${amount}% intensity`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Vignette ---------- */
export async function vignette(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const strength = num(o, "strength", 50) / 100;
  const size = num(o, "size", 70) / 100;
  const enc = encodeOpts(o);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const c = ctx2d(canvas);
    const { width, height } = canvas;
    const gradient = c.createRadialGradient(width / 2, height / 2, (Math.min(width, height) / 2) * (1 - size), width / 2, height / 2, (Math.max(width, height) / 2) * 1.2);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${strength})`);
    c.fillStyle = gradient;
    c.fillRect(0, 0, width, height);
    const result = await encodeImageResult(img, canvas, enc, "vignette");
    result.note = `Vignette ${Math.round(strength * 100)}% · ${size}px reach`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Vintage combo ---------- */
export async function vintage(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const strength = num(o, "strength", 70) / 100;
  const vignetteOn = bool(o, "vignette", true);
  const grainOn = bool(o, "grain", true);
  const enc = encodeOpts(o);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = createCanvas(img.width, img.height);
    const c = ctx2d(canvas);
    c.filter = `sepia(${Math.round(strength * 80)}%) contrast(${Math.round(100 - strength * 15)}%) saturate(${Math.round(100 - strength * 30)}%) brightness(${Math.round(100 + strength * 5)}%)`;
    c.drawImage(img.bitmap as CanvasImageSource, 0, 0);
    c.filter = "none";
    if (vignetteOn) {
      const g = c.createRadialGradient(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.35, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75);
      g.addColorStop(0, "rgba(60,40,20,0)");
      g.addColorStop(1, `rgba(60,40,20,${0.45 * strength})`);
      c.fillStyle = g;
      c.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (grainOn) {
      const px = getPixels(canvas);
      const d = px.data;
      const amt = 12 * strength;
      for (let p = 0; p < d.length; p += 4) {
        const n = (Math.random() - 0.5) * 2 * amt;
        d[p] += n; d[p + 1] += n; d[p + 2] += n;
      }
      putPixels(canvas, px);
    }
    const result = await encodeImageResult(img, canvas, enc, "vintage");
    result.note = `Vintage look at ${Math.round(strength * 100)}%`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Threshold (pure B/W) ---------- */
export async function threshold(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const t = num(o, "threshold", 50) * 2.55;
  const invert = bool(o, "invert", false);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = createCanvas(img.width, img.height);
    const c = ctx2d(canvas);
    c.filter = "grayscale(100%)";
    c.drawImage(img.bitmap as CanvasImageSource, 0, 0);
    c.filter = "none";
    const px = getPixels(canvas);
    const d = px.data;
    for (let p = 0; p < d.length; p += 4) {
      const lum = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114;
      const v = (lum >= t) !== invert ? 255 : 0;
      d[p] = d[p + 1] = d[p + 2] = v;
    }
    putPixels(canvas, px);
    const result = await encodeImageResult(img, canvas, { format: "image/png", quality: 1 }, "threshold");
    result.note = `Black & white threshold at ${num(o, "threshold", 50)}%`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Color temperature ---------- */
export async function temperature(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const temp = num(o, "temp", 0); // -100 cool .. +100 warm
  const enc = encodeOpts(o);
  const rShift = temp > 0 ? temp * 0.5 : 0;
  const bShift = temp < 0 ? -temp * 0.5 : 0;
  const gShift = Math.abs(temp) * 0.1;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const px = getPixels(canvas);
    const d = px.data;
    for (let p = 0; p < d.length; p += 4) {
      d[p] += rShift;
      d[p + 1] += gShift * 0;
      d[p + 2] += bShift;
    }
    putPixels(canvas, px);
    const result = await encodeImageResult(img, canvas, enc, "temperature");
    result.note = temp >= 0 ? `Warmed by ${temp}%` : `Cooled by ${-temp}%`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Channel swap ---------- */
export async function channelSwap(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const mode = str(o, "mode", "rgb-gbr");
  const enc = encodeOpts(o);
  const maps: Record<string, [number, number, number]> = {
    "rgb-gbr": [2, 0, 1],
    "rgb-brg": [1, 2, 0],
    "rgb-grb": [0, 2, 1],
    "rgb-rbg": [0, 2, 1],
    "rgb-bgr": [2, 1, 0],
  };
  const m = maps[mode] ?? [2, 0, 1];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const px = getPixels(canvas);
    const d = px.data;
    for (let p = 0; p < d.length; p += 4) {
      const r = d[p], g = d[p + 1], b = d[p + 2];
      d[p] = [r, g, b][m[0]];
      d[p + 1] = [r, g, b][m[1]];
      d[p + 2] = [r, g, b][m[2]];
    }
    putPixels(canvas, px);
    const result = await encodeImageResult(img, canvas, enc, "channels");
    result.note = `RGB channels remapped (${mode.replace("rgb-", "").toUpperCase()})`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

export const effectsProcessors = {
  grayscaleProcessor, sepiaProcessor, invertProcessor, blurProcessor,
  brightnessProcessor, contrastProcessor, saturateProcessor, hueProcessor,
  sharpen, posterize, pixelate, duotone, filmGrain, vignette, vintage,
  threshold, temperature, channelSwap,
};

export { rgbToHex };
