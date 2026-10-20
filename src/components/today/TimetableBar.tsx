"use client";

import { House, Star } from "lucide-react";
import { Card, Chip } from "@/components/ui";
import { useVnClock } from "@/lib/hooks";
import { isTeachingHours, minutesLeft, periodState, periodsToday } from "@/lib/schedule";
import { useApp } from "@/lib/store/app-store";
import { cn } from "@/lib/text";
import { pad2, vnDateLabel } from "@/lib/time";

interface Props {
  selectedClassId: string | null;
  homeMode: boolean;
  onSelectClass: (classId: string) => void;
  onHome: () => void;
}

/** Đồng hồ GMT+7 + dải các tiết trong ngày. Bấm vào tiết để xem lớp đó. */
export function TimetableBar({ selectedClassId, homeMode, onSelectClass, onHome }: Props) {
  const now = useVnClock();
  const { timetable, classes } = useApp();

  if (!now) return <Card className="h-36 animate-pulse" aria-hidden />;

  const periods = periodsToday(timetable, now);
  const teaching = isTeachingHours(periods, now);
  const classOf = (id: string) => classes.find((c) => c.id === id);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tabular-nums tracking-tight text-primary" aria-label="Giờ hiện tại">
            {pad2(now.hh)}:{pad2(now.mm)}
            <span className="text-xl text-ink-muted">:{pad2(now.ss)}</span>
          </span>
          <span className="text-ink-muted">{vnDateLabel(now)}</span>
        </div>
        {teaching ? (
          <Chip tone="success">
            <span className="size-2 rounded-full bg-success" aria-hidden /> Đang trong giờ dạy
          </Chip>
        ) : (
          <Chip tone="neutral">
            <House className="size-4" aria-hidden /> Ngoài giờ dạy
          </Chip>
        )}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {periods.length === 0 && <p className="py-2 text-ink-muted">Hôm nay không có tiết nào trên thời khóa biểu.</p>}
        {periods.map((p) => {
          const state = periodState(p, now);
          const cls = classOf(p.classId);
          const selected = !homeMode && selectedClassId === p.classId;
          const homeroom = cls?.role === "chu-nhiem";
          return (
            <button
              key={p.index}
              onClick={() => onSelectClass(p.classId)}
              aria-pressed={selected}
              className={cn(
                "relative min-h-16 min-w-36 shrink-0 rounded-xl border px-3 py-2 text-left transition-colors",
                state === "dang-day" ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface hover:bg-surface-muted",
                state === "da-qua" && "text-ink-muted",
                selected && state !== "dang-day" && "ring-2 ring-primary",
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium opacity-90">
                Tiết {p.index} · {p.start}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-lg font-semibold">
                {homeroom && <Star className="size-4 fill-current" aria-label="Lớp chủ nhiệm" />}
                {cls?.name ?? p.classId}
              </span>
              {state === "dang-day" && (
                <span className="text-sm">Còn {minutesLeft(p, now)} phút</span>
              )}
            </button>
          );
        })}
        <button
          onClick={onHome}
          aria-pressed={homeMode}
          className={cn(
            "flex min-h-16 min-w-28 shrink-0 flex-col items-start justify-center rounded-xl border px-3 py-2",
            homeMode ? "border-primary bg-primary-soft text-primary" : "border-dashed border-border text-ink-muted hover:bg-surface-muted",
          )}
        >
          <House className="size-5" aria-hidden />
          <span className="font-semibold">Ở nhà</span>
        </button>
      </div>
    </Card>
  );
}
