"use client";

import { ClipboardCopy, Download, LoaderCircle, MonitorPlay, Plus, QrCode, Sparkles, Trash2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PlatformGuide } from "@/components/quiz/PlatformGuide";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { Button, Card, CardHeader } from "@/components/ui";
import { newId } from "@/lib/lesson/build";
import { useLessons } from "@/lib/lesson/store";
import { useLocal } from "@/lib/local-store";
import { honorificLower } from "@/lib/persona/honorific";
import { downloadBlob, kahootXlsx, quizletText, waygroundXlsx } from "@/lib/quiz/export";
import type { QuizQuestion, QuizSet } from "@/lib/quiz/types";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn, nfc } from "@/lib/text";

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none";
const EMPTY: QuizSet[] = [];
const LETTERS = ["A", "B", "C", "D"];

function blankQuestion(): QuizQuestion {
  return { q: "", options: ["", "", "", ""], answer: 0, explain: "", seconds: 30 };
}

export function QuizRoom() {
  const { profile, classes } = useApp();
  const h = honorificLower(profile);
  const params = useSearchParams();
  const [lessons] = useLessons(profile.id);
  const [sets, setSets] = useLocal<QuizSet[]>(`lm:quiz:${profile.id}`, EMPTY);
  const fromLesson = lessons.find((l) => l.id === params.get("bai"));

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [source, setSource] = useState("");
  const [count, setCount] = useState(8);
  const [level, setLevel] = useState<"de" | "vua" | "kho" | "tron">("tron");
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [link, setLink] = useState("");
  const qrRef = useRef<HTMLCanvasElement>(null);

  const current = sets.find((s) => s.id === currentId) ?? null;
  const subject = profile.subject;
  const grade = useMemo(() => {
    const c = classes.find((x) => x.subject === subject);
    return c ? `Lớp ${c.name.match(/^\d+/)?.[0] ?? c.name}` : "";
  }, [classes, subject]);

  const saveSet = (s: QuizSet) => setSets((all) => [s, ...all.filter((x) => x.id !== s.id)]);
  const updateQ = (i: number, patch: Partial<QuizQuestion>) => {
    if (!current) return;
    saveSet({ ...current, questions: current.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) });
  };

  function fromPlan() {
    if (!fromLesson) return;
    const s: QuizSet = {
      id: newId("quiz"),
      title: fromLesson.title,
      questions: fromLesson.quiz.map((q) => ({ ...q, explain: q.explain ?? "", seconds: 30 })),
      sourceLessonId: fromLesson.id,
      createdAt: new Date().toISOString(),
    };
    saveSet(s);
    setCurrentId(s.id);
    toast.success(`Đã lấy ${s.questions.length} câu từ giáo án`);
  }

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: nfc(source), subject, grade, count, level }),
      });
      const data = (await res.json()) as { set?: { title: string; questions: QuizQuestion[] }; error?: string };
      if (!res.ok || !data.set) throw new Error(data.error ?? "Chưa soạn được câu hỏi.");
      const s: QuizSet = { id: newId("quiz"), ...data.set, createdAt: new Date().toISOString() };
      saveSet(s);
      setCurrentId(s.id);
      toast.success(`Bé Bảng đã soạn ${s.questions.length} câu`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function manual() {
    const s: QuizSet = { id: newId("quiz"), title: "Bộ câu hỏi mới", questions: [blankQuestion()], createdAt: new Date().toISOString() };
    saveSet(s);
    setCurrentId(s.id);
  }

  const ready = current && current.questions.every((q) => q.q.trim() && q.options.every((o) => o.trim()));
  const fileName = (ext: string) => `${nfc(current?.title ?? "quiz").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_").slice(0, 60)}.${ext}`;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Phòng Quiz</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {/* Tạo bộ câu hỏi */}
          <Card>
            <CardHeader
              icon={<Sparkles className="size-6" />}
              title="Tạo câu hỏi từ bài giảng"
              subtitle="Dán nội dung bài, đề cương hay trang sách. Bé Bảng soạn câu trắc nghiệm 4 lựa chọn."
            />
            <div className="space-y-4 p-5">
              {fromLesson && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-soft p-3">
                  <p>
                    Lấy {fromLesson.quiz.length} câu có sẵn từ giáo án <strong>{fromLesson.title}</strong>
                  </p>
                  <Button size="sm" onClick={fromPlan}>
                    Lấy câu hỏi
                  </Button>
                </div>
              )}
              <textarea rows={6} className={inputCls} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Dán nội dung bài giảng vào đây…" />
              <div className="flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="text-sm text-ink-muted">Số câu</span>
                  <input type="number" min={3} max={20} className={cn(inputCls, "mt-1 w-24")} value={count} onChange={(e) => setCount(Math.min(20, Math.max(3, Number(e.target.value) || 8)))} />
                </label>
                <label className="block">
                  <span className="text-sm text-ink-muted">Mức độ</span>
                  <select className={cn(inputCls, "mt-1 min-h-11")} value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
                    <option value="tron">Trộn nhiều mức</option>
                    <option value="de">Dễ (nhận biết)</option>
                    <option value="vua">Vừa (thông hiểu)</option>
                    <option value="kho">Khó (vận dụng)</option>
                  </select>
                </label>
                <Button onClick={generate} disabled={busy || source.trim().length < 10} className="ml-auto">
                  {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Sparkles className="size-5" aria-hidden />}
                  {busy ? "Đang soạn…" : "Soạn câu hỏi"}
                </Button>
              </div>
              <button onClick={manual} className="text-primary underline-offset-4 hover:underline">
                Hoặc tự gõ câu hỏi
              </button>
            </div>
          </Card>

          {/* Bộ câu hỏi đang mở */}
          {current && (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
                <input
                  key={current.id}
                  className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 text-xl font-semibold hover:border-border focus:border-primary focus:outline-none"
                  defaultValue={current.title}
                  onBlur={(e) => saveSet({ ...current, title: nfc(e.target.value.trim() || current.title) })}
                  aria-label="Tên bộ câu hỏi"
                />
                <Button onClick={() => setPlaying(true)} disabled={!ready}>
                  <MonitorPlay className="size-5" aria-hidden /> Chiếu lên lớp
                </Button>
              </div>
              <ol className="divide-y divide-border">
                {current.questions.map((q, i) => (
                  <li key={`${current.id}-${i}`} className="space-y-2 p-5">
                    <div className="flex items-start gap-3">
                      <span className="mt-2 font-semibold text-ink-muted">{i + 1}.</span>
                      <textarea rows={2} className={inputCls} defaultValue={q.q} onBlur={(e) => updateQ(i, { q: nfc(e.target.value) })} aria-label={`Câu ${i + 1}`} placeholder="Câu hỏi" />
                    </div>
                    <div className="grid grid-cols-1 gap-2 pl-7 sm:grid-cols-2">
                      {q.options.map((o, k) => (
                        <label key={k} className={cn("flex min-w-0 items-center gap-2 rounded-xl border p-1.5", q.answer === k ? "border-success bg-success-soft" : "border-border")}>
                          <input type="radio" name={`a-${current.id}-${i}`} checked={q.answer === k} onChange={() => updateQ(i, { answer: k })} className="ml-1 size-5" aria-label={`Đáp án đúng là ${LETTERS[k]}`} />
                          <span className="font-semibold">{LETTERS[k]}</span>
                          <input
                            className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 focus:outline-none"
                            defaultValue={o}
                            placeholder={`Phương án ${LETTERS[k]}`}
                            onBlur={(e) => {
                              const options = [...q.options];
                              options[k] = nfc(e.target.value);
                              updateQ(i, { options });
                            }}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pl-7">
                      <label className="flex items-center gap-2 text-sm text-ink-muted">
                        Thời gian
                        <select className="min-h-11 rounded-lg border border-border bg-surface px-2" value={q.seconds} onChange={(e) => updateQ(i, { seconds: Number(e.target.value) })}>
                          {[10, 20, 30, 60, 90, 120].map((s) => (
                            <option key={s} value={s}>
                              {s} giây
                            </option>
                          ))}
                        </select>
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-urgent hover:bg-urgent-soft"
                        onClick={() => current.questions.length > 1 && saveSet({ ...current, questions: current.questions.filter((_, j) => j !== i) })}
                        disabled={current.questions.length <= 1}
                      >
                        <Trash2 className="size-4" aria-hidden /> Bỏ câu
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="border-t border-border p-4">
                <Button variant="secondary" size="sm" onClick={() => saveSet({ ...current, questions: [...current.questions, blankQuestion()] })}>
                  <Plus className="size-4" aria-hidden /> Thêm câu
                </Button>
              </div>
            </Card>
          )}

          {sets.length > 0 && (
            <Card className="p-5">
              <p className="font-semibold">Các bộ câu hỏi đã có</p>
              <ul className="mt-2 space-y-1">
                {sets.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <button onClick={() => setCurrentId(s.id)} className={cn("min-h-11 flex-1 rounded-lg px-3 text-left hover:bg-surface-muted", s.id === currentId && "bg-primary-soft font-semibold text-primary")}>
                      {s.title} <span className="text-sm font-normal text-ink-muted">({s.questions.length} câu)</span>
                    </button>
                    <button
                      onClick={() => {
                        setSets((all) => all.filter((x) => x.id !== s.id));
                        if (currentId === s.id) setCurrentId(null);
                      }}
                      className="flex size-11 items-center justify-center rounded-lg text-ink-muted hover:bg-urgent-soft hover:text-urgent"
                      aria-label={`Xóa ${s.title}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader icon={<Download className="size-6" />} title="Đưa sang nền tảng quen dùng" subtitle={current ? `Bộ “${current.title}”` : "Mở hoặc tạo một bộ câu hỏi trước"} />
            <div className="space-y-2 p-5">
              <Button className="w-full" disabled={!ready} onClick={async () => current && downloadBlob(await waygroundXlsx(current), `Wayground_${fileName("xlsx")}`)}>
                Tải file Wayground (Quizizz)
              </Button>
              <Button variant="secondary" className="w-full" disabled={!ready} onClick={async () => current && downloadBlob(await kahootXlsx(current), `Kahoot_${fileName("xlsx")}`)}>
                Tải file Kahoot
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                disabled={!ready}
                onClick={() =>
                  current &&
                  navigator.clipboard.writeText(quizletText(current)).then(
                    () => toast.success("Đã chép, mở Quizlet và dán vào ô Nhập nhé"),
                    () => toast.error("Trình duyệt chưa cho chép"),
                  )
                }
              >
                <ClipboardCopy className="size-5" aria-hidden /> Chép cho Quizlet
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader icon={<QrCode className="size-6" />} title="Mã QR cho học sinh quét" subtitle="Dán link phòng Wayground, Kahoot, Quizlet hay Google Form" />
            <div className="space-y-3 p-5">
              <input className={inputCls} value={link} onChange={(e) => setLink(e.target.value.trim())} placeholder="https://…" aria-label="Link phòng quiz" />
              {/^https?:\/\/\S+\.\S+/.test(link) ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-xl bg-surface p-3 shadow-[var(--shadow-card)]">
                    <QRCodeCanvas ref={qrRef} value={link} size={240} marginSize={2} />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const c = qrRef.current;
                      if (!c) return;
                      c.toBlob((b) => b && downloadBlob(b, "ma-qr-quiz.png"));
                    }}
                  >
                    <Download className="size-4" aria-hidden /> Tải ảnh mã QR
                  </Button>
                </div>
              ) : (
                <p className="text-ink-muted">{capFirst(h)} dán link vào ô trên, mã QR hiện ngay để chiếu hoặc dán lên slide.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Hướng dẫn từng bước" subtitle={`Làm một lần là quen, ${h} cứ đi theo số thứ tự`} />
            <div className="p-5 pt-3">
              <PlatformGuide />
            </div>
          </Card>
        </div>
      </div>

      {playing && current && <QuizPlayer set={current} onClose={() => setPlaying(false)} />}
    </div>
  );
}
