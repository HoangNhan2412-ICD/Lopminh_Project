"use client";

import { CloudRain, Flame, Leaf, Sun } from "lucide-react";
import { useApp } from "@/lib/store/app-store";
import { honorificLower } from "@/lib/persona/honorific";
import { capFirst, cn } from "@/lib/text";
import type { LoadLevel } from "@/lib/types";

export const LOAD_OPTIONS: { value: LoadLevel; label: string; hint: string; icon: typeof Sun; cls: string }[] = [
  { value: "thu-thai", label: "Thư thái", hint: "Sẵn sàng sáng tạo", icon: Leaf, cls: "text-success" },
  { value: "on-dinh", label: "Ổn định", hint: "Mọi việc bình thường", icon: Sun, cls: "text-homeroom" },
  { value: "cang-thang", label: "Căng thẳng", hint: "Nhiều áp lực", icon: CloudRain, cls: "text-subject" },
  { value: "qua-tai", label: "Quá tải", hint: "Cần nghỉ ngơi ngay", icon: Flame, cls: "text-urgent" },
];

export function LoadPicker({ compact = false }: { compact?: boolean }) {
  const { profile, load, setLoad } = useApp();
  const h = honorificLower(profile);
  return (
    <fieldset>
      <legend className="font-semibold">Hôm nay {h} thấy thế nào?</legend>
      <div className={cn("mt-3 grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
        {LOAD_OPTIONS.map((o) => {
          const Icon = o.icon;
          const active = load === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => setLoad(active ? null : o.value)}
              className={cn(
                "flex min-h-20 flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
                active ? "border-primary bg-primary-soft" : "border-border bg-surface hover:bg-surface-muted",
              )}
            >
              <Icon className={cn("size-6", o.cls)} aria-hidden />
              <span className="font-semibold">{o.label}</span>
              <span className="text-sm text-ink-muted">{o.hint}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-ink-muted">{capFirst(h)} chọn để Bé Bảng hiểu hơn. Chỉ mình {h} thấy mục này.</p>
    </fieldset>
  );
}
