"use client";

import { House, Star, Volume2 } from "lucide-react";
import { useState } from "react";
import { BeBangAvatar } from "@/components/BeBangAvatar";
import { useVnClock } from "@/lib/hooks";
import { greetingLines } from "@/lib/persona/greetings";
import { honorificLower } from "@/lib/persona/honorific";
import { currentPeriod, isTeachingHours, minutesLeft, nextPeriod, periodState, periodsToday } from "@/lib/schedule";
import { speakVi } from "@/lib/speech";
import { useApp } from "@/lib/store/app-store";
import { cn } from "@/lib/text";
import { pad2, vnDateLabel } from "@/lib/time";

interface Props {
  selectedClassId: string | null;
  homeMode: boolean;
  onSelectClass: (classId: string) => void;
  onHome: () => void;
}

/**
 * Đầu trang Hôm Nay là một tấm bảng: đồng hồ, lời Bé Bảng và các tiết trong ngày
 * được "viết phấn" lên đó. Đây là điểm nhấn duy nhất của giao diện, phần còn lại giữ yên tĩnh.
 */
export function TodayBoard({ selectedClassId, homeMode, onSelectClass, onHome }: Props) {
  const now = useVnClock();
  const { profile, classes, students, notes, timetable } = useApp();
  const [eveningChoice, setEveningChoice] = useState<"nhanh" | "thong-tha" | null>(null);

  if (!now) return <div className="chalkboard h-72 animate-pulse rounded-[var(--radius-card)]" aria-hidden />;

  const periods = periodsToday(timetable, now);
  const teaching = isTeachingHours(periods, now);
  const live = currentPeriod(periods, now);
  const { title, body } = greetingLines({
    profile,
    hour: now.hh,
    classes,
    students,
    notes,
    next: nextPeriod(periods, now),
    live,
  });
  const h = honorificLower(profile);
  const classOf = (id: string) => classes.find((c) => c.id === id);

  return (
    <section data-tour="board" aria-label="Bảng hôm nay" className="chalkboard overflow-hidden rounded-[var(--radius-card)] pb-3 shadow-[var(--shadow-card)]">
      <div className="grid gap-6 px-5 pb-5 pt-5 sm:px-7 sm:pt-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-10">
        <div>
          <p className="font-semibold tabular-nums leading-none" aria-label="Giờ hiện tại">
            <span className="text-6xl tracking-tight sm:text-7xl">
              {pad2(now.hh)}:{pad2(now.mm)}
            </span>
            <span className="ml-1 text-2xl text-chalk/60">{pad2(now.ss)}</span>
          </p>
          <p className="mt-2 text-chalk/80">{vnDateLabel(now)}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-chalk/80">
            {teaching ? (
              <>
                <span className="size-2.5 rounded-full bg-accent" aria-hidden /> Đang trong giờ dạy
              </>
            ) : (
              <>
                <House className="size-4" aria-hidden /> Ngoài giờ dạy
              </>
            )}
          </p>
        </div>

        <div className="flex gap-4">
          <BeBangAvatar size={60} />
          <div className="min-w-0">
            <p className="text-xl font-semibold leading-snug sm:text-2xl">{title}</p>
            <p className="mt-2 max-w-[60ch] text-lg leading-relaxed text-chalk/85">{body}</p>
            <button
              onClick={() => speakVi(`${title} ${body}`)}
              className="-ml-2 mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 font-medium text-accent hover:bg-white/10"
            >
              <Volume2 className="size-5" aria-hidden /> Đọc to
            </button>
          </div>
        </div>
      </div>

      {/* Các tiết trong ngày: viết như dòng phấn trên bảng */}
      <div className="border-t border-dashed border-chalk/25 px-5 pt-4 sm:px-7">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {periods.length === 0 && <p className="py-2 text-chalk/75">Hôm nay không có tiết nào trên thời khóa biểu.</p>}
          {periods.map((p) => {
            const state = periodState(p, now);
            const cls = classOf(p.classId);
            const selected = !homeMode && selectedClassId === p.classId;
            return (
              <button
                key={p.index}
                onClick={() => onSelectClass(p.classId)}
                aria-pressed={selected}
                className={cn(
                  "min-h-16 min-w-36 shrink-0 rounded-xl border-2 px-3 py-2 text-left transition-colors",
                  state === "dang-day"
                    ? "border-accent bg-accent text-ink"
                    : selected
                      ? "border-chalk bg-white/10"
                      : "border-chalk/30 hover:border-chalk/60",
                  state === "da-qua" && !selected && "text-chalk/55",
                )}
              >
                <span className="block text-sm font-medium opacity-90">
                  Tiết {p.index}, {p.start}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-lg font-semibold">
                  {cls?.role === "chu-nhiem" && <Star className="size-4 fill-current" aria-label="Lớp chủ nhiệm" />}
                  {cls?.name ?? p.classId}
                </span>
                {state === "dang-day" && <span className="text-sm">Còn {minutesLeft(p, now)} phút</span>}
              </button>
            );
          })}
          <button
            onClick={onHome}
            aria-pressed={homeMode}
            className={cn(
              "flex min-h-16 min-w-28 shrink-0 flex-col items-start justify-center rounded-xl border-2 border-dashed px-3 py-2",
              homeMode ? "border-chalk bg-white/10" : "border-chalk/30 text-chalk/80 hover:border-chalk/60",
            )}
          >
            <House className="size-5" aria-hidden />
            <span className="font-semibold">Ở nhà</span>
          </button>
        </div>
      </div>

      {now.hh >= 18 && eveningChoice === null && (
        <div className="mx-5 mb-3 rounded-xl bg-white/10 px-4 py-3 sm:mx-7">
          <p className="font-medium">Tối rồi, {h} muốn làm nhanh cho xong để nghỉ sớm, hay thong thả xem lại và chỉnh thêm ạ?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setEveningChoice("nhanh")}
              className="min-h-11 rounded-xl bg-accent px-4 font-semibold text-ink"
            >
              Làm nhanh rồi nghỉ
            </button>
            <button
              onClick={() => setEveningChoice("thong-tha")}
              className="min-h-11 rounded-xl border border-chalk/40 px-4 font-semibold"
            >
              Thong thả xem lại
            </button>
          </div>
        </div>
      )}
      {eveningChoice === "nhanh" && (
        <p className="mx-5 mb-3 text-chalk/85 sm:mx-7">Dạ, em chỉ hiện những việc cần làm ngay. Xong là {h} tắt máy nghỉ nhé.</p>
      )}
      <div className="chalk-tray" aria-hidden />
    </section>
  );
}
