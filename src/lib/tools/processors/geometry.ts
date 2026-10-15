/** Rotation, flipping and cropping processors. */

import type { LoadedImage } from "@/lib/image/loader";
import type { ProcessedResult, ProcessContext, ToolOptionValues } from "../types";
import { createCanvas, ctx2d, outputName } from "@/lib/image/canvas";
import { getPixels, putPixels } from "@/lib/image/encoders";
import { num, str, bool, encodeImageResult, canvasFromImage, encodeOpts } from "./helpers";

/* ---------- Rotate (arbitrary + fixed) ---------- */
async function rotate(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const fixed = num(o, "__fixedAngle", NaN);
  const angle = isNaN(fixed) ? num(o, "angle", 0) : fixed;
  const autoCrop = bool(o, "autoCrop", false);
  const bg = str(o, "background", "#ffffff");
  const transparentBg = bool(o, "transparentBg", false);
  const enc = encodeOpts(o);
  const rad = (angle * Math.PI) / 180;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = canvasFromImage(img);
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    let outW: number, outH: number, sx = 0, sy = 0;
    if (autoCrop && angle % 90 !== 0) {
      // keep original size, crop the rotated corners
      outW = src.width; outH = src.height;
      sx = (src.width * (cos - 1) + src.height * sin) / 2;
      sy = (src.height * (cos - 1) + src.width * sin) / 2;
    } else {
      outW = Math.round(src.width * cos + src.height * sin);
      outH = Math.round(src.width * sin + src.height * cos);
    }

    const canvas = createCanvas(outW, outH);
    const c = ctx2d(canvas);
    if (!transparentBg) {
      c.fillStyle = bg;
      c.fillRect(0, 0, outW, outH);
    }
    c.translate(outW / 2, outH / 2);
    c.rotate(rad);
    c.drawImage(src, -src.width / 2, -src.height / 2);

    let final = canvas;
    if (autoCrop && angle % 90 !== 0) {
      const cropCanvas = createCanvas(src.width, src.height);
      // scale factor to make the rotated image cover the crop area
      const scale = Math.max(outW / src.width, outH / src.height) > 1
        ? Math.max((src.width * cos + src.height * sin) / src.width, (src.width * sin + src.height * cos) / src.height)
        : 1;
      const cs = ctx2d(cropCanvas);
      cs.translate(cropCanvas.width / 2, cropCanvas.height / 2);
      cs.rotate(rad);
      cs.scale(scale, scale);
      cs.drawImage(src, -src.width / 2, -src.height / 2);
      final = cropCanvas;
    }

    const label = angle % 90 === 0 ? `${angle}deg` : `${angle}deg`;
    const result = await encodeImageResult(img, final, enc, label);
    result.note = `Rotated ${angle}°${autoCrop ? " · auto-cropped" : ""}`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Flip ---------- */
async function flip(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const axis = str(o, "__axis", "horizontal");
  const enc = encodeOpts(o);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = canvasFromImage(img);
    const canvas = createCanvas(src.width, src.height);
    const c = ctx2d(canvas);
    if (axis === "horizontal") {
      c.translate(src.width, 0);
      c.scale(-1, 1);
    } else {
      c.translate(0, src.height);
      c.scale(1, -1);
    }
    c.drawImage(src, 0, 0);
    const result = await encodeImageResult(img, canvas, enc, axis === "horizontal" ? "flip-h" : "flip-v");
    result.note = axis === "horizontal" ? "Mirrored horizontally" : "Flipped vertically";
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Straighten ---------- */
async function straighten(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const angle = num(o, "angle", 0);
  const zoomFill = bool(o, "zoomFill", true);
  const enc = encodeOpts(o);
  const rad = (angle * Math.PI) / 180;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = canvasFromImage(img);
    const canvas = createCanvas(src.width, src.height);
    const c = ctx2d(canvas);
    if (zoomFill) {
      // scale to hide empty corners
      const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
      const scale = Math.max(
        (src.width * cos + src.height * sin) / src.width,
        (src.width * sin + src.height * cos) / src.height
      );
      c.translate(canvas.width / 2, canvas.height / 2);
      c.rotate(rad);
      c.scale(scale, scale);
      c.drawImage(src, -src.width / 2, -src.height / 2);
    } else {
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.translate(canvas.width / 2, canvas.height / 2);
      c.rotate(rad);
      c.drawImage(src, -src.width / 2, -src.height / 2);
    }
    const result = await encodeImageResult(img, canvas, enc, "straightened");
    result.note = `Straightened ${angle}° with corner fill`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Center crop to ratio ---------- */
async function cropRatio(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const ratioStr = str(o, "__ratio", "1:1");
  const [rw, rh] = ratioStr.split(":").map(Number);
  const anchor = str(o, "anchor", "center");
  const enc = encodeOpts(o);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = canvasFromImage(img);
    const targetRatio = rw / rh;
    const srcRatio = src.width / src.height;

    let cw: number, ch: number;
    if (srcRatio > targetRatio) {
      ch = src.height;
      cw = src.height * targetRatio;
    } else {
      cw = src.width;
      ch = src.width / targetRatio;
    }
    let cx = (src.width - cw) / 2;
    let cy = (src.height - ch) / 2;
    if (anchor === "top") cy = 0;
    if (anchor === "bottom") cy = src.height - ch;
    if (anchor === "top-heavy") cy = (src.height - ch) * 0.35;

    const canvas = createCanvas(cw, ch);
    ctx2d(canvas).drawImage(src, -cx, -cy);
    const result = await encodeImageResult(img, canvas, enc, ratioStr.replace(":", "x"));
    result.note = `Cropped to ${ratioStr} (${Math.round(cw)}×${Math.round(ch)})`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Circular crop ---------- */
async function cropCircle(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const anchor = str(o, "anchor", "center");
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = canvasFromImage(img);
    const size = Math.min(src.width, src.height);
    const cx = (src.width - size) / 2;
    const cy = anchor === "top" ? 0 : anchor === "top-heavy" ? (src.height - size) * 0.3 : (src.height - size) / 2;

    const canvas = createCanvas(size, size);
    const c = ctx2d(canvas);
    c.beginPath();
    c.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    c.closePath();
    c.clip();
    c.drawImage(src, -cx, -cy);
    const result = await encodeImageResult(img, canvas, { format: "image/png", quality: 1 }, "circle");
    result.note = `Circular crop · ${size}×${size} PNG with transparency`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Auto border trim ---------- */
async function cropBorders(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const tolerance = num(o, "tolerance", 12);
  const enc = encodeOpts(o);
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = canvasFromImage(img);
    const px = getPixels(src);
    const d = px.data;
    const w = px.width, h = px.height;

    // Sample corner color as border reference
    const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4];
    const ref = [0, 0, 0];
    for (const c of corners) { ref[0] += d[c]; ref[1] += d[c + 1]; ref[2] += d[c + 2]; }
    ref[0] /= 4; ref[1] /= 4; ref[2] /= 4;

    const isBg = (x: number, y: number): boolean => {
      const o2 = (y * w + x) * 4;
      return (
        Math.abs(d[o2] - ref[0]) <= tolerance &&
        Math.abs(d[o2 + 1] - ref[1]) <= tolerance &&
        Math.abs(d[o2 + 2] - ref[2]) <= tolerance
      );
    };

    let top = 0, bottom = h - 1, left = 0, right = w - 1;
    const rowBg = (y: number) => { for (let x = 0; x < w; x += 2) if (!isBg(x, y)) return false; return true; };
    const colBg = (x: number) => { for (let y = 0; y < h; y += 2) if (!isBg(x, y)) return false; return true; };

    let trimmed = false;
    while (top < bottom && rowBg(top)) { top++; trimmed = true; }
    while (bottom > top && rowBg(bottom)) { bottom--; trimmed = true; }
    while (left < right && colBg(left)) { left++; trimmed = true; }
    while (right > left && colBg(right)) { right--; trimmed = true; }

    const pad = num(o, "padding", 0);
    top = Math.max(0, top - pad); left = Math.max(0, left - pad);
    bottom = Math.min(h - 1, bottom + pad); right = Math.min(w - 1, right + pad);

    const cw = right - left + 1, ch = bottom - top + 1;
    if (!trimmed || cw < 2 || ch < 2) {
      const result = await encodeImageResult(img, src, enc, "trimmed");
      result.note = "No borders detected — image unchanged";
      out.push(result);
      ctx.onProgress?.(i + 1, images.length);
      continue;
    }
    const canvas = createCanvas(cw, ch);
    ctx2d(canvas).drawImage(src, -left, -top);
    const result = await encodeImageResult(img, canvas, enc, "trimmed");
    result.note = `Trimmed ${left}px left, ${top}px top → ${cw}×${ch}`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Interactive crop (uses crop rect from options) ---------- */
async function cropManual(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const enc = encodeOpts(o);
  for (const img of images) {
    const src = canvasFromImage(img);
    const x = Math.max(0, Math.round(num(o, "cx", 0)));
    const y = Math.max(0, Math.round(num(o, "cy", 0)));
    const w = Math.min(src.width - x, Math.max(1, Math.round(num(o, "cw", src.width))));
    const h = Math.min(src.height - y, Math.max(1, Math.round(num(o, "ch", src.height))));
    const canvas = createCanvas(w, h);
    ctx2d(canvas).drawImage(src, -x, -y);
    const result = await encodeImageResult(img, canvas, enc, "cropped");
    result.note = `${w}×${h} from (${x}, ${y})`;
    out.push(result);
  }
  ctx.onProgress?.(images.length, images.length);
  return out;
}

export const geometryProcessors = {
  rotate,
  flip,
  straighten,
  cropRatio,
  cropCircle,
  cropBorders,
  cropManual,
};
