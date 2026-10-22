"use client";

import { FileText, LoaderCircle, Presentation, QrCode, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, CardHeader, buttonCls } from "@/components/ui";
import { THEMES } from "@/lib/lesson/theme";
import type { LessonPlan, ThemeKey } from "@/lib/lesson/types";
import { addressOf, honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn, nfc } from "@/lib/text";

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function fileBase(plan: LessonPlan) {
  return nfc(`${plan.request.className}_${plan.title}`)
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

export function ExportPanel({
  plan,
  quizUrl,
  onQuizUrl,
  onTheme,
  onRedo,
  redoing,
}: {
  plan: LessonPlan;
  quizUrl: string | null;
  onQuizUrl: (u: string | null) => void;
  onTheme: (t: ThemeKey) => void;
  onRedo: (more: string) => void;
  redoing: boolean;
}) {
  const { profile, students } = useApp();
  const h = honorificLower(profile);
  const [progress, setProgress] = useState<{ step: string; pct: number } | null>(null);
  const [more, setMore] = useState("");

  async function exportPptx() {
    setProgress({ step: "Chuẩn bị hình minh họa", pct: 0.05 });
    try {
      const { buildPptx } = await import("@/lib/lesson/export-pptx");
      const blob = await buildPptx(plan, {
        quizUrl,
        teacherName: profile.fullName,
        onProgress: (step, pct) => setProgress({ step, pct }),
      });
      download(blob, `${fileBase(plan)}.pptx`);
      toast.success("Đã tải file PowerPoint");
    } catch {
      toast.error("Chưa dựng được file PowerPoint, mình thử lại nhé.");
    } finally {
      setProgress(null);
    }
  }

  async function exportDocx() {
    setProgress({ step: "Dựng giáo án Word theo mẫu 5512", pct: 0.4 });
    try {
      const { buildDocx } = await import("@/lib/lesson/export-docx");
      const blob = await buildDocx(plan, profile, students);
      download(blob, `GiaoAn_5512_${fileBase(plan)}.docx`);
      toast.success("Đã tải giáo án Word");
    } catch {
      toast.error("Chưa dựng được file Word, mình thử lại nhé.");
    } finally {
      setProgress(null);
    }
  }

  const validUrl = (u: string) => /^https?:\/\/\S+\.\S+/.test(u);

  return (
    <div className="space-y-5">
      <Card><div className="space-y-3 p-5"><p>Muốn thêm sơ đồ, đồ thị, phiếu hoặc nhiều loại file cùng lúc?</p><Link className={buttonCls("primary")} href="/xuong-hoc-lieu">Mở Xưởng học liệu</Link></div></Card>
      <Card>
        <CardHeader title="Màu slide" subtitle="Đổi là cả bản xem trước và file tải về đổi theo" />
        <div className="grid gap-2 p-5 sm:grid-cols-3">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.key}
              onClick={() => onTheme(t.key)}
              aria-pressed={plan.theme === t.key}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-xl border px-3 text-left font-medium",
                plan.theme === t.key ? "border-primary ring-2 ring-primary" : "border-border hover:bg-surface-muted",
              )}
            >
              {/* Mẫu màu lấy từ dữ liệu theme của slide, không phải màu giao diện */}
              <span className="flex h-8 w-12 overflow-hidden rounded-md border border-border" aria-hidden>
                <span className="w-2/3" style={{ background: `#${t.bg}` }} />
                <span className="w-1/3" style={{ background: `#${t.accent}` }} />
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<QrCode className="size-6" />} title="Mã QR trên slide" subtitle="Dán link phòng Wayground, Kahoot hay Quizlet, mã QR tự in lên slide" />
        <div className="space-y-3 p-5">
          <input
            className={inputCls}
            defaultValue={quizUrl ?? ""}
            placeholder="https://wayground.com/join?gc=…"
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (!v) onQuizUrl(null);
              else if (validUrl(v)) onQuizUrl(v);
              else toast.error("Link chưa đúng, link phải bắt đầu bằng https://");
            }}
          />
          <Link href={`/phong-quiz?bai=${plan.id}`} className={buttonCls("secondary", "sm")}>
            <QrCode className="size-4" aria-hidden /> Tạo file quiz từ bài này
          </Link>
        </div>
      </Card>

      <Card>
        <CardHeader title="Tải về" subtitle={`File mang tên ${addressOf(profile)}, mở được bằng PowerPoint, Google Slides, Word`} />
        <div className="space-y-3 p-5">
          <Button className="w-full" onClick={exportPptx} disabled={!!progress}>
            <Presentation className="size-5" aria-hidden /> Bài giảng PowerPoint ({plan.slides.length} slide)
          </Button>
          <Button variant="secondary" className="w-full" onClick={exportDocx} disabled={!!progress}>
            <FileText className="size-5" aria-hidden /> Giáo án Word mẫu 5512
          </Button>
          {progress && (
            <div role="status" className="rounded-xl bg-surface-muted p-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <LoaderCircle className="size-4 animate-spin" aria-hidden /> {progress.step}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(progress.pct * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<RefreshCw className="size-6" />} title="Soạn lại cả bộ" subtitle={`Chưa ưng? ${capFirst(h)} nói thêm, Bé Bảng soạn lại từ đầu`} />
        <div className="space-y-3 p-5">
          <textarea
            rows={3}
            className={inputCls}
            value={more}
            onChange={(e) => setMore(nfc(e.target.value))}
            placeholder="Ví dụ: thêm một trò chơi ghép đôi, phần luyện tập ngắn lại, dùng ví dụ về mùa lũ miền Trung"
          />
          <Button variant="secondary" className="w-full" disabled={redoing || !more.trim()} onClick={() => onRedo(nfc(more.trim()))}>
            {redoing ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <RefreshCw className="size-5" aria-hidden />}
            {redoing ? "Đang soạn lại…" : "Soạn lại với yêu cầu này"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
