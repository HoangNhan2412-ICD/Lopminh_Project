"use client";

import { CalendarDays, ClipboardList, House } from "lucide-react";
import { Card, CardHeader, Chip } from "@/components/ui";
import { useVnClock } from "@/lib/hooks";
import { honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { capFirst } from "@/lib/text";
import { weekdayName } from "@/lib/time";

/** Chế độ "Ở nhà": gom mọi thứ về một bảng tổng quan cho buổi tối. */
export function HomeSummary() {
  const now = useVnClock(60_000);
  const { profile, classes, students, notes, timetable } = useApp();
  if (!now) return null;
  const h = honorificLower(profile);

  const tomorrow = (now.weekday + 1) % 7;
  const tomorrowPeriods = timetable[tomorrow] ?? [];
  const className = (id: string) => classes.find((c) => c.id === id)?.name ?? id;
  const studying = notes.filter((n) => n.kind === "hoc-tap");
  const nameOf = (id: string | null, raw: string) => students.find((s) => s.id === id)?.shortName ?? raw;

  return (
    <Card>
      <CardHeader
        icon={<House className="size-6" />}
        title={`Tổng quan cho ${h} ở nhà`}
        subtitle="Mọi thứ cần nhớ, gom lại một chỗ"
      />
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="rounded-xl bg-surface-muted p-4">
          <p className="flex items-center gap-2 font-semibold">
            <CalendarDays className="size-5 text-primary" aria-hidden /> {capFirst(weekdayName(tomorrow).toLocaleLowerCase("vi"))} có {tomorrowPeriods.length} tiết
          </p>
          <ul className="mt-2 space-y-1">
            {tomorrowPeriods.map((p) => (
              <li key={p.index}>
                Tiết {p.index} ({p.start}) — lớp {className(p.classId)}
              </li>
            ))}
            {tomorrowPeriods.length === 0 && <li className="text-ink-muted">Không có tiết nào, {h} nghỉ ngơi trọn vẹn nhé.</li>}
          </ul>
        </div>
        <div className="rounded-xl bg-surface-muted p-4">
          <p className="flex items-center gap-2 font-semibold">
            <ClipboardList className="size-5 text-primary" aria-hidden /> Em cần hỗ trợ việc học
          </p>
          <ul className="mt-2 space-y-1.5">
            {studying.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center gap-2">
                <Chip tone="accent">{className(n.classId)}</Chip>
                <span className="font-medium">{nameOf(n.studentId, n.rawName)}</span>
                <span className="text-ink-muted">— {n.text}</span>
              </li>
            ))}
            {studying.length === 0 && <li className="text-ink-muted">Chưa có em nào cần kèm thêm.</li>}
          </ul>
        </div>
      </div>
    </Card>
  );
}
