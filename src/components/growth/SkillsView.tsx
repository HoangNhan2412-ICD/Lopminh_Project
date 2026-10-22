"use client";

import { Check, ExternalLink, Sparkles, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Card, CardHeader, Chip, buttonCls } from "@/components/ui";
import { SKILLS, type SkillLesson } from "@/content/ky-nang-so";
import { useLessons } from "@/lib/lesson/store";
import { useLocal } from "@/lib/local-store";
import { honorificLower } from "@/lib/persona/honorific";
import { speakVi } from "@/lib/speech";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn } from "@/lib/text";
import { GuideImage } from "@/components/GuideImage";

const NONE: string[] = [];

export function SkillsView() {
  const { profile, today } = useApp();
  const h = honorificLower(profile);
  const [lessons] = useLessons(profile.id);
  const [done, setDone] = useLocal<string[]>(`lm:kynang:${profile.id}`, NONE);

  // Bài gợi ý: liên quan việc vừa làm (vừa soạn bài → chiếu slide), không thì bài chưa học theo ngày
  const suggested = useMemo<SkillLesson>(() => {
    const notDone = SKILLS.filter((s) => !done.includes(s.id));
    if (lessons.length) {
      const rel = notDone.find((s) => s.related === "soan-bai");
      if (rel) return rel;
    }
    const pool = notDone.length ? notDone : SKILLS;
    const dayIndex = today ? Number(today.slice(8, 10)) : 0;
    return pool[dayIndex % pool.length];
  }, [done, lessons.length, today]);

  const [openId, setOpenId] = useState<string>(suggested.id);
  const open = SKILLS.find((s) => s.id === openId) ?? suggested;
  const isDone = done.includes(open.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Kỹ Năng Số</h1>
        <p className="text-ink-muted">
          Mỗi bài 2 phút. {capFirst(h)} đã làm được {done.length}/{SKILLS.length} bài.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card>
          <div className="px-5 pt-5">
            {open.id === suggested.id && (
              <Chip tone="accent">
                <Sparkles className="size-4" aria-hidden /> Gợi ý hôm nay
              </Chip>
            )}
            <h2 className="mt-2 text-2xl font-bold leading-snug">{open.title}</h2>
            <p className="mt-1 text-ink-muted">{open.why}</p>
          </div>
          <ol className="space-y-4 p-5">
            {open.steps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-fg">{i + 1}</span>
                <div className="min-w-0 flex-1"><p className="pt-2 text-lg leading-relaxed">{s}</p>{open.images?.[i] && <GuideImage {...open.images[i]} />}</div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2 border-t border-border p-4">
            <Button variant="secondary" onClick={() => speakVi(`${open.title}. ${open.steps.map((s, i) => `Bước ${i + 1}. ${s}`).join(" ")}`)}>
              <Volume2 className="size-5" aria-hidden /> Đọc to
            </Button>
            {open.tryUrl && (
              <a href={open.tryUrl} target="_blank" rel="noreferrer" className={buttonCls("secondary")}>
                <ExternalLink className="size-5" aria-hidden /> Thử ngay
              </a>
            )}
            <Button className="ml-auto" onClick={() => setDone(isDone ? done.filter((x) => x !== open.id) : [...done, open.id])} variant={isDone ? "ghost" : "primary"}>
              <Check className="size-5" aria-hidden /> {isDone ? "Đã làm được" : "Mình làm được rồi"}
            </Button>
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title="Các bài" />
          <ul className="p-2">
            {SKILLS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setOpenId(s.id)}
                  aria-current={s.id === open.id}
                  className={cn("flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-muted", s.id === open.id && "bg-primary-soft")}
                >
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border-2", done.includes(s.id) ? "border-success bg-success text-primary-fg" : "border-border")}>
                    {done.includes(s.id) && <Check className="size-4" aria-label="Đã làm được" />}
                  </span>
                  <span className="flex-1 font-medium leading-snug">{s.title}</span>
                  <span className="text-sm text-ink-muted">{s.minutes} phút</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
