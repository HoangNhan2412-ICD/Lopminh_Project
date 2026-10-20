"use client";

import { useEffect, useState } from "react";
import { ClassBoard } from "@/components/today/ClassBoard";
import { HomeSummary } from "@/components/today/HomeSummary";
import { QuickNoteInput } from "@/components/today/QuickNoteInput";
import { TodayBoard } from "@/components/today/TodayBoard";
import { Chip } from "@/components/ui";
import { currentPeriod, isTeachingHours, periodsToday } from "@/lib/schedule";
import { useApp } from "@/lib/store/app-store";
import { vnNow } from "@/lib/time";

export function TodayView() {
  const { classes, timetable } = useApp();
  const homeroom = classes.find((c) => c.role === "chu-nhiem") ?? classes[0];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [homeMode, setHomeMode] = useState(false);

  // Mở trang: nếu đang có tiết thì chọn lớp đang dạy, ngoài giờ thì vào chế độ Ở nhà.
  useEffect(() => {
    const now = vnNow();
    const periods = periodsToday(timetable, now);
    const live = currentPeriod(periods, now);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- giờ hiện tại chỉ biết được ở trình duyệt
    setSelectedId(live?.classId ?? homeroom?.id ?? null);
    setHomeMode(!isTeachingHours(periods, now) && now.hh >= 12);
  }, [timetable, homeroom?.id]);

  const selected = classes.find((c) => c.id === selectedId) ?? homeroom;

  return (
    <div className="space-y-5">
      <h1 className="sr-only">Lớp Mình Hôm Nay</h1>
      <TodayBoard
        selectedClassId={selected?.id ?? null}
        homeMode={homeMode}
        onSelectClass={(id) => {
          setSelectedId(id);
          setHomeMode(false);
        }}
        onHome={() => setHomeMode(true)}
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chọn lớp">
        {classes.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={!homeMode && selected?.id === c.id}
            onClick={() => {
              setSelectedId(c.id);
              setHomeMode(false);
            }}
            className="min-h-11 rounded-full"
          >
            <Chip
              tone={!homeMode && selected?.id === c.id ? "primary" : "neutral"}
              className="min-h-11 px-4 text-base"
            >
              {c.role === "chu-nhiem" ? "★ " : ""}
              {c.name}
              <span className="text-sm font-normal opacity-80">{c.role === "chu-nhiem" ? "Chủ nhiệm" : "Bộ môn"}</span>
            </Chip>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {homeMode ? <HomeSummary /> : selected && <ClassBoard cls={selected} />}
        </div>
        <div className="space-y-5">
          {selected && <QuickNoteInput key={selected.id} cls={selected} />}
        </div>
      </div>
    </div>
  );
}
