/**
 * Client-side metadata readers: JPEG EXIF parser + PNG chunk inspector.
 * Used by metadata tools — no external libraries, privacy-safe.
 */

export interface ExifData {
  tagName: string;
  name: string;
  value: string;
}

export interface ImageMetadata {
  format: string;
  width?: number;
  height?: number;
  exif: ExifData[];
  hasGps: boolean;
  gps?: { lat: number; lng: number };
  pngChunks?: { type: string; size: number; text?: string }[];
  byteSize: number;
}

const TAGS: Record<number, string> = {
  0x010f: "Make", 0x0110: "Model", 0x0112: "Orientation", 0x011a: "X Resolution",
  0x011b: "Y Resolution", 0x0131: "Software", 0x0132: "Date/Time", 0x013b: "Artist",
  0x8298: "Copyright", 0x829a: "Exposure Time", 0x829d: "F Number", 0x8827: "ISO",
  0x9003: "Date Taken", 0x9004: "Date Digitized", 0x920a: "Focal Length",
  0xa002: "Exif Width", 0xa003: "Exif Height", 0x9286: "Comment", 0xa430: "Camera Owner",
  0xa431: "Serial Number", 0xa434: "Lens Model", 0xa432: "Lens Specs",
  0x0001: "GPS Latitude Ref", 0x0002: "GPS Latitude", 0x0003: "GPS Longitude Ref",
  0x0004: "GPS Longitude", 0x0006: "GPS Altitude", 0x001d: "GPS Date",
};

function readExif(view: DataView, tiffStart: number, ifdOffset: number, little: boolean, out: ExifData[], gps: { has: boolean; lat?: number; lng?: number }) {
  const numEntries = view.getUint16(tiffStart + ifdOffset, little);
  for (let i = 0; i < numEntries; i++) {
    const entryOff = tiffStart + ifdOffset + 2 + i * 12;
    if (entryOff + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOff, little);
    const type = view.getUint16(entryOff + 2, little);
    const count = view.getUint32(entryOff + 4, little);
    const valueOff = entryOff + 8;

    const typeSize: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
    const size = (typeSize[type] ?? 1) * count;
    let dataOff = valueOff;
    if (size > 4) dataOff = tiffStart + view.getUint32(valueOff, little);

    try {
      let value = "";
      if (type === 2) {
        // ASCII
        let s = "";
        for (let c = 0; c < count - 1 && dataOff + c < view.byteLength; c++) {
          s += String.fromCharCode(view.getUint8(dataOff + c));
        }
        value = s.trim();
      } else if (type === 3) {
        value = String(view.getUint16(dataOff, little));
      } else if (type === 4) {
        value = String(view.getUint32(dataOff, little));
      } else if (type === 5 && count >= 1) {
        // Rational
        const vals: string[] = [];
        for (let c = 0; c < Math.min(count, 4); c++) {
          const num = view.getUint32(dataOff + c * 8, little);
          const den = view.getUint32(dataOff + c * 8 + 4, little);
          vals.push(den === 0 ? "0" : (num / den).toString());
        }
        value = vals.join(", ");
      } else if (type === 10 && count >= 1) {
        const num = view.getInt32(dataOff, little);
        const den = view.getInt32(dataOff + 4, little);
        value = den === 0 ? "0" : (num / den).toString();
      }
      if (!value) continue;

      const name = TAGS[tag] ?? `Tag 0x${tag.toString(16)}`;
      out.push({ tagName: `0x${tag.toString(16).padStart(4, "0")}`, name, value });

      // GPS coordinate extraction (GPS IFD handled via recursion below)
      if (tag === 0x0002) gps.lat = parseGpsCoord(value);
      if (tag === 0x0004) gps.lng = parseGpsCoord(value);
      if (tag === 0x0001) gps.lat = value === "S" ? -(gps.lat ?? 0) : gps.lat;
      if (tag === 0x0003) gps.lng = value === "W" ? -(gps.lng ?? 0) : gps.lng;
      if (["GPS Latitude", "GPS Longitude", "GPS Latitude Ref", "GPS Longitude Ref"].includes(name)) gps.has = true;
    } catch {
      // skip malformed entries
    }
  }
  return numEntries;
}

function parseGpsCoord(v: string): number | undefined {
  const parts = v.split(",").map(Number);
  if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
    return parts[0] + parts[1] / 60 + parts[2] / 3600;
  }
  return parseFloat(v) || undefined;
}

/** Parse JPEG EXIF metadata from file bytes. */
export function parseJpegMetadata(buffer: ArrayBuffer, byteSize: number): ImageMetadata {
  const view = new DataView(buffer);
  const meta: ImageMetadata = { format: "JPEG", exif: [], hasGps: false, byteSize };
  if (view.getUint16(0) !== 0xffd8) return meta;

  let offset = 2;
  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const length = view.getUint16(offset + 2);

    if (marker === 0xe0 && offset + 10 < view.byteLength) {
      // JFIF — dimensions
      meta.height = view.getUint16(offset + 5);
      meta.width = view.getUint16(offset + 7);
    }
    if (marker === 0xc0 || marker === 0xc2) {
      meta.height = view.getUint16(offset + 5);
      meta.width = view.getUint16(offset + 7);
    }
    if (marker === 0xe1 && offset + 10 < view.byteLength) {
      // EXIF — check "Exif\0\0"
      if (view.getUint32(offset + 4) === 0x45786966 && view.getUint16(offset + 8) === 0x0000) {
        const tiffStart = offset + 10;
        const little = view.getUint16(tiffStart) === 0x4949;
        const ifd0 = view.getUint32(tiffStart + 4, little);
        const count0 = readExif(view, tiffStart, ifd0, little, meta.exif, { has: false });
        // Follow EXIF SubIFD + GPS IFD pointers
        for (let i = 0; i < count0; i++) {
          const entryOff = tiffStart + ifd0 + 2 + i * 12;
          if (entryOff + 12 > view.byteLength) break;
          const tag = view.getUint16(entryOff, little);
          if (tag === 0x8769) {
            readExif(view, tiffStart, view.getUint32(entryOff + 8, little), little, meta.exif, { has: false });
          }
          if (tag === 0x8825) {
            const gpsIfd = view.getUint32(entryOff + 8, little);
            const gpsTags: ExifData[] = [];
            const gpsInfo = { has: false };
            readExif(view, tiffStart, gpsIfd, little, gpsTags, gpsInfo);
            meta.hasGps = meta.hasGps || gpsInfo.has;
            // convert GPS rationals
            for (const t of gpsTags) {
              meta.exif.push(t);
              if (t.name === "GPS Latitude" && t.value.includes(",") && meta.gps) {
                meta.gps.lat = parseGpsCoord(t.value) ?? meta.gps.lat;
              } else if (t.name === "GPS Latitude" && t.value.includes(",")) {
                meta.gps = { lat: parseGpsCoord(t.value) ?? 0, lng: 0 };
              } else if (t.name === "GPS Longitude" && t.value.includes(",") && meta.gps) {
                meta.gps.lng = parseGpsCoord(t.value) ?? meta.gps.lng;
              } else if (t.name === "GPS Longitude" && t.value.includes(",")) {
                meta.gps = { lat: 0, lng: parseGpsCoord(t.value) ?? 0 };
              }
              if (t.name === "GPS Latitude Ref" && t.value === "S" && meta.gps) meta.gps.lat = -Math.abs(meta.gps.lat);
              if (t.name === "GPS Longitude Ref" && t.value === "W" && meta.gps) meta.gps.lng = -Math.abs(meta.gps.lng);
            }
          }
        }
      }
    }
    if (marker === 0xda) break; // start of scan
    offset += 2 + length;
  }
  if (meta.gps?.lat && meta.gps?.lng) meta.hasGps = true;
  return meta;
}

/** Parse PNG chunk structure. */
export function parsePngMetadata(buffer: ArrayBuffer, byteSize: number): ImageMetadata {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const meta: ImageMetadata = { format: "PNG", exif: [], hasGps: false, pngChunks: [], byteSize };
  const sig = [0x89, 0x50, 0x4e, 0x47];
  if (!sig.every((b, i) => bytes[i] === b)) return meta;

  let offset = 8;
  while (offset + 8 <= view.byteLength) {
    const length = view.getUint32(offset);
    let type = "";
    for (let i = 0; i < 4; i++) type += String.fromCharCode(bytes[offset + 4 + i]);
    meta.pngChunks!.push({ type, size: length });

    if (type === "IHDR") {
      meta.width = view.getUint32(offset + 8);
      meta.height = view.getUint32(offset + 12);
    }
    if (type === "tEXt" && length < 2048) {
      let s = "";
      for (let i = 0; i < length; i++) s += String.fromCharCode(bytes[offset + 8 + i]);
      meta.pngChunks!.push({ type: "tEXt-content", size: 0, text: s });
    }
    if (type === "eXIf" && length > 8) {
      // EXIF inside PNG
      const sub = buffer.slice(offset + 8, offset + 8 + length);
      const parsed = parseJpegMetadataLikeTiff(sub);
      meta.exif.push(...parsed.exif);
    }
    offset += 12 + length;
    if (type === "IEND") break;
  }
  return meta;
}

function parseJpegMetadataLikeTiff(buffer: ArrayBuffer): ImageMetadata {
  const view = new DataView(buffer);
  const meta: ImageMetadata = { format: "EXIF", exif: [], hasGps: false, byteSize: buffer.byteLength };
  if (view.byteLength < 8) return meta;
  const little = view.getUint16(0) === 0x4949;
  const ifd0 = view.getUint32(4, little);
  const gps = { has: false };
  readExif(view, 0, ifd0, little, meta.exif, gps);
  meta.hasGps = gps.has;
  return meta;
}

/** Detect format from filename/mime and parse metadata accordingly. */
export async function readImageMetadata(file: File): Promise<ImageMetadata> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const ext = file.name.toLowerCase();
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return parsePngMetadata(buffer, file.size);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return parseJpegMetadata(buffer, file.size);
  if (ext.endsWith(".webp") || file.type === "image/webp") return { format: "WebP", exif: [], hasGps: false, byteSize: file.size };
  if (ext.endsWith(".gif") || file.type === "image/gif") return { format: "GIF", exif: [], hasGps: false, byteSize: file.size };
  return { format: file.type || "Unknown", exif: [], hasGps: false, byteSize: file.size };
}
