"use client";

import { useApp, type FontScale } from "@/lib/store/app-store";
import { cn } from "@/lib/text";

const OPTIONS: { value: FontScale; label: string; cls: string }[] = [
  { value: "vua", label: "Chữ vừa", cls: "text-sm" },
  { value: "lon", label: "Chữ lớn", cls: "text-base" },
  { value: "rat-lon", label: "Chữ rất lớn", cls: "text-lg" },
];

/** Nút "Aa" ba mức cỡ chữ cho thầy cô mắt kém. */
export function FontScaleToggle() {
  const { fontScale, setFontScale } = useApp();
  return (
    <div data-tour="font" role="radiogroup" aria-label="Cỡ chữ" className="flex rounded-xl border border-border bg-surface p-0.5">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={fontScale === o.value}
          aria-label={o.label}
          title={o.label}
          onClick={() => setFontScale(o.value)}
          className={cn(
            "min-h-11 min-w-11 rounded-lg px-1.5 font-semibold",
            o.cls,
            fontScale === o.value ? "bg-primary text-primary-fg" : "text-ink-muted hover:bg-surface-muted",
          )}
        >
          Aa
        </button>
      ))}
    </div>
  );
}
