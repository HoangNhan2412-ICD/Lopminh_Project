"use client";

import { Check, Flame, Mic, Square, Volume2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button, Card, CardHeader } from "@/components/ui";
import { COMMANDS, TERMS, type Phrase } from "@/content/song-ngu";
import { useSpeechToText } from "@/lib/hooks";
import { useLessons } from "@/lib/lesson/store";
import { useLocal } from "@/lib/local-store";
import { honorificLower } from "@/lib/persona/honorific";
import { speakEn } from "@/lib/speech";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn } from "@/lib/text";

const NO_DAYS: string[] = [];

/** So khớp đơn giản theo từ: đủ để khen hoặc chỉ ra một từ cần đọc lại, không chấm điểm. */
function compare(target: string, heard: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);
  const t = norm(target);
  const h = new Set(norm(heard));
  const missed = t.filter((w) => !h.has(w));
  return { ok: missed.length <= Math.floor(t.length / 4), missed };
}

function PhraseRow({ p, practice }: { p: Phrase; practice: (p: Phrase) => void }) {
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold" lang="en">
          {p.en}
        </p>
        <p className="text-ink-muted">
          {p.vi}
          {p.say && <span className="ml-2 text-sm italic">({p.say})</span>}
        </p>
      </div>
      <div className="flex gap-1">
        <button onClick={() => speakEn(p.en)} className="flex size-11 items-center justify-center rounded-xl text-primary hover:bg-primary-soft" aria-label={`Nghe mẫu: ${p.en}`}>
          <Volume2 className="size-5" />
        </button>
        <button onClick={() => practice(p)} className="flex size-11 items-center justify-center rounded-xl text-primary hover:bg-primary-soft" aria-label={`Tập nói: ${p.en}`}>
          <Mic className="size-5" />
        </button>
      </div>
    </li>
  );
}

export function BilingualView() {
  const { profile, today } = useApp();
  const h = honorificLower(profile);
  const [lessons] = useLessons(profile.id);
  const [days, setDays] = useLocal<string[]>(`lm:songngu-days:${profile.id}`, NO_DAYS);
  const [group, setGroup] = useState(COMMANDS[0].id);
  const [target, setTarget] = useState<Phrase | null>(null);
  const [result, setResult] = useState<{ ok: boolean; missed: string[]; heard: string } | null>(null);

  const onHeard = useCallback(
    (heard: string) => {
      if (!target) return;
      setResult({ ...compare(target.en, heard), heard });
      if (today && !days.includes(today)) setDays([...days, today].slice(-60));
    },
    [target, today, days, setDays],
  );
  const speech = useSpeechToText(onHeard, "en-US");

  const terms = TERMS[profile.subject] ?? TERMS["Toán"];
  const fromLessons = useMemo(
    () =>
      Array.from(new Set(lessons.flatMap((l) => l.slides.map((s) => s.englishCue).filter((x): x is string => Boolean(x))))).slice(0, 6).map((cue) => {
        const m = cue.match(/^(.*?)\s*\((.*)\)\s*$/);
        return { en: m ? m[1] : cue, vi: m ? m[2] : "" };
      }),
    [lessons],
  );

  // Chuỗi ngày học liên tiếp tính tới hôm nay hoặc hôm qua; mất chuỗi cũng không sao.
  const streak = useMemo(() => {
    if (!today) return 0;
    let n = 0;
    const d = new Date(`${today}T00:00:00Z`);
    if (!days.includes(today)) d.setUTCDate(d.getUTCDate() - 1);
    while (days.includes(d.toISOString().slice(0, 10))) {
      n++;
      d.setUTCDate(d.getUTCDate() - 1);
    }
    return n;
  }, [days, today]);

  const practice = (p: Phrase) => {
    setTarget(p);
    setResult(null);
    speakEn(p.en);
  };
  const cmd = COMMANDS.find((c) => c.id === group)!;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Song Ngữ</h1>
          <p className="text-ink-muted">Mỗi ngày vài câu là đủ. Không ai chấm điểm, nói sai cứ nói lại.</p>
        </div>
        {streak > 0 && (
          <p className="flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 font-semibold">
            <Flame className="size-5 text-homeroom" aria-hidden /> {streak} ngày liền
          </p>
        )}
      </div>

      {target && (
        <Card className="border-primary p-5">
          <p className="text-sm text-ink-muted">Đang tập câu</p>
          <p className="mt-1 text-2xl font-semibold" lang="en">
            {target.en}
          </p>
          <p className="text-ink-muted">{target.vi}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => speakEn(target.en, 0.7)}>
              <Volume2 className="size-5" aria-hidden /> Nghe chậm
            </Button>
            {speech.supported ? (
              <Button onClick={speech.listening ? speech.stop : speech.start}>
                {speech.listening ? <Square className="size-5" aria-hidden /> : <Mic className="size-5" aria-hidden />}
                {speech.listening ? "Dừng" : `${capFirst(h)} nói thử`}
              </Button>
            ) : (
              <p className="text-ink-muted">Trình duyệt này chưa nghe được tiếng nói. Dùng Chrome hoặc Cốc Cốc để tập nói nhé.</p>
            )}
          </div>
          {speech.interim && <p className="mt-3 text-ink-muted">Đang nghe: {speech.interim}</p>}
          {result && (
            <div className={cn("mt-3 rounded-xl p-3", result.ok ? "bg-success-soft" : "bg-accent-soft")}>
              {result.ok ? (
                <p className="flex items-center gap-2 font-semibold text-success">
                  <Check className="size-5" aria-hidden /> Rõ lắm rồi! Bé Bảng nghe được: “{result.heard}”
                </p>
              ) : (
                <p>
                  Gần được rồi. Bé Bảng nghe là “{result.heard}”. {capFirst(h)} đọc lại chữ <strong lang="en">{result.missed[0]}</strong> chậm hơn chút xem.
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Khẩu lệnh trong lớp" subtitle="Chọn tình huống, bấm loa để nghe, bấm micro để tập" />
          <div className="flex gap-2 overflow-x-auto px-5 pt-3">
            {COMMANDS.map((c) => (
              <button
                key={c.id}
                onClick={() => setGroup(c.id)}
                aria-pressed={group === c.id}
                className={cn("min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium", group === c.id ? "border-primary bg-primary text-primary-fg" : "border-border hover:bg-surface-muted")}
              >
                {c.label}
              </button>
            ))}
          </div>
          <ul className="divide-y divide-border px-5 pb-2">
            {cmd.phrases.map((p) => (
              <PhraseRow key={p.en} p={p} practice={practice} />
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          {fromLessons.length > 0 && (
            <Card>
              <CardHeader title={`Từ bài ${h} vừa soạn`} subtitle="Các câu song ngữ đã gắn trên slide" />
              <ul className="divide-y divide-border px-5 pb-2">
                {fromLessons.map((p) => (
                  <PhraseRow key={p.en} p={p} practice={practice} />
                ))}
              </ul>
            </Card>
          )}
          <Card>
            <CardHeader title={`Thuật ngữ môn ${profile.subject}`} subtitle="Học 3 từ mỗi ngày là vừa" />
            <ul className="divide-y divide-border px-5 pb-2">
              {terms.map((p) => (
                <PhraseRow key={p.en} p={p} practice={practice} />
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
