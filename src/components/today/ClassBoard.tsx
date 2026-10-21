"use client";
import { Camera, LockKeyhole, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, Chip } from "@/components/ui";
import { NoteEditor, shrinkEvidence } from "@/components/students/NoteEditor";
import { useApp } from "@/lib/store/app-store";
import { cn, stripDiacritics } from "@/lib/text";
import { suggestTiers, newId } from "@/lib/lesson/build";
import { attendanceDecision, closeWorkflow, openWorkflow, suggestions } from "@/lib/workflows/engine";
import { useWorkflows } from "@/lib/workflows/store";
import { WORKFLOW_LABELS } from "@/lib/workflows/templates";
import { vnNow } from "@/lib/time";
import type { ClassInfo, Student } from "@/lib/types";
const LEVEL = { gioi: "Giỏi", kha: "Khá", "trung-binh": "Trung bình", yeu: "Cần củng cố" };
const COLORS = ["bg-primary-soft text-primary", "bg-subject-soft text-subject", "bg-homeroom-soft text-homeroom", "bg-success-soft text-success"];
const FILTERS = { all: "Tất cả", absent: "Vắng/Ốm", help: "Cần hỗ trợ", advanced: "Tầng nâng cao", work: "Đang có việc cần làm" };
type Filter = keyof typeof FILTERS;
export function ClassBoard({ cls }: { cls: ClassInfo }) {
  const { profile, students, notes, today, addNotes, removeNote, timetable } = useApp();
  const [workflows, setWorkflows] = useWorkflows(profile.id);
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState<Filter>("all");
  const [editor, setEditor] = useState<{ student: Student; image?: string } | null>(null);
  const roster = students.filter(s => s.classId === cls.id);
  const visibleNotes = notes.filter(n => n.classId === cls.id && (cls.role === "chu-nhiem" || !["suc-khoe", "tam-ly"].includes(n.kind)));
  const tiers = suggestTiers(roster, visibleNotes);
  const absentNotes = (id: string) => notes.filter(n => n.studentId === id && n.classId === cls.id && n.absentToday && vnNow(new Date(n.createdAt)).date === today);
  const active = (id: string) => workflows.filter(w => w.studentId === id && !w.closedAt);
  const matches = (s: Student, f: Filter) => f === "all" || f === "absent" && absentNotes(s.id).length > 0 || f === "help" && suggestions(s, visibleNotes, new Date().toISOString()).includes("phu-dao") || f === "advanced" && tiers.nangCao.includes(s.id) || f === "work" && active(s.id).length > 0;
  const filtered = roster.filter(s => matches(s, filter) && stripDiacritics([s.fullName, ...s.traits, ...visibleNotes.filter(n => n.studentId === s.id).map(n => n.text)].join(" ")).includes(stripDiacritics(query)));
  function attendance(s: Student) {
    const absent = absentNotes(s.id);
    if (absent.length) {
      if (attendanceDecision(s.id, workflows, today) === "confirm-cancel") {
        const cancel = window.confirm("Đánh dấu có mặt lại. Có hủy quy trình bù bài hôm nay không? Bấm Hủy để giữ quy trình.");
        if (cancel) setWorkflows(all => all.map(w => w.studentId === s.id && w.loai === "bu-bai" && vnNow(new Date(w.createdAt)).date === today ? closeWorkflow(w, new Date().toISOString(), true) : w));
      }
      // Giữ nội dung/ảnh ghi chú cũ, chỉ bỏ cờ vắng.
      for (const n of absent) removeNote(n.id);
      addNotes(absent.map(n => ({ ...n, absentToday: false })));
    } else addNotes([{ id: newId("note"), studentId: s.id, rawName: s.fullName, classId: cls.id, kind: "chuyen-can", text: "Vắng hôm nay", absentToday: true, source: "go-tay", createdAt: new Date().toISOString() }]);
  }
  return <section data-tour="class" className="space-y-4">
    <div><h2 className="text-xl font-semibold">Lớp {cls.name} · {cls.role === "chu-nhiem" ? "Chủ nhiệm" : cls.subject}</h2><p className="text-ink-muted">Sĩ số {roster.length} · Có mặt {roster.filter(s => !absentNotes(s.id).length).length} · Vắng {roster.filter(s => absentNotes(s.id).length).length}</p></div>
    <label className="block">Tìm học sinh, đặc điểm hoặc ghi chú<input value={query} onChange={e => setQuery(e.target.value.normalize("NFC"))} className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface p-3" placeholder="Gõ tên có dấu hoặc không dấu…" /></label>
    <div className="flex flex-wrap gap-2">{(Object.keys(FILTERS) as Filter[]).map(f => <Button key={f} variant={filter === f ? "primary" : "secondary"} aria-pressed={filter === f} onClick={() => setFilter(f)}>{FILTERS[f]} · {roster.filter(s => matches(s,f)).length}</Button>)}</div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(s => {
      const absent = absentNotes(s.id).length > 0; const own = visibleNotes.filter(n => n.studentId === s.id); const work = active(s.id);
      const suggested = suggestions(s, visibleNotes, new Date().toISOString()).filter(k => !work.some(w => w.loai === k));
      const color = COLORS[Array.from(s.id).reduce((n,c) => n + c.charCodeAt(0), 0) % COLORS.length];
      return <Card key={s.id} data-student={s.id} className={cn("flex flex-col gap-3 border-t-4 p-4", absent ? "border-t-urgent" : "border-t-success")}>
        <div className="flex items-start gap-2"><span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl font-bold", color)}>{s.fullName.split(" ").slice(-2).map(x => x[0]).join("")}</span><div className="min-w-0 flex-1"><p className="text-sm text-ink-muted">{roster.indexOf(s)+1} · {cls.name}</p><Link href={`/hoc-sinh?id=${encodeURIComponent(s.id)}`} className="inline-flex min-h-11 items-center font-semibold">{s.fullName}</Link></div><button aria-label={`Điểm danh ${s.fullName}: ${absent ? "vắng" : "có mặt"}`} aria-pressed={absent} onClick={() => attendance(s)} className={cn("flex min-h-11 min-w-11 shrink-0 flex-col items-center justify-center rounded-xl p-1 text-sm", absent ? "bg-urgent-soft text-urgent" : "bg-success-soft text-success")}>{absent ? <UserX className="size-5" /> : <UserCheck className="size-5" />}{absent ? "Vắng" : "Có mặt"}</button></div>
        <div><Chip>{s.hocLuc ? `Học lực: ${LEVEL[s.hocLuc]}` : "Chưa ghi học lực"}</Chip></div>
        {s.noiBat && <p className={cn("rounded-r-xl border-l-4 p-3", s.noiBat.loai === "thanh-tich" ? "border-success bg-success-soft" : "border-homeroom bg-homeroom-soft")}>{s.noiBat.loai === "thanh-tich" ? "Thành tích: " : "Cần hỗ trợ: "}{s.noiBat.text}</p>}
        <div className="flex flex-wrap gap-1">{s.traits.slice(0,3).map(t => <Chip key={t}>{t}</Chip>)}{s.traits.length>3 && <Chip>+{s.traits.length-3}</Chip>}</div>
        <p>Gợi ý khi dạy: <strong>{tiers.nangCao.includes(s.id) ? "Tầng 2 (Nâng cao)" : "Tầng 1 (Cốt lõi)"}</strong></p>
        {own.some(n => ["suc-khoe", "tam-ly"].includes(n.kind)) && <p className="flex items-center gap-1 text-sm text-ink-muted"><LockKeyhole className="size-4" /> Có ghi chú riêng</p>}
        {work.map(w => <Link key={w.id} href={`/hoc-sinh?id=${encodeURIComponent(s.id)}&workflow=${encodeURIComponent(w.id)}`} className="flex min-h-11 items-center text-sm font-semibold text-subject">{WORKFLOW_LABELS[w.loai]} {w.steps.filter(x => x.status === "xong").length}/{w.steps.length}</Link>)}
        {suggested.map(k => <Button key={k} variant="secondary" onClick={() => setWorkflows(all => openWorkflow(all,s,k,own[0]?.id ?? "",new Date().toISOString(),Object.keys(timetable).map(Number)))}>Gợi ý: {WORKFLOW_LABELS[k]}</Button>)}
        <div className="mt-auto flex gap-2"><Button className="flex-1" onClick={() => setEditor({ student:s })}>Ghi chú</Button><label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-border p-3" aria-label={`Thêm ảnh cho ${s.fullName}`}><Camera className="size-5" /><input type="file" accept="image/*" capture="environment" className="sr-only" aria-label={`Ảnh minh chứng ${s.fullName}`} onChange={async e => { const file=e.target.files?.[0]; e.target.value=""; if(file)try{setEditor({student:s,image:await shrinkEvidence(file)})}catch(error){toast.error((error as Error).message)} }} /></label></div>
      </Card>;
    })}</div>
    {!filtered.length && <p className="rounded-xl border border-border p-5">Chưa có em nào khớp bộ lọc.</p>}
    {visibleNotes.some(n => !n.studentId) && <Card className="p-4"><h3 className="font-semibold">Ghi chú chưa gắn học sinh</h3>{visibleNotes.filter(n => !n.studentId).map(n => <p key={n.id}>{n.rawName}: {n.text}</p>)}</Card>}
    {editor && <NoteEditor {...editor} onClose={() => setEditor(null)} />}
  </section>;
}
