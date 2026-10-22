"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { useLessons } from "@/lib/lesson/store";
import { useWorkflows } from "@/lib/workflows/store";
import { useApp } from "@/lib/store/app-store";
import { closeWorkflow, parentDraft } from "@/lib/workflows/engine";
import { WORKFLOW_LABELS, type StudentWorkflow } from "@/lib/workflows/templates";
import { downloadBlob } from "@/lib/quiz/export";
import { nfc, stripDiacritics } from "@/lib/text";
import type { QuizSet } from "@/lib/quiz/types";

export function WorkflowPanel({ workflow: w }: { workflow: StudentWorkflow }) {
  const { profile } = useApp();
  const [,setWorkflows] = useWorkflows(profile.id);
  const [lessons] = useLessons(profile.id);
  const [topic, setTopic] = useState(w.topic ?? "");
  const [showQuiz, setShowQuiz] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");
  const [exporting, setExporting] = useState(false);
  const patch = (value: Partial<StudentWorkflow>) => setWorkflows(all => all.map(x => x.id === w.id ? {...x,...value} : x));
  const parentStep = w.steps.find(s => s.key === "phu-huynh");
  const due = w.steps.find(s => s.key === "ket-qua")?.due;
  const draftText = parentStep?.artifact ?? parentDraft(w.loai, due);
  const quiz: QuizSet | null = w.draft ? { id:w.id, title:w.topic ?? "Kiểm tra bù", questions:w.draft.quiz, createdAt:w.createdAt } : null;
  const validUrl = (() => { try {const u=new URL(roomUrl); return ["https:","http:"].includes(u.protocol) ? u.href : ""}catch{return ""} })();
  const stepPatch = (key: string, fields: Partial<StudentWorkflow["steps"][number]>) => patch({steps:w.steps.map(s=>s.key===key?{...s,...fields}:s)});
  async function word() {
    if(!w.draft)return;setExporting(true);
    try {
      const {Document,Packer,Paragraph,TextRun}=await import("docx");
      const lines=["PHIẾU BÙ BÀI",w.topic ?? "",w.draft.summary,...w.draft.worksheet.map((x,i)=>`${i+1}. ${x}`),"KIỂM TRA BÙ",...w.draft.quiz.flatMap((q,i)=>[`${i+1}. ${q.q}`,...q.options.map((x,j)=>`${"ABCD"[j]}. ${x}`)]),"ĐÁP ÁN DÀNH CHO GIÁO VIÊN",...w.draft.quiz.map((q,i)=>`${i+1}. ${"ABCD"[q.answer]} — ${q.explain}`)];
      const blob=await Packer.toBlob(new Document({sections:[{children:lines.map(text=>new Paragraph({children:[new TextRun({text:nfc(text),font:"Arial",size:26})],spacing:{after:120}}))}]}));
      downloadBlob(blob,`${stripDiacritics(w.topic || "Bai_hoc").replace(/[^a-z0-9]+/g,"_")}_BuBai.docx`);
    }catch{toast.error("Chưa xuất được Word. Mình thử lại nhé.")}finally{setExporting(false)}
  }
  function print() {
    if(!w.draft)return;
    const win=window.open("","_blank");if(!win){toast.error("Cho phép mở cửa sổ in nhé.");return;}
    win.document.title="Phiếu bù bài";
    const style=win.document.createElement("style");style.textContent="body{font:18px Arial;line-height:1.6;padding:24px}p{white-space:pre-wrap}";win.document.head.append(style);
    for(const text of [w.topic ?? "Phiếu bù bài",w.draft.summary,...w.draft.worksheet,...w.draft.quiz.flatMap((q,i)=>[`${i+1}. ${q.q}`,...q.options.map((x,j)=>`${"ABCD"[j]}. ${x}`)])]){const p=win.document.createElement("p");p.textContent=text;win.document.body.append(p)}
    win.print();
  }
  return <Card className="space-y-4 p-4" data-workflow={w.id}>
    <div><h2 className="text-xl font-semibold">{WORKFLOW_LABELS[w.loai]}</h2><p className="text-ink-muted">{w.closedAt ? "Đã đóng" : `${w.steps.filter(s=>s.status==="xong").length}/${w.steps.length} bước đã xong`} · Nội dung luôn cần mình duyệt</p></div>
    {w.loai === "hoi-tham" && <p className="rounded-xl bg-primary-soft p-3">Ưu tiên hỏi thăm gia đình, giảm lượng bài và thống nhất thời gian theo kịp. Không suy đoán nguyên nhân hay chẩn đoán.</p>}
    {!w.closedAt && w.loai !== "hoi-tham" && <div className="space-y-3">
      <label className="block">Chọn giáo án của lớp<select className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface p-2" value={w.lessonId ?? ""} onChange={e=>{const lesson=lessons.find(l=>l.id===e.target.value);if(lesson){setTopic(lesson.title);patch({lessonId:lesson.id,topic:lesson.title,draft:undefined,generation:"cho"})}}}><option value="">Chọn bài hoặc tự gõ bên dưới</option>{lessons.filter(l=>l.request.classId===w.classId).map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
      <label className="block">Tên bài em cần bù<input className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface p-3" value={topic} onChange={e=>setTopic(nfc(e.target.value))} /></label>
      <Button variant="secondary" disabled={!topic.trim()||w.generation==="dang-lam"} onClick={()=>patch({topic:topic.trim(),lessonId:undefined,generation:"cho",draft:undefined})}>{w.generation==="dang-lam"?"Bé Bảng đang chuẩn bị…":"Chuẩn bị bản nháp"}</Button>
      {!w.topic && <p>Chưa có giáo án của lớp trong ngày em nghỉ. Mình chọn bài hoặc gõ tên để Bé Bảng chuẩn bị nhé.</p>}
    </div>}
    {w.error && <p role="alert" className="text-urgent">{w.error}</p>}
    {w.draft && <div className="space-y-4">
      <p className="rounded-xl bg-accent-soft p-3">{w.mode==="ai"?"Bản nháp AI — kiểm tra nội dung trước khi giao.":"Khung mẫu khi chưa nối Gemini. Cần bổ sung câu hỏi, đáp án và nội dung phù hợp trước khi giao."}</p>
      <label className="block font-medium">Tóm tắt bài<textarea rows={3} className="mt-2 w-full rounded-xl border border-border bg-surface p-3 font-normal" value={w.draft.summary} disabled={Boolean(w.closedAt)} onChange={e=>patch({draft:{...w.draft!,summary:nfc(e.target.value)}})} /></label>
      <label className="block font-medium">Phiếu bù bài · mỗi ý một dòng<textarea rows={4} className="mt-2 w-full rounded-xl border border-border bg-surface p-3 font-normal" value={w.draft.worksheet.join("\n")} disabled={Boolean(w.closedAt)} onChange={e=>patch({draft:{...w.draft!,worksheet:nfc(e.target.value).split("\n")}})} /></label>
      <details><summary className="flex min-h-11 cursor-pointer items-center font-semibold">Xem và sửa 5 câu kiểm tra bù</summary><div className="space-y-4">{w.draft.quiz.map((q,i)=><fieldset key={i} className="space-y-2 rounded-xl border border-border p-3"><legend>Câu {i+1}</legend><input aria-label={`Câu hỏi ${i+1}`} className="min-h-11 w-full rounded-xl border border-border bg-surface p-2" value={q.q} onChange={e=>patch({draft:{...w.draft!,quiz:w.draft!.quiz.map((x,j)=>j===i?{...x,q:nfc(e.target.value)}:x)}})} />{q.options.map((option,j)=><label key={j} className="flex min-h-11 items-center gap-2"><input type="radio" name={`${w.id}-${i}`} checked={q.answer===j} onChange={()=>patch({draft:{...w.draft!,quiz:w.draft!.quiz.map((x,k)=>k===i?{...x,answer:j}:x)}})} aria-label={`Đáp án đúng câu ${i+1}: ${"ABCD"[j]}`} />{"ABCD"[j]}<input aria-label={`Câu ${i+1} phương án ${"ABCD"[j]}`} className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface p-2" value={option} onChange={e=>patch({draft:{...w.draft!,quiz:w.draft!.quiz.map((x,k)=>k===i?{...x,options:x.options.map((v,n)=>n===j?nfc(e.target.value):v)}:x)}})} /></label>)}</fieldset>)}</div></details>
      {w.loai==="phu-dao" && <section><h3 className="font-semibold">Kế hoạch 2 tuần · 3 buổi</h3>{w.draft.sessions.map((s,i)=><p key={i} className="mt-2">{s.goal}: {s.exercise}</p>)}</section>}
      <div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={exporting} onClick={()=>void word()}>{exporting?"Đang xuất…":"Tải Word"}</Button><Button variant="secondary" onClick={print}>In phiếu và câu hỏi</Button><Button variant="secondary" onClick={()=>setShowQuiz(true)}>Chiếu kiểm tra bù</Button></div>
      <label className="block">Link phòng quiz để tạo QR<input value={roomUrl} onChange={e=>setRoomUrl(nfc(e.target.value))} placeholder="https://…" className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface p-2" /></label><p className="text-sm text-ink-muted">Dán link phòng đã tạo trên nền tảng quiz. Phòng chơi trên điện thoại của Lớp Mình đang chờ kết nối Supabase.</p>{validUrl && <div className="w-fit rounded-xl bg-surface p-4"><QRCodeSVG value={validUrl} size={180} title="Mã QR phòng kiểm tra bù" /></div>}
    </div>}
    {parentStep && <label className="block font-medium">Nháp tin phụ huynh · chưa gửi<textarea rows={4} className="mt-2 w-full rounded-xl border border-border bg-surface p-3 font-normal" value={draftText} onChange={e=>stepPatch("phu-huynh",{artifact:nfc(e.target.value)})} /><Button variant="secondary" onClick={()=>void navigator.clipboard.writeText(draftText).then(()=>toast.success("Đã chép bản nháp.")).catch(()=>toast.error("Chưa chép được; mình chọn chữ và chép thủ công nhé."))}>Chép bản nháp</Button></label>}
    <ol className="space-y-3">{w.steps.map((s,i)=><li key={s.key} className="rounded-xl border border-border p-3"><p className="font-semibold">{i+1}. {s.label}</p><div className="mt-2 flex flex-wrap gap-3"><label>Trạng thái<select className="ml-2 min-h-11 rounded-xl border border-border bg-surface p-2" value={s.status} disabled={Boolean(w.closedAt)} onChange={e=>stepPatch(s.key,{status:e.target.value as typeof s.status})}>{Object.entries({cho:"Chờ", "dang-lam":"Đang làm", xong:"Xong", "bo-qua":"Bỏ qua"}).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>Ngày hẹn<input type="date" value={s.due ?? ""} disabled={Boolean(w.closedAt)} onChange={e=>stepPatch(s.key,{due:e.target.value})} className="ml-2 min-h-11 max-w-full rounded-xl border border-border bg-surface p-2" /></label></div><label className="mt-2 block">{s.key==="ket-qua"?"Điểm hoặc nhận xét kết quả":"Ghi nhận bước này"}<input value={s.ketQua ?? ""} disabled={Boolean(w.closedAt)} onChange={e=>stepPatch(s.key,{ketQua:nfc(e.target.value)})} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface p-2" /></label></li>)}</ol>
    {!w.closedAt && <Button disabled={w.steps.some(s=>s.status!=="xong"&&s.status!=="bo-qua")} onClick={()=>patch(closeWorkflow(w,new Date().toISOString()))}>Hoàn thành quy trình</Button>}
    {showQuiz && quiz && <QuizPlayer set={quiz} onClose={()=>setShowQuiz(false)} />}
  </Card>;
}
