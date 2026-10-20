"use client";

import { ChevronRight, Eye, Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { QuizSet } from "@/lib/quiz/types";
import { cn } from "@/lib/text";

const TILE = ["bg-quiz-a", "bg-quiz-b", "bg-quiz-c", "bg-quiz-d"];
const LETTERS = ["A", "B", "C", "D"];
const TEAMS = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4"];

/**
 * Chiếu quiz trên lớp, không cần học sinh có điện thoại: học sinh giơ thẻ A-B-C-D hoặc thi theo tổ,
 * thầy cô bấm cộng điểm. Phím tắt: Space hiện đáp án, → câu tiếp, Esc thoát.
 */
export function QuizPlayer({ set, onClose }: { set: QuizSet; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [left, setLeft] = useState(set.questions[0]?.seconds ?? 30);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const q = set.questions[i];
  const last = i === set.questions.length - 1;

  const next = useCallback(() => {
    if (last) return;
    setI((x) => x + 1);
    setReveal(false);
    setLeft(set.questions[i + 1].seconds);
  }, [last, i, set.questions]);

  useEffect(() => {
    if (reveal) return;
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [reveal, i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === " ") {
        e.preventDefault();
        setReveal(true);
      } else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, onClose]);

  if (!q) return null;
  const timeUp = left === 0;

  return (
    <div className="chalkboard fixed inset-0 z-50 flex flex-col overflow-auto p-4 sm:p-8" role="dialog" aria-modal aria-label={`Trình chiếu ${set.title}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg text-chalk/80">
          Câu {i + 1}/{set.questions.length}
        </p>
        <p className={cn("text-4xl font-bold tabular-nums", timeUp ? "text-accent" : "text-chalk")} aria-live="polite">
          {timeUp ? "Hết giờ" : `${left}s`}
        </p>
        <button onClick={onClose} className="flex size-12 items-center justify-center rounded-xl hover:bg-white/10" aria-label="Thoát trình chiếu">
          <X className="size-7" />
        </button>
      </div>

      <p className="mx-auto mt-6 max-w-5xl text-center text-3xl font-semibold leading-snug sm:text-5xl">{q.q}</p>

      <div className="mx-auto mt-8 grid w-full max-w-6xl flex-1 gap-4 sm:grid-cols-2">
        {q.options.map((o, k) => (
          <div
            key={k}
            className={cn(
              "flex min-h-24 items-center gap-4 rounded-2xl px-5 py-4 text-2xl font-semibold text-white transition-opacity sm:text-3xl",
              TILE[k],
              reveal && k !== q.answer && "opacity-30",
            )}
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-bold text-ink">{LETTERS[k]}</span>
            {o}
          </div>
        ))}
      </div>

      {reveal && q.explain && <p className="mx-auto mt-5 max-w-4xl text-center text-xl text-chalk/90">{q.explain}</p>}

      <div className="mx-auto mt-6 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" aria-label="Điểm các tổ">
          {TEAMS.map((t, k) => (
            <div key={t} className="flex items-center gap-1 rounded-xl bg-white/10 px-2 py-1">
              <span className="px-1 font-medium">{t}</span>
              <button className="flex size-11 items-center justify-center rounded-lg hover:bg-white/10" aria-label={`Trừ điểm ${t}`} onClick={() => setScores((s) => s.map((v, j) => (j === k ? Math.max(0, v - 1) : v)))}>
                <Minus className="size-5" />
              </button>
              <span className="w-8 text-center text-2xl font-bold tabular-nums">{scores[k]}</span>
              <button className="flex size-11 items-center justify-center rounded-lg hover:bg-white/10" aria-label={`Cộng điểm ${t}`} onClick={() => setScores((s) => s.map((v, j) => (j === k ? v + 1 : v)))}>
                <Plus className="size-5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {!reveal && (
            <button onClick={() => setReveal(true)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-lg font-semibold text-ink">
              <Eye className="size-5" /> Hiện đáp án
            </button>
          )}
          {reveal && !last && (
            <button onClick={next} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-lg font-semibold text-ink">
              Câu tiếp <ChevronRight className="size-5" />
            </button>
          )}
          {reveal && last && (
            <button onClick={onClose} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-lg font-semibold text-ink">
              Kết thúc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
