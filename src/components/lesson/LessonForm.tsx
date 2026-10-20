"use client";

import { Mic, Square, Wand2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button, Card, CardHeader } from "@/components/ui";
import { useSpeechToText } from "@/lib/hooks";
import type { LessonRequest } from "@/lib/lesson/types";
import { honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { cn, nfc } from "@/lib/text";

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none";

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="font-medium">{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            aria-pressed={value === o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              "min-h-12 rounded-xl border px-3 py-2 text-left text-base font-medium leading-snug transition-colors",
              value === o.v ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface hover:bg-surface-muted",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function LessonForm({ busy, docCount, onSubmit }: { busy: boolean; docCount: number; onSubmit: (r: LessonRequest, opts: { useKho: boolean }) => void }) {
  const { profile, classes } = useApp();
  const h = honorificLower(profile);
  const subjectClasses = classes.filter((c) => c.subject === profile.subject);
  const pool = subjectClasses.length ? subjectClasses : classes;

  const [topic, setTopic] = useState("");
  const [classId, setClassId] = useState(pool[0]?.id ?? "");
  const [minutes, setMinutes] = useState(45);
  const [wishes, setWishes] = useState("");
  const [energy, setEnergy] = useState<LessonRequest["energy"]>("soi-noi");
  const [focus, setFocus] = useState<LessonRequest["focus"]>("game");
  const [tone, setTone] = useState<LessonRequest["tone"]>("than-thien");
  const [useKho, setUseKho] = useState(docCount > 0);

  const append = useCallback((t: string) => setWishes((p) => (p ? `${p} ${t}` : t)), []);
  const speech = useSpeechToText(append);
  const cls = classes.find((c) => c.id === classId);
  const grade = cls ? `Lớp ${cls.name.match(/^\d+/)?.[0] ?? cls.name}` : "";

  return (
    <Card data-tour="lesson-form">
      <CardHeader
        icon={<Wand2 className="size-6" />}
        title="Soạn bài mới"
        subtitle={`Bé Bảng soạn giáo án 5512, slide có hình và câu hỏi trắc nghiệm theo tình hình thật của lớp. Mất khoảng 1–2 phút, ${h} cứ làm việc khác trong lúc chờ.`}
      />
      <form
        className="space-y-5 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!topic.trim() || !cls) return;
          speech.stop();
          onSubmit({
            topic: nfc(topic.trim()),
            subject: cls.subject,
            grade,
            classId: cls.id,
            className: cls.name,
            minutes,
            wishes: nfc(wishes.trim()),
            energy,
            focus,
            tone,
          }, { useKho: useKho && docCount > 0 });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem_8rem]">
          <label className="block">
            <span className="font-medium">Tên bài dạy</span>
            <input
              className={cn(inputCls, "mt-1")}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Căn bậc hai và hằng đẳng thức √(A²) = |A|"
              required
            />
          </label>
          <label className="block">
            <span className="font-medium">Lớp</span>
            <select className={cn(inputCls, "mt-1 min-h-11")} value={classId} onChange={(e) => setClassId(e.target.value)}>
              {pool.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role === "chu-nhiem" ? "chủ nhiệm" : "bộ môn"})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-medium">Số phút</span>
            <input
              type="number"
              min={20}
              max={180}
              step={5}
              className={cn(inputCls, "mt-1")}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value) || 45)}
            />
          </label>
        </div>

        <label className="block">
          <span className="font-medium">Mong muốn riêng của {h} (không bắt buộc)</span>
          <div className="relative mt-1">
            <textarea
              rows={3}
              className={cn(inputCls, "pr-14")}
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="Ví dụ: có trò chơi đố vui đầu giờ, thêm ví dụ tính tiền đi chợ, em An nghỉ ốm cần phiếu bù"
            />
            {speech.supported && (
              <button
                type="button"
                onClick={() => (speech.listening ? speech.stop() : speech.start())}
                className={cn(
                  "absolute right-2 top-2 flex size-11 items-center justify-center rounded-xl",
                  speech.listening ? "bg-urgent text-primary-fg" : "bg-surface-muted text-primary hover:bg-primary-soft",
                )}
                aria-label={speech.listening ? "Dừng nghe" : "Nói mong muốn"}
              >
                {speech.listening ? <Square className="size-5" /> : <Mic className="size-5" />}
              </button>
            )}
          </div>
          {speech.interim && <span className="mt-1 block text-sm text-ink-muted">Đang nghe: {speech.interim}</span>}
          {speech.error && <span className="mt-1 block text-sm text-urgent">{speech.error}</span>}
        </label>

        <Choice
          label="Lớp hôm nay thế nào?"
          value={energy}
          onChange={setEnergy}
          options={[
            { v: "soi-noi", label: "Sôi nổi, thích thi đua" },
            { v: "tram-lang", label: "Trầm, ít phát biểu" },
            { v: "tiet-cuoi", label: "Tiết cuối, dễ mệt" },
          ]}
        />
        <Choice
          label="Muốn tăng phần nào?"
          value={focus}
          onChange={setFocus}
          options={[
            { v: "game", label: "Trò chơi trắc nghiệm" },
            { v: "thao-luan", label: "Thảo luận cặp, nhóm" },
            { v: "go-diem", label: "Gọi các em gỡ điểm" },
          ]}
        />
        <Choice
          label="Giọng trình bày"
          value={tone}
          onChange={setTone}
          options={[
            { v: "than-thien", label: "Thân thiện, khích lệ" },
            { v: "chuan-muc", label: "Chuẩn mực, đón dự giờ" },
            { v: "song-ngu", label: "Có khẩu lệnh song ngữ" },
          ]}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className={cn("flex min-h-11 items-center gap-3", docCount === 0 && "text-ink-muted")}>
            <input type="checkbox" className="size-5" checked={useKho && docCount > 0} disabled={docCount === 0} onChange={(e) => setUseKho(e.target.checked)} />
            {docCount > 0 ? `Dựa vào Kho Dữ Liệu (${docCount} tài liệu)` : "Kho Dữ Liệu chưa có tài liệu"}
          </label>
          <Button type="submit" disabled={busy || !topic.trim()}>
            <Wand2 className="size-5" aria-hidden /> Soạn bài
          </Button>
        </div>
      </form>
    </Card>
  );
}
