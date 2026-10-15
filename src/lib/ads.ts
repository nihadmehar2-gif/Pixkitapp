/**
 * Advertising configuration — deliberately conservative and env-driven.
 *
 * No publisher ID is hardcoded. To enable AdSense after account approval:
 *   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *   NEXT_PUBLIC_ADSENSE_ENABLED=true
 *   NEXT_PUBLIC_ADSENSE_SLOT_TOP=1234567890        (optional per-slot IDs)
 *   NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT=1234567890
 *   NEXT_PUBLIC_ADSENSE_SLOT_PREFOOTER=1234567890
 *
 * While disabled, ad containers render as clearly-labeled reserved space
 * (no third-party scripts are loaded), so layout stays stable before and
 * after ads are switched on.
 */

function env(name: string): string {
  // Access guarded so importing this module never crashes at build time.
  try {
    return (typeof process !== "undefined" && process.env?.[name]) || "";
  } catch {
    return "";
  }
}

const client = env("NEXT_PUBLIC_ADSENSE_CLIENT");
const enabled = env("NEXT_PUBLIC_ADSENSE_ENABLED") === "true" && client.startsWith("ca-pub-");

export const ADS_CONFIG = {
  /** True only when a publisher ID and explicit opt-in are provided. */
  enabled,
  /** AdSense publisher ID, e.g. "ca-pub-1234567890123456". Empty when unset. */
  client,
} as const;

export type AdSlotId = "top" | "in-content" | "pre-footer";

/** Per-slot ad-unit IDs. Empty string means the slot renders reserved space only. */
export const AD_SLOT_IDS: Record<AdSlotId, string> = {
  top: env("NEXT_PUBLIC_ADSENSE_SLOT_TOP"),
  "in-content": env("NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT"),
  "pre-footer": env("NEXT_PUBLIC_ADSENSE_SLOT_PREFOOTER"),
};
