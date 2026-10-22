"use client";
import { useEffect } from "react";
import { useLocal } from "@/lib/local-store";
import { useVnClock } from "@/lib/hooks";
import { useApp } from "@/lib/store/app-store";
import { DARK_HOUR, LIGHT_HOUR, themeAtHour, themeChoice, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/text";

function useThemeChoice() {
  const { profile, ready, updateProfile } = useApp();
  const [stored, setStored] = useLocal<ThemeChoice>("lm:theme", "auto");
  const clock = useVnClock();
  const choice = themeChoice(profile.theme ?? stored);
  return { ready, choice, hour: clock?.hh, select: (value: ThemeChoice) => { setStored(value); updateProfile({ theme: value }); } };
}
export function ThemeSync() {
  const { ready, choice, hour } = useThemeChoice();
  useEffect(() => {
    if (!ready || hour === undefined) return;
    document.documentElement.dataset.theme = themeAtHour(choice, hour);
    // Cache riêng lựa chọn màu để lần mở sau không nháy; không chứa dữ liệu tài khoản.
    try { localStorage.setItem("lm:theme", JSON.stringify(choice)); } catch {}
  }, [ready, choice, hour]);
  return null;
}
export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { choice, hour, select } = useThemeChoice();
  const content = <><div role="radiogroup" aria-label="Giao diện sáng tối" className="flex flex-wrap gap-2">
    {([ ["light", "Sáng"], ["dark", "Tối"], ["auto", "Tự động theo giờ"] ] as const).map(([value, label]) => <button key={value} type="button" role="radio" aria-checked={choice === value} onClick={() => select(value)} className={cn("min-h-11 min-w-11 rounded-xl border px-3 py-2", choice === value ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-ink")}>{label}</button>)}
  </div>{choice === "auto" && <p className="mt-2 text-sm text-ink-muted">{hour === undefined ? "Theo giờ Việt Nam" : hour >= DARK_HOUR ? `Đang tối vì đã sau ${DARK_HOUR} giờ` : hour < LIGHT_HOUR ? `Đang tối vì chưa đến ${LIGHT_HOUR} giờ` : `Đang sáng từ ${LIGHT_HOUR} đến trước ${DARK_HOUR} giờ`} · Việt Nam</p>}</>;
  if (!compact) return <section className="space-y-3 rounded-xl border border-border bg-surface p-5"><h2 className="text-xl font-semibold">Giao diện</h2>{content}</section>;
  return <details data-tour="theme" className="relative"><summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-surface px-2 text-sm" aria-label="Chọn giao diện sáng tối">Màu</summary><div className="absolute right-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">{content}</div></details>;
}
