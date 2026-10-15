/**
 * Core image loading & validation utilities.
 * All processing happens 100% client-side — no uploads.
 */

export const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB per file
export const MAX_BATCH = 10; // default max batch size

export interface LoadedImage {
  file: File;
  id: string;
  name: string;
  width: number;
  height: number;
  size: number;
  type: string;
  /** Null for text payloads (e.g. a Base64 dump) that are not decodable images
   *  but are explicitly accepted by text-oriented tools. */
  bitmap: ImageBitmap | HTMLImageElement | null;
  objectUrl: string;
}

export interface LoadOptions {
  accept?: string[]; // mime types or extensions
  maxFiles?: number;
  maxSize?: number; // bytes
}

export class FileValidationError extends Error {}

/** Format bytes into a human readable string. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  if (!bytes || bytes < 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function extensionOf(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(idx + 1).toLowerCase() : "";
}

/** Validate a single file against constraints. Throws FileValidationError. */
export function validateFile(file: File, opts: LoadOptions): void {
  const maxSize = opts.maxSize ?? MAX_FILE_SIZE;
  if (file.size > maxSize) {
    throw new FileValidationError(
      `"${file.name}" is ${formatBytes(file.size)} — exceeds the ${formatBytes(maxSize)} limit.`
    );
  }
  if (opts.accept && opts.accept.length > 0) {
    const ext = extensionOf(file.name);
    const mimeOk = opts.accept.includes(file.type);
    const extOk = opts.accept.some((a) => a.startsWith(".") && a.slice(1).toLowerCase() === ext);
    if (!mimeOk && !extOk) {
      throw new FileValidationError(
        `"${file.name}" has unsupported format (${file.type || ext || "unknown"}).`
      );
    }
  }
}

/** Load an image file into a bitmap/HTMLImageElement.
 *  Text payloads (.txt/.b64) are passed through without a bitmap when the
 *  tool explicitly accepts them — processors like Base64-to-Image read the
 *  raw file bytes themselves. */
export async function loadImageFile(file: File, accept?: string[]): Promise<LoadedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    let bitmap: ImageBitmap | HTMLImageElement | null;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      const name = file.name.toLowerCase();
      const textish = file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".b64");
      const acceptsText =
        !!accept &&
        accept.some((a) => a === ".txt" || a === ".b64" || a.startsWith("text/"));
      if (textish && acceptsText) {
        return {
          file,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          width: 0,
          height: 0,
          size: file.size,
          type: file.type || "text/plain",
          bitmap: null,
          objectUrl,
        };
      }
      // Fallback for formats createImageBitmap can't handle (e.g. some SVG)
      bitmap = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new FileValidationError(`Cannot decode "${file.name}". The file may be corrupted or an unsupported format.`));
        img.src = objectUrl;
      });
    }
    const width = "width" in bitmap ? bitmap.width : 0;
    const height = "height" in bitmap ? bitmap.height : 0;
    if (!width || !height) {
      throw new FileValidationError(`"${file.name}" has invalid dimensions.`);
    }
    return {
      file,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      width,
      height,
      size: file.size,
      type: file.type || `image/${extensionOf(file.name)}`,
      bitmap,
      objectUrl,
    };
  } catch (e) {
    URL.revokeObjectURL(objectUrl);
    throw e;
  }
}

/** Load and validate a list of files. Returns images plus rejected files with reasons. */
export async function loadFiles(
  files: File[],
  opts: LoadOptions = {}
): Promise<{ images: LoadedImage[]; errors: string[] }> {
  const maxFiles = opts.maxFiles ?? MAX_BATCH;
  const errors: string[] = [];
  const images: LoadedImage[] = [];

  const capped = files.slice(0, maxFiles);
  if (files.length > maxFiles) {
    errors.push(`Only the first ${maxFiles} files were processed (batch limit).`);
  }

  for (const file of capped) {
    try {
      validateFile(file, opts);
      const img = await loadImageFile(file, opts.accept);
      images.push(img);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : `Failed to load "${file.name}".`);
    }
  }
  return { images, errors };
}

/** Extract File objects from a drag event or input change. */
export function filesFromDataTransfer(dt: DataTransfer | null): File[] {
  if (!dt) return [];
  return Array.from(dt.files).filter(
    (f) => f.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|avif|svg)$/i.test(f.name)
  );
}
