"use client";

import { Award, Check, Palette, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BeBangAvatar } from "@/components/BeBangAvatar";
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

export function ProfileView() {
  const { profile, updateProfile, resetDemo } = useApp();
  const h = honorificLower(profile);

  return (
    <div className="space-y-5">
      {/* Bìa + danh tính */}
      <Card className="overflow-hidden">
        <div className="relative h-36 bg-personal sm:h-44">
          <svg className="absolute inset-0 size-full opacity-[0.13]" aria-hidden>
            <defs>
              <pattern id="phan" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
                <path d="M4 12h22M8 30h12M30 40h10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="38" cy="10" r="2" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#phan)" />
          </svg>
          <div className="absolute bottom-3 right-4 flex items-center gap-2 rounded-full bg-black/25 px-3 py-1 text-sm text-white">
            <BeBangAvatar size={22} /> Hồ sơ thấu hiểu bản thân
          </div>
        </div>
        <div className="px-5 pb-5 sm:px-7">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <span className="flex size-24 items-center justify-center rounded-full border-4 border-surface bg-primary text-3xl font-bold text-primary-fg ring-4 ring-personal">
              {profile.callName
                .split(/\s+/)
                .map((w) => w[0])
                .join("")}
            </span>
            <div className="pb-1">
              <h1 className="text-2xl font-bold sm:text-3xl">{addressOf(profile)}</h1>
              <p className="text-ink-muted">{profile.fullName}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip tone="primary">{profile.yearsTeaching} năm đứng lớp</Chip>
            <Chip>{profile.subject}</Chip>
            <Chip>{profile.team}</Chip>
            <Chip>{profile.school}</Chip>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Phong cách */}
        <Card>
          <CardHeader icon={<Sparkles className="size-6" />} title={`Phong cách của ${addressOf(profile)}`} />
          <div className="p-5 pt-3">
            <blockquote className="border-l-4 border-personal pl-4 text-lg leading-relaxed">
              {profile.teachingStyle.summary}
            </blockquote>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.teachingStyle.tags.map((t) => (
                <Chip key={t} tone="accent">{t}</Chip>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-muted">Bé Bảng soạn giáo án và gợi ý hoạt động theo đúng phong cách này.</p>
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

      <div className="flex justify-end">
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
      </div>
    </div>
  );
}
