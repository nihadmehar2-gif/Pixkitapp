"use client";

/** Interactive color picker: click/tap the image to sample colors, copy HEX/RGB/HSL, download swatch. */

import { useCallback, useEffect, useRef, useState } from "react";
import { createCanvas, ctx2d, ctxForRead } from "@/lib/image/canvas";
import { rgbToHex, hexToRgb } from "@/lib/image/encoders";
import { Dropzone } from "./dropzone";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/image/canvas";
import { Copy, Check, Download, Pipette, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Sample {
  hex: string;
  r: number;
  g: number;
  b: number;
  x: number;
  y: number;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

export function ColorPickerWorkspace() {
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const [history, setHistory] = useState<Sample[]>([]);
  const [copied, setCopied] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const srcUrlRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Memory hygiene: release the source blob URL when the workspace unmounts.
  useEffect(() => {
    return () => {
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
    };
  }, []);

  const loadFile = useCallback((f: File) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      // Decoded in memory — release the temporary URL (and any previous one).
      if (srcUrlRef.current && srcUrlRef.current !== url) URL.revokeObjectURL(srcUrlRef.current);
      srcUrlRef.current = url;
      setImgEl(img);
      setSample(null);
      setHistory([]);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, []);

  useEffect(() => {
    if (!imgEl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const maxW = 640;
    const scale = Math.min(maxW / imgEl.naturalWidth, 480 / imgEl.naturalHeight, 1);
    canvas.width = Math.round(imgEl.naturalWidth * scale);
    canvas.height = Math.round(imgEl.naturalHeight * scale);
    const c = ctx2d(canvas);
    c.imageSmoothingQuality = "high";
    c.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
  }, [imgEl]);

  const sampleAt = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((clientY - rect.top) / rect.height) * canvas.height);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
    const ctx = ctxForRead(canvas);
    const d = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(d[0], d[1], d[2]);
    const s: Sample = { hex, r: d[0], g: d[1], b: d[2], x, y };
    setSample(s);
    setHistory((prev) => [s, ...prev.filter((p) => p.hex !== hex)].slice(0, 12));
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      toast({ title: "Copy failed", description: "Long-press to copy manually." });
    }
  };

  const downloadSwatch = () => {
    if (!sample) return;
    const sw = createCanvas(480, 240);
    const c = ctx2d(sw);
    c.fillStyle = sample.hex;
    c.fillRect(0, 0, 480, 240);
    const lum = (0.299 * sample.r + 0.587 * sample.g + 0.114 * sample.b) / 255;
    c.fillStyle = lum > 0.5 ? "#111111" : "#ffffff";
    c.font = "bold 36px monospace";
    c.textAlign = "center";
    c.fillText(sample.hex.toUpperCase(), 240, 110);
    c.font = "18px monospace";
    c.fillText(`rgb(${sample.r}, ${sample.g}, ${sample.b})`, 240, 150);
    const [h, s, l] = rgbToHsl(sample.r, sample.g, sample.b);
    c.fillText(`hsl(${h}, ${s}%, ${l}%)`, 240, 180);
    sw.toBlob((b) => b && downloadBlob(b, `color-${sample.hex.slice(1)}.png`), "image/png");
  };

  return (
    <div className="space-y-5">
      {!imgEl && (
        <Dropzone multiple={false} maxFiles={1} maxSize={30 * 1024 * 1024} onFiles={(files) => files[0] && loadFile(files[0])} />
      )}

      {imgEl && (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            <div className="checkerboard inline-flex max-w-full items-center justify-center overflow-hidden rounded-xl border p-2">
              <canvas
                ref={canvasRef}
                className="max-w-full cursor-crosshair touch-none"
                onPointerDown={(e) => sampleAt(e.clientX, e.clientY)}
                aria-label="Color picker canvas — click to sample a color"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">Click or tap anywhere on the image to sample that pixel&apos;s color</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setImgEl(null); setSample(null); setHistory([]); }}>
                <RefreshCcw className="mr-1 h-4 w-4" /> Change image
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-4">
            {sample ? (
              <>
                <div className="h-24 rounded-lg border" style={{ backgroundColor: sample.hex }} aria-label={`Selected color ${sample.hex}`} />
                <div className="space-y-2">
                  {[
                    { label: "HEX", value: sample.hex.toUpperCase() },
                    { label: "RGB", value: `rgb(${sample.r}, ${sample.g}, ${sample.b})` },
                    { label: "HSL", value: (() => { const [h, s, l] = rgbToHsl(sample.r, sample.g, sample.b); return `hsl(${h}, ${s}%, ${l}%)`; })() },
                    { label: "Pixel", value: `x:${sample.x}, y:${sample.y}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                        <p className="truncate font-mono text-sm">{value}</p>
                      </div>
                      {label !== "Pixel" && (
                        <button onClick={() => copy(value)} className="shrink-0 rounded-md p-1.5 hover:bg-accent" aria-label={`Copy ${label} value`}>
                          {copied === value ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Button onClick={downloadSwatch} className="h-11 w-full">
                  <Download className="mr-2 h-4 w-4" /> Download swatch PNG
                </Button>
              </>
            ) : (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Pipette className="h-8 w-8" />
                <p className="text-sm">Click the image to pick your first color</p>
              </div>
            )}

            {history.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Picked colors</p>
                <div className="flex flex-wrap gap-1.5">
                  {history.map((h, i) => (
                    <button
                      key={`${h.hex}-${i}`}
                      onClick={() => setSample(h)}
                      className="h-8 w-8 rounded-md border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: h.hex }}
                      title={`${h.hex.toUpperCase()} — rgb(${h.r}, ${h.g}, ${h.b})`}
                      aria-label={`Color ${h.hex}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
