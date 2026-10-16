"use client";

/**
 * Responsive, AdSense-ready ad container.
 *
 * - When ads are NOT configured (default): renders NOTHING — no empty
 *   labeled box is shown to visitors.
 * - When configured via env (see src/lib/ads.ts): renders a responsive
 *   <ins class="adsbygoogle"> unit inside a container with a fixed min-height
 *   reserved up front, so the unit filling in later causes no layout shift
 *   (CLS stays at zero). Loads the AdSense script once.
 *
 * Ads never overlap controls: this component is a block-level element placed
 * in normal flow between content sections.
 */

import { useEffect, useRef } from "react";
import Script from "next/script";
import { ADS_CONFIG, AD_SLOT_IDS, type AdSlotId } from "@/lib/ads";
import { cn } from "@/lib/utils";

const MIN_H: Record<AdSlotId, string> = {
  // ~100px leaderboard on mobile, 110px from sm up (typical responsive banner)
  top: "min-h-[100px] sm:min-h-[110px]",
  // In-article responsive unit: ~250px mobile, ~280px desktop
  "in-content": "min-h-[250px] sm:min-h-[280px]",
  "pre-footer": "min-h-[100px] sm:min-h-[110px]",
};

// Unique landmark names: two complementary landmarks with the same label
// fail axe's landmark-unique rule (top + pre-footer slots render together).
const LANDMARK_LABEL: Record<AdSlotId, string> = {
  top: "Advertisement space (top)",
  "in-content": "Advertisement space (in content)",
  "pre-footer": "Advertisement space (bottom)",
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ id, className }: { id: AdSlotId; className?: string }) {
  const pushed = useRef(false);

  const client = ADS_CONFIG.client;
  const slotId = AD_SLOT_IDS[id];
  const live = ADS_CONFIG.enabled && client !== "";

  useEffect(() => {
    if (!live || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not ready yet — it will fill the unit when it loads.
    }
  }, [live]);

  if (!live) {
    // No ad configured → collapse entirely. Visitors never see an empty
    // "Advertisement" box, and nothing third-party is loaded.
    return null;
  }

  return (
    <div
      role="complementary"
      aria-label={LANDMARK_LABEL[id]}
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)}
    >
      <div className={cn("flex items-center justify-center overflow-hidden", MIN_H[id])}>
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slotId || undefined}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      {/* Load the AdSense library once, after interactive, only when configured. */}
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      />
    </div>
  );
}
