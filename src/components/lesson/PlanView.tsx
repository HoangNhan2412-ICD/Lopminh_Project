"use client";

import { Card, CardHeader } from "@/components/ui";
import { ACTIVITY_NAMES, type LessonPlan } from "@/lib/lesson/types";

/** Xem nhanh giáo án 5512 ngay trên web, trước khi tải file Word. */
export function PlanView({ plan }: { plan: LessonPlan }) {
  const block = (label: string, items: string[]) => (
    <div>
      <p className="font-semibold">{label}</p>
      <ul className="mt-1 list-disc space-y-1 pl-6">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="I. Mục tiêu" />
        <div className="grid gap-4 p-5 md:grid-cols-3">
          {block("Kiến thức", plan.objectives.kienThuc)}
          {block("Năng lực", plan.objectives.nangLuc)}
          {block("Phẩm chất", plan.objectives.phamChat)}
        </div>
      </Card>
      <Card>
        <CardHeader title="II. Thiết bị dạy học và học liệu" />
        <div className="p-5 pt-3">{block("", plan.materials)}</div>
      </Card>
      <Card>
        <CardHeader title="III. Tiến trình dạy học" subtitle={`Tổng ${plan.activities.reduce((n, a) => n + a.minutes, 0)} phút`} />
        <ol className="divide-y divide-border">
          {plan.activities.map((a) => (
            <li key={a.key} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-lg font-semibold">{ACTIVITY_NAMES[a.key]}</p>
                <span className="text-ink-muted">{a.minutes} phút</span>
              </div>
              <dl className="mt-2 grid gap-x-6 gap-y-2 md:grid-cols-[9rem_minmax(0,1fr)]">
                <dt className="text-ink-muted">Mục tiêu</dt>
                <dd>{a.goal}</dd>
                <dt className="text-ink-muted">Nội dung</dt>
                <dd>{a.content}</dd>
                {a.coBan && (
                  <>
                    <dt className="text-ink-muted">Tầng Cơ bản</dt>
                    <dd>{a.coBan}</dd>
                    <dt className="text-ink-muted">Tầng Nâng cao</dt>
                    <dd>{a.nangCao}</dd>
                  </>
                )}
                <dt className="text-ink-muted">Sản phẩm</dt>
                <dd>{a.product}</dd>
                <dt className="text-ink-muted">Tổ chức</dt>
                <dd>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>{a.steps.giao}</li>
                    <li>{a.steps.thucHien}</li>
                    <li>{a.steps.baoCao}</li>
                    <li>{a.steps.ketLuan}</li>
                  </ol>
                </dd>
              </dl>
            </li>
          ))}
        </ol>
      </Card>
      <Card>
        <CardHeader title="Phiếu học tập hai tầng" />
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {block("Cơ bản", plan.worksheet.coBan)}
          {block("Nâng cao", plan.worksheet.nangCao)}
        </div>
      </Card>
    </div>
  );
}
