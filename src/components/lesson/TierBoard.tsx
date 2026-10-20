"use client";

import { ArrowLeftRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui";
import type { LessonPlan } from "@/lib/lesson/types";
import { honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { capFirst } from "@/lib/text";

/** Hai tầng Cơ bản / Nâng cao. Bấm vào tên một em để chuyển sang tầng kia. */
export function TierBoard({ plan, onChange }: { plan: LessonPlan; onChange: (tiers: LessonPlan["tiers"]) => void }) {
  const { profile, students, notes } = useApp();
  const h = honorificLower(profile);
  const roster = students.filter((s) => s.classId === plan.request.classId);
  const reason = (id: string) => notes.find((n) => n.studentId === id && (n.kind === "hoc-tap" || n.kind === "khen-thuong"))?.text;

  const move = (id: string, to: "coBan" | "nangCao") => {
    const from = to === "coBan" ? "nangCao" : "coBan";
    onChange({ ...plan.tiers, [from]: plan.tiers[from].filter((x) => x !== id), [to]: [...plan.tiers[to], id] } as LessonPlan["tiers"]);
  };

  const column = (key: "coBan" | "nangCao", label: string, desc: string, task?: string) => (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-lg font-semibold">{label}</p>
      <p className="text-sm text-ink-muted">{desc}</p>
      {task && <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-sm">{task}</p>}
      <ul className="mt-3 space-y-1.5">
        {plan.tiers[key].map((id) => {
          const s = roster.find((x) => x.id === id);
          if (!s) return null;
          const why = reason(id);
          return (
            <li key={id}>
              <button
                onClick={() => move(id, key === "coBan" ? "nangCao" : "coBan")}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-left hover:bg-surface-muted"
              >
                <span>
                  <span className="font-medium">{s.fullName}</span>
                  {why && <span className="block text-sm text-ink-muted">{why}</span>}
                </span>
                <ArrowLeftRight className="size-4 shrink-0 text-ink-muted" aria-label="Chuyển tầng" />
              </button>
            </li>
          );
        })}
        {plan.tiers[key].length === 0 && <li className="px-3 py-2 text-ink-muted">Chưa có em nào.</li>}
      </ul>
    </div>
  );

  const practice = plan.activities.find((a) => a.key === "luyen-tap");
  return (
    <Card>
      <CardHeader
        title="Phân hóa hai tầng"
        subtitle={`Bé Bảng xếp theo ghi chú và kết quả của lớp ${plan.request.className}. ${capFirst(h)} bấm vào tên để chuyển tầng, phiếu học tập và file Word sẽ đổi theo.`}
      />
      <div className="grid gap-4 p-5 md:grid-cols-2">
        {column("coBan", "Tầng Cơ bản", "Củng cố, làm theo mẫu", practice?.coBan)}
        {column("nangCao", "Tầng Nâng cao", "Nhiều bước, gắn thực tế", practice?.nangCao)}
      </div>
    </Card>
  );
}
