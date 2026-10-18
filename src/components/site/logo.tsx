import { cn } from "@/lib/utils";

export function PixKitLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 drop-shadow-[0_0_6px_oklch(0.72_0.2_300/0.55)]" aria-hidden="true">
        <defs>
          <linearGradient id="pixkit-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#pixkit-grad)" />
        <path d="M9 22V10h6.2c2.9 0 4.8 1.8 4.8 4.4s-1.9 4.4-4.8 4.4H12.4V22H9zm3.4-5.9h2.4c1.2 0 2-.7 2-1.7s-.8-1.7-2-1.7h-2.4v3.4z" fill="#fff" />
        <rect x="21.5" y="18.5" width="4" height="4" rx="1" fill="#fff" opacity="0.95" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">
        Pix<span className="text-primary">Kit</span>App
      </span>
    </span>
  );
}
