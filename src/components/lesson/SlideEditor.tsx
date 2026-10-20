"use client";

import { ArrowDown, ArrowUp, Copy, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SlideCanvas } from "@/components/lesson/SlideCanvas";
import { Button } from "@/components/ui";
import { THEMES } from "@/lib/lesson/theme";
import { LAYOUT_LABEL, SLIDE_LAYOUTS, type LessonPlan, type Slide, type SlideLayout } from "@/lib/lesson/types";
import { honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn, nfc } from "@/lib/text";

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none";

const lines = (s: string) =>
  s
    .split("\n")
    .map((x) => nfc(x.trim()))
    .filter(Boolean);

/** Sửa một slide: sửa tay từng ô, hoặc nhờ Bé Bảng làm lại với yêu cầu thêm. */
export function SlideEditor({
  plan,
  index,
  quizUrl,
  onChange,
  onMove,
  onDelete,
}: {
  plan: LessonPlan;
  index: number;
  quizUrl: string | null;
  onChange: (s: Slide) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const { profile } = useApp();
  const h = honorificLower(profile);
  const slide = plan.slides[index];
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);

  async function redo() {
    if (!instruction.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/lesson/slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          lessonTitle: plan.title,
          subject: plan.request.subject,
          grade: plan.request.grade,
          slide,
          outline: plan.slides.map((s) => s.title),
          instruction: nfc(instruction.trim()),
        }),
      });
      const data = (await res.json()) as { slide?: Slide; error?: string };
      if (!res.ok || !data.slide) throw new Error(data.error ?? "Không sửa được slide.");
      onChange(data.slide);
      setInstruction("");
      toast.success("Bé Bảng đã làm lại slide này");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const set = (patch: Partial<Slide>) => onChange({ ...slide, ...patch });

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg border border-border shadow-[var(--shadow-card)]">
          <SlideCanvas slide={slide} theme={THEMES[plan.theme]} index={index} total={plan.slides.length} lessonTitle={plan.title} quizUrl={quizUrl} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onMove(-1)} disabled={index === 0}>
            <ArrowUp className="size-4" aria-hidden /> Lên trước
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onMove(1)} disabled={index === plan.slides.length - 1}>
            <ArrowDown className="size-4" aria-hidden /> Xuống sau
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="ml-auto text-urgent hover:bg-urgent-soft">
            <Trash2 className="size-4" aria-hidden /> Bỏ slide
          </Button>
        </div>
        {slide.notes && (
          <div className="rounded-xl bg-surface-muted p-4">
            <p className="text-sm font-semibold text-ink-muted">Lời giảng gợi ý (nằm trong ghi chú trình chiếu)</p>
            <p className="mt-1 leading-relaxed">{slide.notes}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <label className="block font-semibold" htmlFor="redo">
            Nhờ Bé Bảng làm lại slide này
          </label>
          <textarea
            id="redo"
            rows={2}
            className={cn(inputCls, "mt-2")}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Ví dụ: thêm ví dụ tính tiền đi chợ, đổi sang dạng so sánh, bớt chữ"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {["Bớt chữ, thêm hình", "Thêm ví dụ đời sống", "Đổi thành trò chơi", "Dễ hơn cho nhóm Cơ bản"].map((q) => (
              <button key={q} onClick={() => setInstruction(q)} className="min-h-11 rounded-full border border-border px-3 text-sm hover:bg-surface-muted">
                {q}
              </button>
            ))}
          </div>
          <Button className="mt-3 w-full" onClick={redo} disabled={busy || !instruction.trim()}>
            {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <RefreshCw className="size-5" aria-hidden />}
            {busy ? "Đang làm lại…" : "Làm lại slide"}
          </Button>
        </div>

        <details className="rounded-xl border border-border bg-surface p-4" open>
          <summary className="cursor-pointer font-semibold">Sửa tay</summary>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-sm text-ink-muted">Kiểu slide</span>
              <select className={cn(inputCls, "mt-1 min-h-11")} value={slide.layout} onChange={(e) => set({ layout: e.target.value as SlideLayout })}>
                {SLIDE_LAYOUTS.map((l) => (
                  <option key={l} value={l}>
                    {LAYOUT_LABEL[l]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-ink-muted">Tiêu đề</span>
              <input key={`t-${slide.id}`} className={cn(inputCls, "mt-1")} defaultValue={slide.title} onBlur={(e) => set({ title: nfc(e.target.value) })} />
            </label>
            {slide.layout === "trac-nghiem" && slide.question ? (
              <div className="space-y-2">
                <input
                  key={`q-${slide.id}`}
                  className={inputCls}
                  defaultValue={slide.question.q}
                  onBlur={(e) => set({ question: { ...slide.question!, q: nfc(e.target.value) } })}
                />
                {slide.question.options.map((o, i) => (
                  <div key={`${slide.id}-o${i}`} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`ans-${slide.id}`}
                      className="size-5"
                      checked={slide.question!.answer === i}
                      onChange={() => set({ question: { ...slide.question!, answer: i } })}
                      aria-label={`Đáp án đúng là ${"ABCD"[i]}`}
                    />
                    <input
                      className={inputCls}
                      defaultValue={o}
                      onBlur={(e) => {
                        const options = [...slide.question!.options];
                        options[i] = nfc(e.target.value);
                        set({ question: { ...slide.question!, options } });
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : slide.layout === "so-sanh" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <textarea key={`l-${slide.id}`} rows={4} className={inputCls} defaultValue={[slide.leftTitle, ...(slide.left ?? [])].join("\n")} onBlur={(e) => { const [head, ...rest] = lines(e.target.value); set({ leftTitle: head, left: rest }); }} />
                <textarea key={`r-${slide.id}`} rows={4} className={inputCls} defaultValue={[slide.rightTitle, ...(slide.right ?? [])].join("\n")} onBlur={(e) => { const [head, ...rest] = lines(e.target.value); set({ rightTitle: head, right: rest }); }} />
                <p className="text-sm text-ink-muted sm:col-span-2">Dòng đầu là tiêu đề mỗi bên, các dòng sau là ý.</p>
              </div>
            ) : (
              <>
                {(slide.layout === "noi-bat" || slide.layout === "cong-thuc") && (
                  <label className="block">
                    <span className="text-sm text-ink-muted">{slide.layout === "cong-thuc" ? "Công thức" : "Ý nổi bật"}</span>
                    <input key={`h-${slide.id}`} className={cn(inputCls, "mt-1")} defaultValue={slide.highlight ?? ""} onBlur={(e) => set({ highlight: nfc(e.target.value) })} />
                  </label>
                )}
                <label className="block">
                  <span className="text-sm text-ink-muted">Các ý, mỗi dòng một ý (tối đa 5)</span>
                  <textarea key={`b-${slide.id}`} rows={5} className={cn(inputCls, "mt-1")} defaultValue={slide.bullets.join("\n")} onBlur={(e) => set({ bullets: lines(e.target.value).slice(0, 6) })} />
                </label>
              </>
            )}
            <label className="block">
              <span className="text-sm text-ink-muted">Lời giảng</span>
              <textarea key={`n-${slide.id}`} rows={3} className={cn(inputCls, "mt-1")} defaultValue={slide.notes} onBlur={(e) => set({ notes: nfc(e.target.value) })} />
            </label>
          </div>
        </details>

        {slide.imagePrompt && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="font-semibold">Gợi ý tạo hình cho slide này</p>
            <p className="mt-1 text-ink-muted">{slide.imagePrompt}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => {
                navigator.clipboard.writeText(slide.imagePrompt).then(
                  () => toast.success(`Đã chép. ${capFirst(h)} dán vào Canva (Magic Media) hoặc Google Slides (Giúp tôi minh họa) nhé.`),
                  () => toast.error("Trình duyệt chưa cho chép, mình bôi đen rồi chép tay nhé."),
                );
              }}
            >
              <Copy className="size-4" aria-hidden /> Chép câu lệnh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
