"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { LockKeyhole, Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useSpeechToText } from "@/lib/hooks";
import { newId } from "@/lib/lesson/build";
import { nfc } from "@/lib/text";
import { useApp } from "@/lib/store/app-store";
import type { NoteKind, Student } from "@/lib/types";

const QUICK: { text: string; kind: NoteKind; absent?: boolean }[] = [
  { text: "Vắng có phép", kind: "chuyen-can", absent: true }, { text: "Vắng không phép", kind: "chuyen-can", absent: true },
  { text: "Ốm", kind: "suc-khoe", absent: true }, { text: "Chưa làm bài", kind: "hoc-tap" },
  { text: "Phát biểu tốt", kind: "khen-thuong" }, { text: "Mất tập trung", kind: "hoc-tap" }, { text: "Tiến bộ", kind: "khen-thuong" },
];
export async function shrinkEvidence(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) throw new Error("Chọn ảnh nhỏ hơn 20 MB nhé.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Trình duyệt chưa đọc được ảnh.");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.6);
    if (data.length > 1_200_000) throw new Error("Ảnh còn lớn. Mình cắt bớt ảnh trước khi lưu nhé.");
    return data;
  } finally { bitmap.close(); }
}
export function NoteEditor({ student, image, onClose }: { student: Student; image?: string; onClose: () => void }) {
  const { addNotes } = useApp();
  const ref = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState("");
  const [kind, setKind] = useState<NoteKind>("hoc-tap");
  const [absent, setAbsent] = useState(false);
  const append = useCallback((s: string) => setText(t => nfc(`${t} ${s}`.trim())), []);
  const speech = useSpeechToText(append);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} onCancel={onClose} className="m-auto mb-0 max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 text-ink backdrop:bg-ink/40 sm:mb-auto sm:rounded-2xl" aria-labelledby="note-heading">
    <div className="flex items-center justify-between gap-3"><h2 id="note-heading" className="text-xl font-semibold">Ghi chú · {student.shortName}</h2><Button variant="ghost" aria-label="Đóng ghi chú" onClick={onClose}><X className="size-5" /></Button></div>
    <div className="my-4 flex flex-wrap gap-2">{QUICK.map(q => <Button key={q.text} variant="secondary" onClick={() => { setText(q.text); setKind(q.kind); setAbsent(Boolean(q.absent)); }}>{q.text}</Button>)}</div>
    <label className="block">Loại ghi chú<select value={kind} onChange={e => setKind(e.target.value as NoteKind)} className="my-2 min-h-11 w-full rounded-xl border border-border bg-surface p-2">{Object.entries({ "chuyen-can": "Chuyên cần", "suc-khoe": "Sức khỏe · riêng tư", "tam-ly": "Tâm lý · riêng tư", "hoc-tap": "Học tập", "khen-thuong": "Khen thưởng", khac: "Khác" }).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
    <label className="block">Điều muốn ghi nhớ<textarea value={text} onChange={e => setText(nfc(e.target.value))} rows={4} className="mt-2 w-full rounded-xl border border-border bg-surface p-3" /></label>
    <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={absent} onChange={e => setAbsent(e.target.checked)} /> Vắng hôm nay</label>
    {speech.supported && <Button variant="secondary" onClick={() => speech.listening ? speech.stop() : speech.start()}>{speech.listening ? <Square className="size-5" /> : <Mic className="size-5" />} {speech.listening ? "Dừng nghe" : "Nói ghi chú"}</Button>}
    {speech.error && <p role="alert" className="text-urgent">{speech.error}</p>}
    {image && <div className="mt-3"><p>Ảnh minh chứng · chỉ lưu trên máy</p>{/* eslint-disable-next-line @next/next/no-img-element -- ảnh cục bộ không gửi qua máy chủ tối ưu ảnh */}
<img src={image} alt="Ảnh bài làm sắp gắn vào ghi chú" className="mt-2 max-h-48 max-w-full rounded-xl object-contain" /></div>}
    <p className="my-4 flex items-start gap-2 text-sm text-ink-muted"><LockKeyhole className="size-5 shrink-0" /> Ghi chú sức khỏe, tâm lý không tự đưa vào nháp phụ huynh. Ảnh chỉ lưu trên trình duyệt này.</p>
    <Button disabled={!text.trim() && !image} onClick={() => { speech.stop(); addNotes([{ id: newId("note"), studentId: student.id, rawName: student.fullName, classId: student.classId, kind, text: nfc(text.trim() || "Ảnh minh chứng bài làm"), absentToday: absent, source: "go-tay", createdAt: new Date().toISOString(), ...(image ? { evidence: [image] } : {}) }]); onClose(); }}>Lưu ghi chú</Button>
  </dialog>;
}
