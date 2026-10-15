/** Watermarking & text-on-image processors. */

import type { LoadedImage } from "@/lib/image/loader";
import type { ProcessedResult, ProcessContext, ToolOptionValues } from "../types";
import { createCanvas, ctx2d } from "@/lib/image/canvas";
import { num, str, bool, encodeImageResult, canvasFromImage, encodeOpts } from "./helpers";

type Anchor = "top-left" | "top-center" | "top-right" | "middle-left" | "center" | "middle-right" | "bottom-left" | "bottom-center" | "bottom-right";

function anchorXY(c: CanvasRenderingContext2D, anchor: Anchor, margin: number, w: number, h: number, boxW: number, boxH: number): { x: number; y: number } {
  const horiz = anchor.includes("left") ? margin : anchor.includes("right") ? w - margin - boxW : (w - boxW) / 2;
  const vert = anchor.startsWith("top") ? margin + boxH : anchor.startsWith("bottom") ? h - margin : h / 2 + boxH / 2 - boxH / 2;
  return { x: horiz, y: vert };
}

/* ---------- Text watermark ---------- */
export async function textWatermark(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const text = str(o, "text", "© PixKitApp");
  const sizePct = num(o, "size", 5) / 100;
  const opacity = num(o, "opacity", 40) / 100;
  const color = str(o, "color", "#ffffff");
  const rotation = num(o, "rotation", 0);
  const anchor = str(o, "position", "bottom-right") as Anchor;
  const shadow = bool(o, "shadow", true);
  const enc = encodeOpts(o);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const c = ctx2d(canvas);
    const fontSize = Math.max(12, Math.round(Math.min(canvas.width, canvas.height) * sizePct));
    c.font = `600 ${fontSize}px system-ui, sans-serif`;
    const m = c.measureText(text);
    const boxW = m.width, boxH = fontSize * 1.2;
    const margin = Math.round(fontSize * 0.6);
    const { x, y } = anchorXY(c, anchor, margin, canvas.width, canvas.height, boxW, boxH);

    c.save();
    c.globalAlpha = opacity;
    c.translate(x + boxW / 2, y - boxH / 2);
    c.rotate((rotation * Math.PI) / 180);
    c.textAlign = "center";
    c.textBaseline = "middle";
    if (shadow) {
      c.shadowColor = "rgba(0,0,0,0.55)";
      c.shadowBlur = fontSize / 6;
      c.shadowOffsetY = 1;
    }
    c.fillStyle = color;
    c.fillText(text, 0, 0);
    c.restore();
    const result = await encodeImageResult(img, canvas, enc, "watermarked");
    result.note = `"${text}" · ${anchor} · ${Math.round(opacity * 100)}% opacity`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Logo/image watermark ---------- */
export async function logoWatermark(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const logoFile = o.__logoFiles as unknown as File[] | undefined;
  const anchor = str(o, "position", "bottom-right") as Anchor;
  const opacity = num(o, "opacity", 70) / 100;
  const scalePct = num(o, "scale", 20) / 100;
  const marginPct = num(o, "margin", 3) / 100;
  const enc = encodeOpts(o);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const c = ctx2d(canvas);

    if (!logoFile || logoFile.length === 0) {
      // no logo: output unchanged
      const result = await encodeImageResult(img, canvas, enc, "watermarked");
      result.note = "No logo selected — image unchanged";
      out.push(result);
      ctx.onProgress?.(i + 1, images.length);
      continue;
    }
    const logoUrl = URL.createObjectURL(logoFile[0]);
    const logo = await new Promise<HTMLImageElement>((res, rej) => {
      const li = new Image();
      li.onload = () => res(li);
      li.onerror = rej;
      li.src = logoUrl;
    });
    URL.revokeObjectURL(logoUrl);

    const lw = canvas.width * scalePct;
    const lh = lw * (logo.height / logo.width);
    const margin = canvas.width * marginPct;
    const x = anchor.includes("left") ? margin : anchor.includes("right") ? canvas.width - margin - lw : (canvas.width - lw) / 2;
    const y = anchor.startsWith("top") ? margin : anchor.startsWith("bottom") ? canvas.height - margin - lh : (canvas.height - lh) / 2;

    c.save();
    c.globalAlpha = opacity;
    c.drawImage(logo, x, y, lw, lh);
    c.restore();
    const result = await encodeImageResult(img, canvas, enc, "logo");
    result.note = `Logo at ${anchor} · ${Math.round(scalePct * 100)}% width · ${Math.round(opacity * 100)}% opacity`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Tiled watermark ---------- */
export async function tiledWatermark(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const text = str(o, "text", "SAMPLE");
  const gapPct = num(o, "gap", 8) / 100;
  const opacity = num(o, "opacity", 15) / 100;
  const angle = num(o, "angle", -30);
  const sizePct = num(o, "size", 4) / 100;
  const color = str(o, "color", "#000000");
  const enc = encodeOpts(o);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const c = ctx2d(canvas);
    const fontSize = Math.max(10, Math.round(Math.min(canvas.width, canvas.height) * sizePct));
    c.save();
    c.globalAlpha = opacity;
    c.fillStyle = color;
    c.font = `700 ${fontSize}px system-ui, sans-serif`;
    c.translate(canvas.width / 2, canvas.height / 2);
    c.rotate((angle * Math.PI) / 180);
    const gap = Math.min(canvas.width, canvas.height) * gapPct + fontSize * 4;
    const m = c.measureText(text);
    const cols = Math.ceil((canvas.width + canvas.height) / gap) + 2;
    const rows = cols;
    for (let r = -rows; r <= rows; r++) {
      for (let col = -cols; col <= cols; col++) {
        c.fillText(text, col * gap - m.width / 2, r * gap);
      }
    }
    c.restore();
    const result = await encodeImageResult(img, canvas, enc, "tiled");
    result.note = `"${text}" tiled pattern · ${Math.round(opacity * 100)}% opacity`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Date watermark ---------- */
export async function dateWatermark(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const custom = str(o, "customDate", "");
  const dateStr = custom || new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const opts: ToolOptionValues = {
    ...o,
    text: dateStr,
  };
  const results = await textWatermark(images, opts, ctx);
  for (const r of results) r.note = `Date stamp: ${dateStr} · ${r.note ?? ""}`;
  return results;
}

/* ---------- General text overlay ---------- */
export async function textOverlay(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const text = str(o, "text", "Your text here");
  const sizePct = num(o, "fontSize", 8) / 100;
  const color = str(o, "color", "#111111");
  const weight = str(o, "weight", "bold");
  const anchor = str(o, "position", "center") as Anchor;
  const bgEnabled = bool(o, "background", true);
  const bgColor = str(o, "bgColor", "#ffffff");
  const bgOpacity = num(o, "bgOpacity", 85) / 100;
  const enc = encodeOpts(o);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const c = ctx2d(canvas);
    const fontSize = Math.max(12, Math.round(Math.min(canvas.width, canvas.height) * sizePct));
    c.font = `${weight} ${fontSize}px system-ui, sans-serif`;
    const lines = text.split("\n");
    const lineH = fontSize * 1.3;
    const widest = Math.max(...lines.map((l) => c.measureText(l).width));
    const boxW = widest + fontSize * 0.8;
    const boxH = lines.length * lineH + fontSize * 0.4;
    const margin = Math.round(fontSize * 0.5);
    const { x, y } = anchorXY(c, anchor, margin, canvas.width, canvas.height, boxW, boxH);

    if (bgEnabled) {
      c.save();
      c.globalAlpha = bgOpacity;
      c.fillStyle = bgColor;
      const r = fontSize * 0.25;
      const bx = x, by = y - boxH, bw = boxW, bh = boxH;
      c.beginPath();
      c.moveTo(bx + r, by);
      c.arcTo(bx + bw, by, bx + bw, by + bh, r);
      c.arcTo(bx + bw, by + bh, bx, by + bh, r);
      c.arcTo(bx, by + bh, bx, by, r);
      c.arcTo(bx, by, bx + bw, by, r);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.fillStyle = color;
    c.textAlign = "center";
    c.textBaseline = "middle";
    lines.forEach((line, li) => {
      c.fillText(line, x + boxW / 2, y - boxH + fontSize * 0.65 + li * lineH);
    });
    const result = await encodeImageResult(img, canvas, enc, "text");
    result.note = `Text overlay (${anchor})`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Caption bar ---------- */
export async function captionBar(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const caption = str(o, "caption", "Your caption here");
  const barPct = num(o, "barHeight", 18) / 100;
  const bgColor = str(o, "bgColor", "#111111");
  const textColor = str(o, "textColor", "#ffffff");
  const position = str(o, "position", "bottom");
  const enc = encodeOpts(o);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = canvasFromImage(img);
    const barH = Math.round(src.height * barPct);
    const canvas = createCanvas(src.width, src.height + barH);
    const c = ctx2d(canvas);
    c.fillStyle = bgColor;
    c.fillRect(0, 0, canvas.width, canvas.height);
    if (position === "top") {
      c.drawImage(src, 0, barH);
    } else {
      c.drawImage(src, 0, 0);
    }
    const barY = position === "top" ? 0 : src.height;
    const fontSize = Math.max(12, Math.round(barH * 0.42));
    c.font = `500 ${fontSize}px system-ui, sans-serif`;
    c.fillStyle = textColor;
    c.textAlign = "center";
    c.textBaseline = "middle";
    // word wrap
    const maxWidth = canvas.width * 0.92;
    const words = caption.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (c.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    const startY = barY + barH / 2 - ((lines.length - 1) * fontSize * 1.25) / 2;
    lines.forEach((l, li) => c.fillText(l, canvas.width / 2, startY + li * fontSize * 1.25));
    const result = await encodeImageResult(img, canvas, enc, "caption");
    result.note = `Caption bar (${position}) · ${lines.length} line${lines.length > 1 ? "s" : ""}`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Meme text ---------- */
export async function memeText(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const top = str(o, "topText", "TOP TEXT").toUpperCase();
  const bottom = str(o, "bottomText", "BOTTOM TEXT").toUpperCase();
  const sizePct = num(o, "fontSize", 10) / 100;
  const whiteFill = str(o, "textColor", "#ffffff");
  const stroke = str(o, "strokeColor", "#000000");
  const caps = bool(o, "uppercase", true);
  const enc = encodeOpts(o);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const c = ctx2d(canvas);
    const fontSize = Math.max(14, Math.round(canvas.width * sizePct));
    c.font = `900 ${fontSize}px Impact, "Arial Black", system-ui, sans-serif`;
    c.textAlign = "center";
    const t = caps ? top.toUpperCase() : top;
    const b = caps ? bottom.toUpperCase() : bottom;
    c.lineWidth = Math.max(2, fontSize / 12);
    c.strokeStyle = stroke;
    c.fillStyle = whiteFill;
    const margin = fontSize * 0.4;
    c.textBaseline = "top";
    c.strokeText(t, canvas.width / 2, margin, canvas.width * 0.94);
    c.fillText(t, canvas.width / 2, margin, canvas.width * 0.94);
    c.textBaseline = "bottom";
    c.strokeText(b, canvas.width / 2, canvas.height - margin, canvas.width * 0.94);
    c.fillText(b, canvas.width / 2, canvas.height - margin, canvas.width * 0.94);
    const result = await encodeImageResult(img, canvas, enc, "meme");
    result.note = `Meme text applied`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Quote card ---------- */
export async function quoteCard(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const quote = str(o, "quote", "The best way to predict the future is to invent it.");
  const author = str(o, "author", "");
  const overlay = bool(o, "overlay", true);
  const overlayColor = str(o, "overlayColor", "#000000");
  const overlayOpacity = num(o, "overlayOpacity", 45) / 100;
  const textColor = str(o, "textColor", "#ffffff");
  const enc = encodeOpts(o);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const c = ctx2d(canvas);
    if (overlay) {
      c.fillStyle = overlayColor + Math.round(overlayOpacity * 255).toString(16).padStart(2, "0");
      c.fillRect(0, 0, canvas.width, canvas.height);
    }
    const fontSize = Math.max(16, Math.round(Math.min(canvas.width, canvas.height) * 0.055));
    c.font = `600 ${fontSize}px Georgia, serif`;
    c.fillStyle = textColor;
    c.textAlign = "center";
    const maxWidth = canvas.width * 0.8;
    const words = quote.replace(/^["“]|["”]$/g, "").split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (c.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    const lineH = fontSize * 1.4;
    let y = canvas.height / 2 - ((lines.length - 1) * lineH) / 2;
    c.fillText("“", canvas.width / 2, y - fontSize * 1.1);
    for (const l of lines) { c.fillText(l, canvas.width / 2, y); y += lineH; }
    if (author) {
      c.font = `400 ${Math.round(fontSize * 0.6)}px system-ui, sans-serif`;
      c.globalAlpha = 0.85;
      c.fillText(`— ${author}`, canvas.width / 2, y + fontSize * 0.6);
      c.globalAlpha = 1;
    }
    const result = await encodeImageResult(img, canvas, enc, "quote");
    result.note = `Quote card${author ? ` — ${author}` : ""}`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

/* ---------- Title banner (blog thumbnails) ---------- */
export async function titleBanner(images: LoadedImage[], o: ToolOptionValues, ctx: ProcessContext): Promise<ProcessedResult[]> {
  const out: ProcessedResult[] = [];
  const title = str(o, "title", "Blog Post Title");
  const subtitle = str(o, "subtitle", "");
  const position = str(o, "position", "bottom");
  const barColor = str(o, "barColor", "#111827");
  const barOpacity = num(o, "barOpacity", 80) / 100;
  const textColor = str(o, "textColor", "#ffffff");
  const accent = str(o, "accentColor", "#f59e0b");
  const enc = encodeOpts(o);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const canvas = canvasFromImage(img);
    const c = ctx2d(canvas);
    const barH = Math.round(canvas.height * (subtitle ? 0.3 : 0.24));
    const barY = position === "top" ? 0 : canvas.height - barH;
    c.fillStyle = barColor + Math.round(barOpacity * 255).toString(16).padStart(2, "0");
    c.fillRect(0, barY, canvas.width, barH);
    c.fillStyle = accent;
    c.fillRect(0, position === "top" ? barH : barY, canvas.width, 4);
    const titleSize = Math.max(16, Math.round(barH * 0.34));
    const subSize = Math.max(12, Math.round(barH * 0.22));
    const titleLines = wrapText(c, title, canvas.width * 0.9, `800 ${titleSize}px system-ui, sans-serif`);
    c.font = `800 ${titleSize}px system-ui, sans-serif`;
    c.fillStyle = textColor;
    c.textAlign = "left";
    let y = barY + barH / 2 - ((titleLines.length - 1) * titleSize * 1.2 + (subtitle ? subSize * 1.6 : 0)) / 2 + titleSize * 0.4;
    for (const l of titleLines) { c.fillText(l, canvas.width * 0.05, y); y += titleSize * 1.2; }
    if (subtitle) {
      c.font = `400 ${subSize}px system-ui, sans-serif`;
      c.globalAlpha = 0.8;
      c.fillText(subtitle.slice(0, 90), canvas.width * 0.05, y + subSize * 0.4);
      c.globalAlpha = 1;
    }
    const result = await encodeImageResult(img, canvas, enc, "title");
    result.note = `Title banner (${position})`;
    out.push(result);
    ctx.onProgress?.(i + 1, images.length);
  }
  return out;
}

function wrapText(c: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  c.font = font;
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (c.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

export const annotateProcessors = {
  textWatermark, logoWatermark, tiledWatermark, dateWatermark,
  textOverlay, captionBar, memeText, quoteCard, titleBanner,
};
