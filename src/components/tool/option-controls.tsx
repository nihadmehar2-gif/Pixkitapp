"use client";

/** Renders ToolOption controls + special slots (logo file picker, base64 textarea). */

import type { ToolOption, ToolOptionValues } from "@/lib/tools/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";
import { ImagePlus } from "lucide-react";

interface Props {
  options: ToolOption[];
  values: ToolOptionValues;
  onChange: (key: string, value: string | number | boolean) => void;
  onLogoFiles?: (files: File[]) => void;
}

export function OptionControls({ options, values, onChange, onLogoFiles }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {options.map((opt) => {
        const value = values[opt.key];
        switch (opt.type) {
          case "slider": {
            const v = typeof value === "number" ? value : opt.default;
            return (
              <div key={opt.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`opt-${opt.key}`}>{opt.label}</Label>
                  <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">{v}{opt.suffix}</span>
                </div>
                <Slider
                  id={`opt-${opt.key}`}
                  value={[v]}
                  min={opt.min}
                  max={opt.max}
                  step={opt.step ?? 1}
                  onValueChange={([nv]) => onChange(opt.key, nv)}
                />
                {opt.help && <p className="text-xs text-muted-foreground">{opt.help}</p>}
              </div>
            );
          }
          case "number":
            return (
              <div key={opt.key} className="space-y-1.5">
                <Label htmlFor={`opt-${opt.key}`}>{opt.label}{opt.suffix ? ` (${opt.suffix})` : ""}</Label>
                <Input
                  id={`opt-${opt.key}`}
                  type="number"
                  inputMode="numeric"
                  value={typeof value === "number" || value === "" ? value : opt.default}
                  min={opt.min}
                  max={opt.max}
                  step={opt.step ?? 1}
                  onChange={(e) => onChange(opt.key, e.target.value === "" ? "" : parseFloat(e.target.value))}
                />
                {opt.help && <p className="text-xs text-muted-foreground">{opt.help}</p>}
              </div>
            );
          case "select":
            return (
              <div key={opt.key} className="space-y-1.5">
                <Label htmlFor={`opt-${opt.key}`}>{opt.label}</Label>
                <Select value={String(value ?? opt.default)} onValueChange={(v) => onChange(opt.key, v)}>
                  <SelectTrigger id={`opt-${opt.key}`} className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {opt.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {opt.help && <p className="text-xs text-muted-foreground">{opt.help}</p>}
              </div>
            );
          case "toggle":
            return (
              <div key={opt.key} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                <div>
                  <Label htmlFor={`opt-${opt.key}`}>{opt.label}</Label>
                  {opt.help && <p className="mt-0.5 text-xs text-muted-foreground">{opt.help}</p>}
                </div>
                <Switch id={`opt-${opt.key}`} checked={Boolean(value ?? opt.default)} onCheckedChange={(v) => onChange(opt.key, v)} />
              </div>
            );
          case "color":
            return (
              <div key={opt.key} className="space-y-1.5">
                <Label htmlFor={`opt-${opt.key}`}>{opt.label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    id={`opt-${opt.key}`}
                    type="color"
                    value={String(value ?? opt.default)}
                    onChange={(e) => onChange(opt.key, e.target.value)}
                    className="h-11 w-14 cursor-pointer rounded-md border bg-card p-1"
                    aria-label={opt.label}
                  />
                  <Input value={String(value ?? opt.default)} onChange={(e) => onChange(opt.key, e.target.value)} className="font-mono text-sm" />
                </div>
                {opt.help && <p className="text-xs text-muted-foreground">{opt.help}</p>}
              </div>
            );
          case "text":
            return (
              <div key={opt.key} className="space-y-1.5">
                <Label htmlFor={`opt-${opt.key}`}>{opt.label}</Label>
                <Input
                  id={`opt-${opt.key}`}
                  value={String(value ?? "")}
                  placeholder={opt.placeholder}
                  maxLength={opt.maxLength}
                  onChange={(e) => onChange(opt.key, e.target.value)}
                />
                {opt.help && <p className="text-xs text-muted-foreground">{opt.help}</p>}
              </div>
            );
          case "textarea":
            return (
              <div key={opt.key} className="space-y-1.5">
                <Label htmlFor={`opt-${opt.key}`}>{opt.label}</Label>
                <Textarea
                  id={`opt-${opt.key}`}
                  value={String(value ?? "")}
                  placeholder={opt.placeholder}
                  maxLength={opt.maxLength}
                  rows={5}
                  className="font-mono text-xs"
                  onChange={(e) => onChange(opt.key, e.target.value)}
                />
                {opt.help && <p className="text-xs text-muted-foreground">{opt.help}</p>}
              </div>
            );
          default:
            return null;
        }
      })}
      {onLogoFiles && <LogoFileSlot onFiles={onLogoFiles} />}
    </div>
  );
}

function LogoFileSlot({ onFiles }: { onFiles: (files: File[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5 rounded-lg border border-dashed p-3">
      <Label>Logo image (PNG recommended)</Label>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) onFiles([e.target.files[0]]); e.target.value = ""; }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border bg-card text-sm font-medium hover:bg-accent"
      >
        <ImagePlus className="h-4 w-4" /> Choose logo file
      </button>
    </div>
  );
}
