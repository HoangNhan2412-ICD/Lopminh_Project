"use client";

import { BookOpen, Check, ChevronLeft, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BeBangAvatar } from "@/components/BeBangAvatar";
import { ExportPanel } from "@/components/lesson/ExportPanel";
import { LessonForm } from "@/components/lesson/LessonForm";
import { PlanView } from "@/components/lesson/PlanView";
import { SlideCanvas } from "@/components/lesson/SlideCanvas";
import { SlideEditor } from "@/components/lesson/SlideEditor";
import { TierBoard } from "@/components/lesson/TierBoard";
import { Button, Card, Chip } from "@/components/ui";
import { newId, suggestTiers } from "@/lib/lesson/build";
import { classContext } from "@/lib/lesson/prompt";
import { useLessons, useQuizUrl } from "@/lib/lesson/store";
import { THEMES } from "@/lib/lesson/theme";
import type { LessonPlan, LessonPlanContent, LessonRequest, Slide } from "@/lib/lesson/types";
import { honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn } from "@/lib/text";

type Tab = "slide" | "giao-an" | "phan-hoa" | "xuat";
const TABS: { id: Tab; label: string }[] = [
  { id: "slide", label: "Slide" },
  { id: "giao-an", label: "Giáo án 5512" },
  { id: "phan-hoa", label: "Phân hóa" },
  { id: "xuat", label: "Xuất file" },
];

const STEPS = [
  { at: 0, label: "Đọc tình hình lớp và phong cách dạy" },
  { at: 6, label: "Soạn mục tiêu và bốn hoạt động 5512" },
  { at: 25, label: "Viết slide, lời giảng và gợi ý hình" },
  { at: 50, label: "Soạn câu hỏi trắc nghiệm và phiếu hai tầng" },
  { at: 75, label: "Kiểm tra slide: bớt chữ, tách slide dài" },
];

function Generating({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const secs = Math.max(0, Math.floor((now - startedAt) / 1000));
  const current = STEPS.reduce((idx, s, i) => (secs >= s.at ? i : idx), 0);
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <BeBangAvatar size={64} mood="nghi" />
        <div>
          <p className="text-xl font-semibold">Bé Bảng đang soạn bài</p>
          <p className="text-ink-muted">Đã {secs} giây. Thường mất 1–2 phút, làm kỹ để dùng được ngay trên lớp.</p>
        </div>
      </div>
      <ol className="mt-6 space-y-3" aria-live="polite">
        {STEPS.map((s, i) => (
          <li key={s.label} className={cn("flex items-center gap-3", i > current && "text-ink-muted")}>
            {i < current ? (
              <Check className="size-5 text-success" aria-label="Xong" />
            ) : i === current ? (
              <LoaderCircle className="size-5 animate-spin text-primary" aria-label="Đang làm" />
            ) : (
              <span className="size-5 rounded-full border-2 border-border" aria-hidden />
            )}
            {s.label}
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function LessonStudio({ initialLessonId }: { initialLessonId?: string }) {
  const { profile, students, notes } = useApp();
  const h = honorificLower(profile);
  const [lessons, setLessons] = useLessons(profile.id);
  const [view, setView] = useState<"list" | "new" | "busy" | string>(initialLessonId ?? "list");
  const [tab, setTab] = useState<Tab>("slide");
  const [slideIdx, setSlideIdx] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [redoing, setRedoing] = useState(false);

  const plan = lessons.find((l) => l.id === view) ?? null;
  const [quizUrl, setQuizUrl] = useQuizUrl(plan?.id ?? "none");
  const usedImages = useMemo(() => lessons.flatMap((l) => l.slides.map((s) => s.imagePrompt)).filter(Boolean), [lessons]);

  const save = (next: LessonPlan) =>
    setLessons((all) => [{ ...next, updatedAt: new Date().toISOString() }, ...all.filter((l) => l.id !== next.id)]);

  async function generate(r: LessonRequest, redo?: { base: LessonPlan; more: string }) {
    const roster = students.filter((s) => s.classId === r.classId);
    const classNotes = notes.filter((n) => n.classId === r.classId);
    const tiers = redo?.base.tiers ?? suggestTiers(roster, classNotes);
    if (redo) setRedoing(true);
    else {
      setStartedAt(Date.now());
      setView("busy");
    }
    try {
      const res = await fetch("/api/lesson/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: r,
          profile,
          context: classContext(roster, classNotes, tiers),
          redo: redo ? { previousTitle: redo.base.title, more: redo.more } : undefined,
          avoidImages: usedImages.slice(-30),
        }),
      });
      const data = (await res.json()) as { mode: LessonPlan["mode"]; plan?: LessonPlanContent; warning?: string; error?: string };
      if (!res.ok || !data.plan) throw new Error(data.error ?? "Chưa soạn được bài.");
      const now = new Date().toISOString();
      const lesson: LessonPlan = {
        ...data.plan,
        id: redo?.base.id ?? newId("bai"),
        request: r,
        theme: redo?.base.theme ?? "bang-xanh",
        tiers,
        createdAt: redo?.base.createdAt ?? now,
        updatedAt: now,
        mode: data.mode,
      };
      save(lesson);
      setView(lesson.id);
      setTab("slide");
      setSlideIdx(0);
      if (data.warning) toast.warning(data.warning);
      else if (data.mode === "demo")
        toast.info("Đang chạy chế độ demo nên đây là giáo án khung. Thêm khóa Gemini để Bé Bảng soạn nội dung thật.");
      else toast.success(`Xong rồi ${h} ơi, mời ${h} xem slide.`);
    } catch (e) {
      toast.error((e as Error).message);
      if (!redo) setView("new");
    } finally {
      setRedoing(false);
    }
  }

  /* ---------- Danh sách / tạo mới ---------- */
  if (view === "busy") return <Generating startedAt={startedAt} />;
  if (view === "new" || (!plan && lessons.length === 0)) {
    return (
      <div className="space-y-4">
        {lessons.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setView("list")}>
            <ChevronLeft className="size-5" aria-hidden /> Các bài đã soạn
          </Button>
        )}
        <h1 className="text-2xl font-bold">Soạn Bài</h1>
        <LessonForm busy={false} onSubmit={(r) => generate(r)} />
      </div>
    );
  }
  if (!plan) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Soạn Bài</h1>
          <Button onClick={() => setView("new")}>
            <Plus className="size-5" aria-hidden /> Soạn bài mới
          </Button>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lessons.map((l) => (
            <li key={l.id}>
              <Card className="overflow-hidden">
                <button className="block w-full text-left" onClick={() => { setView(l.id); setTab("slide"); setSlideIdx(0); }}>
                  <SlideCanvas slide={l.slides[0]} theme={THEMES[l.theme]} index={0} total={l.slides.length} lessonTitle={l.title} />
                  <div className="p-4">
                    <p className="font-semibold leading-snug">{l.title}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      Lớp {l.request.className}, {l.slides.length} slide, sửa lần cuối {new Date(l.updatedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </button>
                <div className="flex justify-end border-t border-border px-2 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-urgent hover:bg-urgent-soft"
                    onClick={() => {
                      setLessons((all) => all.filter((x) => x.id !== l.id));
                      toast.success("Đã xóa bài");
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden /> Xóa
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* ---------- Một giáo án ---------- */
  const setSlide = (i: number, s: Slide) => save({ ...plan, slides: plan.slides.map((x, j) => (j === i ? s : x)) });
  const moveSlide = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= plan.slides.length) return;
    const slides = [...plan.slides];
    [slides[i], slides[j]] = [slides[j], slides[i]];
    save({ ...plan, slides });
    setSlideIdx(j);
  };
  const deleteSlide = (i: number) => {
    if (plan.slides.length <= 2) return;
    save({ ...plan, slides: plan.slides.filter((_, j) => j !== i) });
    setSlideIdx(Math.max(0, i - 1));
  };
  const idx = Math.min(slideIdx, plan.slides.length - 1);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => setView("list")}>
        <ChevronLeft className="size-5" aria-hidden /> Các bài đã soạn
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{plan.title}</h1>
          <p className="mt-1 text-ink-muted">
            {plan.request.subject}, lớp {plan.request.className}, {plan.request.minutes} phút
          </p>
        </div>
        {plan.mode !== "ai" && <Chip tone="accent">Giáo án khung (chưa có Gemini)</Chip>}
      </div>

      <div role="tablist" aria-label="Phần của giáo án" className="flex gap-1 overflow-x-auto rounded-xl bg-surface-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-lg px-4 font-semibold",
              tab === t.id ? "bg-surface text-primary shadow-[var(--shadow-card)]" : "text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "slide" && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Danh sách slide">
            {plan.slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSlideIdx(i)}
                aria-current={i === idx}
                className={cn("w-40 shrink-0 overflow-hidden rounded-lg border-2", i === idx ? "border-primary" : "border-transparent hover:border-border")}
              >
                <SlideCanvas slide={s} theme={THEMES[plan.theme]} index={i} total={plan.slides.length} lessonTitle={plan.title} quizUrl={quizUrl} />
              </button>
            ))}
          </div>
          <SlideEditor
            key={plan.slides[idx].id}
            plan={plan}
            index={idx}
            quizUrl={quizUrl}
            onChange={(s) => setSlide(idx, s)}
            onMove={(d) => moveSlide(idx, d)}
            onDelete={() => deleteSlide(idx)}
          />
        </div>
      )}
      {tab === "giao-an" && <PlanView plan={plan} />}
      {tab === "phan-hoa" && <TierBoard plan={plan} onChange={(tiers) => save({ ...plan, tiers })} />}
      {tab === "xuat" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ExportPanel
            plan={plan}
            quizUrl={quizUrl}
            onQuizUrl={setQuizUrl}
            onTheme={(theme) => save({ ...plan, theme })}
            onRedo={(more) => generate(plan.request, { base: plan, more })}
            redoing={redoing}
          />
          <Card className="p-5">
            <p className="flex items-center gap-2 font-semibold">
              <BookOpen className="size-5 text-primary" aria-hidden /> Trong file có gì
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-ink-muted">
              <li>PowerPoint 16:9, chữ Be Vietnam Pro, lời giảng và câu lệnh tạo hình nằm ở phần ghi chú của từng slide.</li>
              <li>Word theo mẫu Phụ lục IV Công văn 5512: mục tiêu, thiết bị, 4 hoạt động với bảng 4 bước, phân hóa theo tên học sinh, phiếu học tập hai tầng, câu hỏi kèm đáp án.</li>
              <li>{capFirst(h)} sửa trên web trước rồi mới tải, file tải về giống hệt bản xem trước.</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
