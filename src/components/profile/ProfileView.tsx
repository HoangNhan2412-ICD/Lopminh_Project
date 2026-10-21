"use client";
import { useAccount } from "@/components/account/AccountProvider";

import { Award, Check, Palette, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LoadPicker } from "@/components/sanctuary/LoadPicker";
import { Button, Card, CardHeader, Chip } from "@/components/ui";
import { addressOf, getHonorific, honorificFor, honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { cn } from "@/lib/text";
import type { AccentKey, Kpi } from "@/lib/types";

const ACCENTS: { key: AccentKey; label: string; swatch: string }[] = [
  { key: "bang", label: "Xanh bảng", swatch: "bg-sw-bang" },
  { key: "phan", label: "Vàng phấn", swatch: "bg-sw-phan" },
  { key: "sen", label: "Hồng sen", swatch: "bg-sw-sen" },
  { key: "troi", label: "Xanh trời", swatch: "bg-sw-troi" },
  { key: "la", label: "Xanh lá", swatch: "bg-sw-la" },
];

function Ring({ kpi }: { kpi: Kpi }) {
  const pct = Math.min(100, Math.round((kpi.current / kpi.target) * 100));
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 72 72" className="size-20 shrink-0 -rotate-90" aria-hidden>
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--surface-muted)" strokeWidth="8" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--personal)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
      </svg>
      <div>
        <p className="font-semibold leading-snug">{kpi.title}</p>
        <p className="text-ink-muted">
          <span className="text-xl font-bold text-ink">
            {kpi.current}
            {kpi.unit === "%" ? "%" : ` ${kpi.unit}`}
          </span>{" "}
          / mục tiêu {kpi.target}
          {kpi.unit === "%" ? "%" : ` ${kpi.unit}`}
        </p>
        {kpi.note && <p className="text-sm text-ink-muted">{kpi.note}</p>}
      </div>
    </div>
  );
}

const STYLE_TAGS = [
  "Bao dung",
  "Chậm mà chắc",
  "Dạy bằng hình ảnh",
  "Nghiêm khắc",
  "Hài hước",
  "Hay đặt câu hỏi",
  "Thích trò chơi",
  "Học qua dự án",
  "Gần gũi phụ huynh",
];

export function ProfileView() {
  const { profile, updateProfile, resetDemo } = useApp();
  const { userId } = useAccount();
  const h = honorificLower(profile);

  return (
    <div className="space-y-5">
      {/* Bìa + danh tính: tấm bảng mang màu riêng, viết câu phong cách bằng "phấn" */}
      <Card className="overflow-hidden">
        <div className="chalkboard chalkboard-personal relative px-5 pb-16 pt-7 sm:px-8 sm:pb-20 sm:pt-9">
          <p className="max-w-2xl text-2xl font-semibold leading-snug text-chalk sm:text-[1.9rem]">
            “{profile.teachingStyle.summary}”
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.teachingStyle.tags.map((t) => (
              <span key={t} className="rounded-full border border-chalk/40 px-3 py-0.5 text-sm text-chalk/90">
                {t}
              </span>
            ))}
          </div>
          <div className="chalk-tray" aria-hidden />
        </div>
        <div className="relative px-5 pb-5 sm:px-8">
          <div className="flex flex-wrap items-start gap-4">
            <span className="relative -mt-12 flex size-24 items-center justify-center rounded-full border-4 border-surface bg-personal text-3xl font-bold text-primary-fg shadow-md">
              {profile.callName
                .split(/\s+/)
                .map((w) => w[0])
                .join("")}
            </span>
            <div className="pt-3">
              <h1 className="text-2xl font-bold sm:text-3xl">{addressOf(profile)}</h1>
              <p className="text-ink-muted">{profile.fullName}</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-4">
            <div>
              <dt className="text-sm text-ink-muted">Đứng lớp</dt>
              <dd className="text-lg font-semibold">{profile.yearsTeaching} năm</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Môn dạy</dt>
              <dd className="text-lg font-semibold">{profile.subject}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Tổ chuyên môn</dt>
              <dd className="text-lg font-semibold">{profile.team}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Trường</dt>
              <dd className="text-lg font-semibold">{profile.school}</dd>
            </div>
          </dl>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Phong cách: sửa được, Bé Bảng soạn bài theo đúng phong cách này */}
        <Card>
          <CardHeader
            icon={<Sparkles className="size-6" />}
            title="Phong cách dạy"
            subtitle="Bé Bảng soạn giáo án và gợi ý hoạt động theo đúng mục này"
          />
          <div className="space-y-4 p-5 pt-3">
            <label className="block">
              <span className="text-sm text-ink-muted">Một câu tả cách mình dạy</span>
              <textarea
                key={profile.id}
                defaultValue={profile.teachingStyle.summary}
                rows={3}
                onBlur={(e) => {
                  const summary = e.target.value.normalize("NFC").trim();
                  if (summary && summary !== profile.teachingStyle.summary) {
                    updateProfile({ teachingStyle: { ...profile.teachingStyle, summary } });
                    toast.success("Đã lưu phong cách dạy");
                  }
                }}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base leading-relaxed"
              />
            </label>
            <div>
              <p className="text-sm text-ink-muted">Chọn những chữ đúng với mình</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STYLE_TAGS.map((t) => {
                  const on = profile.teachingStyle.tags.includes(t);
                  return (
                    <button
                      key={t}
                      aria-pressed={on}
                      onClick={() =>
                        updateProfile({
                          teachingStyle: {
                            ...profile.teachingStyle,
                            tags: on ? profile.teachingStyle.tags.filter((x) => x !== t) : [...profile.teachingStyle.tags, t],
                          },
                        })
                      }
                      className={cn(
                        "min-h-11 rounded-full border px-4 text-sm font-medium",
                        on ? "border-personal bg-personal text-primary-fg" : "border-border bg-surface hover:bg-surface-muted",
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Xưng hô */}
        <Card>
          <CardHeader title="Bé Bảng nên gọi mình là" subtitle="Đổi ở đây là cả ứng dụng đổi theo ngay" />
          <div className="space-y-4 p-5 pt-3">
            <div role="radiogroup" aria-label="Danh xưng" className="grid grid-cols-2 gap-2">
              {(["nu", "nam"] as const).map((g) => {
                const active = profile.gender === g && !profile.honorificOverride;
                return (
                  <button
                    key={g}
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      updateProfile({ gender: g, honorificOverride: undefined });
                      toast.success(`Từ giờ Bé Bảng gọi là ${honorificFor(g)} ${profile.callName}.`);
                    }}
                    className={cn(
                      "flex min-h-14 items-center justify-center gap-2 rounded-xl border text-lg font-semibold",
                      active ? "border-primary bg-primary text-primary-fg" : "border-border hover:bg-surface-muted",
                    )}
                  >
                    {active && <Check className="size-5" aria-hidden />}
                    {honorificFor(g)}
                  </button>
                );
              })}
            </div>
            <label className="block text-sm font-medium">
              Tên gọi
              <input
                value={profile.callName}
                onChange={(e) => updateProfile({ callName: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-xl border border-border px-3 text-base focus:border-primary focus:outline-none"
              />
            </label>
            <p className="rounded-xl bg-surface-muted px-4 py-3">
              Bé Bảng sẽ nói: “Dạ, em chào <strong>{addressOf(profile)}</strong>, hôm nay {h} muốn em giúp gì ạ?”
            </p>
            <p className="text-sm text-ink-muted">Danh xưng hiện tại: {getHonorific(profile)}</p>
          </div>
        </Card>

        {/* KPI */}
        <Card>
          <CardHeader icon={<Award className="size-6" />} title="Chỉ tiêu năm học" subtitle="Bé Bảng nhắc việc dựa trên các mục này" />
          <div className="space-y-5 p-5 pt-4">
            {profile.kpis.map((k) => (
              <Ring key={k.id} kpi={k} />
            ))}
          </div>
        </Card>

        {/* Tâm trạng */}
        <Card className="p-5">
          <LoadPicker />
        </Card>

        {/* Sở thích */}
        <Card>
          <CardHeader title="Ngoài giờ lên lớp" subtitle={`Bé Bảng chỉ dùng cho góc giải trí khi ${h} muốn`} />
          <div className="flex flex-wrap gap-2 p-5 pt-3">
            {profile.interests.map((i) => (
              <Chip key={i} className="text-base">{i}</Chip>
            ))}
          </div>
        </Card>

        {/* Màu riêng */}
        <Card>
          <CardHeader icon={<Palette className="size-6" />} title="Màu riêng của mình" subtitle="Dùng cho ảnh bìa, vòng tiến độ và điểm nhấn" />
          <div role="radiogroup" aria-label="Màu riêng" className="flex flex-wrap gap-3 p-5 pt-3">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                role="radio"
                aria-checked={profile.accent === a.key}
                onClick={() => updateProfile({ accent: a.key })}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full",
                    a.swatch,
                    profile.accent === a.key && "ring-4 ring-accent ring-offset-2",
                  )}
                >
                  {profile.accent === a.key && <Check className="size-5 text-white" aria-hidden />}
                </span>
                <span className="text-sm">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {!userId && <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetDemo();
            toast.success("Đã đưa dữ liệu mẫu về ban đầu.");
          }}
        >
          Đặt lại dữ liệu mẫu
        </Button>
      </div>}
    </div>
  );
}
