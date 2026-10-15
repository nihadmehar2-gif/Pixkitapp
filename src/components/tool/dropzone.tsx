"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { filesFromDataTransfer, formatBytes } from "@/lib/image/loader";
import { Upload, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  accept?: string[];
  multiple?: boolean;
  maxFiles: number;
  maxSize: number;
  onFiles: (files: File[]) => void;
  compact?: boolean;
}

export function Dropzone({ accept, multiple, maxFiles, maxSize, onFiles, compact }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const files = Array.from(list);
      if (files.length) onFiles(multiple ? files.slice(0, maxFiles) : files.slice(0, 1));
    },
    [onFiles, multiple, maxFiles]
  );

  const acceptAttr = accept?.length
    ? [...accept.map((a) => (a.startsWith(".") ? a : a)), ...["image/*"].filter(() => accept?.some((a) => a === "image/jpeg" || a === "image/png"))].join(",") || undefined
    : "image/*";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={multiple ? "Upload images: choose files or drop them here" : "Upload an image: choose a file or drop it here"}
      aria-describedby={hintId}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-card/50 text-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/40",
        compact ? "p-5" : "p-6 sm:p-12"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={acceptAttr ?? "image/*,.bmp,.avif,.svg"}
        multiple={multiple}
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Upload className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold">{multiple ? `Choose images or drop them here` : "Choose an image or drop it here"}</p>
        <p id={hintId} className="mt-1 text-sm text-muted-foreground">
          Up to {maxFiles} image{maxFiles > 1 ? "s" : ""} · max {formatBytes(maxSize, 0)} each · files never leave your device
        </p>
      </div>
      {/* Large, touch-friendly select button (44px+ tall; full width on phones). */}
      <Button type="button" size="lg" className="mt-1 h-14 w-full text-base font-semibold sm:h-12 sm:min-w-[220px] sm:w-auto sm:text-lg" tabIndex={-1}>
        <ImageIcon className="mr-2 h-5 w-5" />
        Select {multiple ? "Images" : "Image"}
      </Button>
      <p className="text-xs text-muted-foreground">You can also paste (Ctrl+V) an image from your clipboard</p>
      {compact && <X className="hidden" />}
    </div>
  );
}
