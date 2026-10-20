"use client";

import { Keyboard, LoaderCircle, Mic, Square, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, Card, CardHeader } from "@/components/ui";
import { useSpeechToText } from "@/lib/hooks";
import { NOTE_KINDS, type ParsedNote } from "@/lib/notes/parse";
import { honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn, nfc } from "@/lib/text";
import type { ClassInfo, NoteKind, StudentNote } from "@/lib/types";

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none";

export function QuickNoteInput({ cls }: { cls: ClassInfo }) {
  const { profile, students, addNotes, today } = useApp();
  const roster = students.filter((s) => s.classId === cls.id);
  const h = honorificLower(profile);

  const [mode, setMode] = useState<"go-tay" | "giong-noi">("go-tay");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<ParsedNote[] | null>(null);
  const [aiMode, setAiMode] = useState<string | null>(null);

  const appendSpoken = useCallback((t: string) => setText((prev) => (prev ? `${prev}\n${t}` : t)), []);
  const speech = useSpeechToText(appendSpoken);

  const examples = roster.slice(0, 3).map((s, i) =>
    [
      `${s.shortName} nghỉ ốm sốt đến hết tuần`,
      `${s.shortName} hôm nay buồn, không tập trung`,
      `${s.shortName} cần ${h} giảng lại bài cũ`,
    ][i],
  );

  async function analyse() {
    const input = nfc(text.trim());
    if (!input) return;
    if (speech.listening) speech.stop();
    setBusy(true);
    try {
      const res = await fetch("/api/notes/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, today, roster }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { mode: string; notes: ParsedNote[] };
      setAiMode(data.mode);
      if (data.notes.length === 0) {
        toast.info(`Bé Bảng chưa tách được ý nào, ${h} viết rõ tên em học sinh giúp em nhé.`);
        return;
      }
      setReview(data.notes);
    } catch {
      toast.error("Không gửi được ghi chú. Mình kiểm tra mạng rồi thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  function updateRow(i: number, patch: Partial<ParsedNote>) {
    setReview((rows) => rows?.map((r, j) => (j === i ? { ...r, ...patch } : r)) ?? null);
  }

  function save() {
    if (!review) return;
    const now = new Date().toISOString();
    const source: StudentNote["source"] = mode === "giong-noi" ? "giong-noi" : "go-tay";
    const notes: StudentNote[] = review.map((r, i) => ({
      id: `${Date.now()}-${i}`,
      studentId: r.studentId,
      rawName: r.rawName,
      classId: cls.id,
      kind: r.kind,
      text: nfc(r.text),
      until: r.until,
      absentToday: r.absentToday,
      source,
      createdAt: now,
    }));
    addNotes(notes);
    toast.success(`Đã lưu ${notes.length} ghi chú cho lớp ${cls.name}.`);
    if (cls.role === "chu-nhiem" && notes.some((n) => n.absentToday || n.kind === "suc-khoe")) {
      toast(`Đã báo cho thầy cô bộ môn dạy lớp ${cls.name}.`, { description: "Thầy cô sẽ thấy ngay trên màn hình của mình." });
    }
    setReview(null);
    setText("");
  }

  return (
    <Card>
      <CardHeader
        title="Ghi nhanh tình hình lớp"
        subtitle={`Lớp ${cls.name} · ${h} gõ hoặc nói, Bé Bảng tách thành từng ghi chú`}
      />

      {review === null ? (
        <div className="space-y-3 p-5">
          <div role="tablist" aria-label="Cách nhập" className="grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1">
            {(
              [
                ["go-tay", "Gõ tay", Keyboard],
                ["giong-noi", "Nói", Mic],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                role="tab"
                aria-selected={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-lg font-semibold",
                  mode === value ? "bg-surface text-primary shadow-sm" : "text-ink-muted",
                )}
              >
                <Icon className="size-5" aria-hidden /> {label}
              </button>
            ))}
          </div>

          {mode === "giong-noi" && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-4">
              {speech.supported ? (
                <>
                  <button
                    onClick={speech.listening ? speech.stop : speech.start}
                    className={cn(
                      "flex size-20 items-center justify-center rounded-full text-primary-fg transition-colors",
                      speech.listening ? "animate-pulse bg-urgent" : "bg-primary hover:bg-primary-hover",
                    )}
                    aria-label={speech.listening ? "Dừng nghe" : "Bật micro và nói"}
                  >
                    {speech.listening ? <Square className="size-8" /> : <Mic className="size-9" />}
                  </button>
                  <p className="text-sm text-ink-muted">
                    {speech.listening ? "Bé Bảng đang nghe… bấm lần nữa để dừng" : "Bấm để nói, chữ sẽ hiện vào ô bên dưới"}
                  </p>
                  {speech.interim && <p className="px-4 text-center italic text-ink-muted">“{speech.interim}”</p>}
                </>
              ) : (
                <p className="px-4 text-center text-ink-muted">
                  Trình duyệt này chưa hỗ trợ nhận giọng nói. {capFirst(h)} dùng Chrome hoặc Cốc Cốc, hoặc gõ tay nhé.
                </p>
              )}
              {speech.error && <p className="px-4 text-center text-sm text-urgent">{speech.error}</p>}
            </div>
          )}

          <label className="sr-only" htmlFor="quick-note">Ghi chú</label>
          <textarea
            id="quick-note"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) analyse();
            }}
            rows={mode === "go-tay" ? 4 : 2}
            placeholder={`Ví dụ: ${examples[0] ?? "An nghỉ ốm đến hết tuần"}; ${examples[2] ?? "Tâm cần giảng lại bài"}`}
            className={cn(inputCls, "resize-y text-lg leading-relaxed")}
          />

          {examples.length > 0 && !text && (
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setText(ex)}
                  className="min-h-11 rounded-full border border-border px-3.5 text-sm hover:bg-surface-muted"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="hidden text-sm text-ink-muted sm:block">Mỗi dòng một ý. Ctrl + Enter để gửi nhanh.</p>
            <Button onClick={analyse} disabled={busy || !text.trim()}>
              {busy && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
              {busy ? "Đang tách…" : "Ghi lại"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 p-5">
          <p className="text-ink-muted">
            {capFirst(h)} xem lại giúp em, sửa chỗ nào chưa đúng rồi bấm Lưu.
            {aiMode === "demo" && " (Đang tách bằng quy tắc đơn giản vì chưa nối Gemini.)"}
          </p>
          <ul className="space-y-3">
            {review.map((r, i) => (
              <li key={i} className="rounded-xl border border-border p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    Học sinh
                    <select
                      value={r.studentId ?? ""}
                      onChange={(e) => {
                        const st = roster.find((s) => s.id === e.target.value);
                        updateRow(i, { studentId: st?.id ?? null, rawName: st?.shortName ?? r.rawName });
                      }}
                      className={cn(inputCls, "mt-1 min-h-11", !r.studentId && "border-homeroom")}
                    >
                      <option value="">{r.rawName ? `Chưa rõ: “${r.rawName}”` : "Chọn học sinh"}</option>
                      {roster.map((s) => (
                        <option key={s.id} value={s.id}>{s.fullName}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Loại
                    <select
                      value={r.kind}
                      onChange={(e) => updateRow(i, { kind: e.target.value as NoteKind })}
                      className={cn(inputCls, "mt-1 min-h-11")}
                    >
                      {Object.entries(NOTE_KINDS).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-2 block text-sm font-medium">
                  Nội dung
                  <input value={r.text} onChange={(e) => updateRow(i, { text: e.target.value })} className={cn(inputCls, "mt-1 min-h-11")} />
                </label>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(r.absentToday)}
                      onChange={(e) => updateRow(i, { absentToday: e.target.checked || undefined })}
                      className="size-5 accent-[var(--primary)]"
                    />
                    Vắng hôm nay
                    {r.until && <span className="text-ink-muted">· đến {r.until.split("-").reverse().join("/")}</span>}
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReview((rows) => rows?.filter((_, j) => j !== i) ?? null)}
                    aria-label="Bỏ ghi chú này"
                  >
                    <Trash2 className="size-5" aria-hidden /> Bỏ
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setReview(null)}>Sửa lại câu</Button>
            <Button onClick={save} disabled={review.length === 0}>Lưu {review.length} ghi chú</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
