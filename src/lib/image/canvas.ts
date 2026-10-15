/**
 * Canvas creation, encoding and download helpers.
 */

export type OutputFormat = "image/jpeg" | "image/png" | "image/webp" | "auto";

export interface EncodeOptions {
  format: OutputFormat;
  quality?: number; // 0..1 for jpeg/webp
  background?: string; // flatten background for formats without alpha
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

export function ctx2d(canvas: HTMLCanvasElement, alpha = true): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { willReadFrequently: false, alpha });
  if (!ctx) throw new Error("Canvas 2D context is not supported in this browser.");
  return ctx;
}

export function ctxForRead(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context is not supported in this browser.");
  return ctx;
}

/** Flatten an image onto a background color (for converting to JPEG etc). */
export function drawFlattened(
  source: CanvasImageSource,
  width: number,
  height: number,
  background: string = "#ffffff"
): HTMLCanvasElement {
  const canvas = createCanvas(width, height);
  const ctx = ctx2d(canvas, false);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Pick the actual encode mime for 'auto' based on source alpha presence. */
export async function resolveAutoFormat(canvas: HTMLCanvasElement, preferred: OutputFormat): Promise<Exclude<OutputFormat, "auto">> {
  if (preferred !== "auto") return preferred;
  // Keep alpha if any pixel is transparent, else encode JPEG (smaller).
  if (await canvasHasAlpha(canvas)) return "image/png";
  return "image/jpeg";
}

export async function canvasHasAlpha(canvas: HTMLCanvasElement): Promise<boolean> {
  const ctx = ctxForRead(canvas);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  // Sample every 4th pixel alpha channel for speed on large images
  const step = 4 * 4;
  for (let i = 3; i < data.length; i += step) {
    if (data[i] < 255) return true;
  }
  return false;
}

/** Encode a canvas to a Blob. */
export function canvasToBlob(canvas: HTMLCanvasElement, format: Exclude<OutputFormat, "auto">, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`This browser could not encode ${format}.`));
      },
      format,
      quality
    );
  });
}

export interface EncodedResult {
  blob: Blob;
  mime: string;
  width: number;
  height: number;
}

/** Encode canvas with auto format resolution + alpha flattening. */
export async function encodeCanvas(canvas: HTMLCanvasElement, opts: EncodeOptions): Promise<EncodedResult> {
  const format = await resolveAutoFormat(canvas, opts.format);
  let target: HTMLCanvasElement = canvas;
  if (format === "image/jpeg") {
    // Check for alpha and flatten if needed
    if (await canvasHasAlpha(canvas)) {
      target = drawFlattened(canvas, canvas.width, canvas.height, opts.background ?? "#ffffff");
    }
  }
  const blob = await canvasToBlob(target, format, opts.quality);
  return { blob, mime: format, width: target.width, height: target.height };
}

/** High-quality multi-step downscale (avoids aliasing on large reductions). */
export function drawScaled(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): HTMLCanvasElement {
  let current = source;
  let cw = srcW;
  let ch = srcH;
  // Step down in halves until within 2x of target
  while (cw / 2 >= dstW && ch / 2 >= dstH && cw > 2 && ch > 2) {
    const half = createCanvas(Math.max(1, Math.floor(cw / 2)), Math.max(1, Math.floor(ch / 2)));
    const hctx = ctx2d(half);
    hctx.imageSmoothingEnabled = true;
    hctx.imageSmoothingQuality = "high";
    hctx.drawImage(current, 0, 0, half.width, half.height);
    current = half;
    cw = half.width;
    ch = half.height;
  }
  const out = createCanvas(dstW, dstH);
  const octx = ctx2d(out);
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(current, 0, 0, dstW, dstH);
  return out;
}

export function baseName(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

export function outputName(name: string, ext: string, suffix?: string): string {
  const s = suffix ? `-${suffix}` : "";
  return `${baseName(name)}${s}.${ext}`;
}

export const EXT_FOR_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/x-icon": "ico",
  "application/pdf": "pdf",
};

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Get a drawable canvas from any loaded image. */
export function imageToCanvas(img: HTMLImageElement | ImageBitmap, w?: number, h?: number): HTMLCanvasElement {
  const width = w ?? img.width;
  const height = h ?? img.height;
  const canvas = createCanvas(width, height);
  const ctx = ctx2d(canvas);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

export function cloneCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = createCanvas(src.width, src.height);
  ctx2d(out).drawImage(src, 0, 0);
  return out;
}
