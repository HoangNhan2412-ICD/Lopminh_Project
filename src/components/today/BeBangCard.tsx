"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import { BeBangAvatar } from "@/components/BeBangAvatar";
import { Button, Card } from "@/components/ui";
import { useVnClock } from "@/lib/hooks";
import { greetingLines } from "@/lib/persona/greetings";
import { honorificLower } from "@/lib/persona/honorific";
import { currentPeriod, nextPeriod, periodsToday } from "@/lib/schedule";
import { useApp } from "@/lib/store/app-store";
import { speakVi } from "@/lib/speech";

export function BeBangCard() {
  const now = useVnClock(30_000);
  const { profile, classes, students, notes, timetable } = useApp();
  const [eveningChoice, setEveningChoice] = useState<"nhanh" | "thong-tha" | null>(null);

  if (!now) return <Card className="h-40 animate-pulse" aria-hidden />;

  const periods = periodsToday(timetable, now);
  const { title, body } = greetingLines({
    profile,
    hour: now.hh,
    classes,
    students,
    notes,
    next: nextPeriod(periods, now),
    live: currentPeriod(periods, now),
  });
  const h = honorificLower(profile);
  const evening = now.hh >= 18;

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-5">
        <BeBangAvatar size={64} />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold leading-snug">{title}</p>
          <p className="mt-1.5 text-ink-muted">{body}</p>
          <Button variant="ghost" size="sm" className="-ml-3 mt-2" onClick={() => speakVi(`${title} ${body}`)}>
            <Volume2 className="size-5" aria-hidden /> Đọc to
          </Button>
        </div>
      </div>

      {evening && eveningChoice === null && (
        <div className="border-t border-border bg-accent-soft px-5 py-4">
          <p className="font-medium">
            Tối rồi, {h} muốn làm nhanh cho xong để nghỉ sớm, hay thong thả xem lại và chỉnh thêm ạ?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setEveningChoice("nhanh")}>Làm nhanh rồi nghỉ</Button>
            <Button size="sm" variant="secondary" onClick={() => setEveningChoice("thong-tha")}>Thong thả xem lại</Button>
          </div>
        </div>
      )}
      {eveningChoice === "nhanh" && (
        <p className="border-t border-border bg-accent-soft px-5 py-3 text-sm">
          Dạ, em sẽ chỉ hiện những việc cần làm ngay. Xong là {h} tắt máy nghỉ nhé.
        </p>
      )}
    </Card>
  );
}
