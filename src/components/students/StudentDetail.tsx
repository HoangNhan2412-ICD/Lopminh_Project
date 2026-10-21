"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { useApp } from "@/lib/store/app-store";
import { useWorkflows } from "@/lib/workflows/store";
import { WorkflowPanel } from "./WorkflowPanel";
import { Card, Button } from "@/components/ui";
export function StudentDetail() {
  const params=useSearchParams();
  const {profile,students,notes,classes,removeNote}=useApp();
  const [workflows]=useWorkflows(profile.id);
  const student=students.find(s=>s.id===params.get("id"));
  if(!student)return <div><h1>Chưa tìm thấy học sinh trong hồ sơ này</h1><Link href="/" className="inline-flex min-h-11 items-center text-primary">Về Hôm Nay</Link></div>;
  const homeroom=classes.find(c=>c.id===student.classId)?.role==="chu-nhiem";
  const ownNotes=notes.filter(n=>n.studentId===student.id&&(homeroom||!["suc-khoe","tam-ly"].includes(n.kind))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const ownWorkflows=workflows.filter(w=>w.studentId===student.id).sort((a,b)=>Number(Boolean(a.closedAt))-Number(Boolean(b.closedAt)));
  return <div className="space-y-5"><Link href="/" className="inline-flex min-h-11 items-center text-primary">← Về Hôm Nay</Link><h1 className="text-2xl font-semibold">{student.fullName}</h1><p className="text-ink-muted">Ghi chú, ảnh minh chứng và những việc đang làm cho em.</p>
    {ownWorkflows.map(w=><WorkflowPanel key={w.id} workflow={w} />)}
    {!ownWorkflows.length&&<p>Chưa có quy trình cho em.</p>}
    <Card className="space-y-4 p-5"><h2 className="text-xl font-semibold">Dòng thời gian ghi chú</h2>{ownNotes.map(n=><article key={n.id} className="border-t border-border pt-3"><div className="flex items-center justify-between gap-2"><p className="text-sm text-ink-muted">{new Date(n.createdAt).toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"})}</p><Button variant="ghost" aria-label="Xóa ghi chú này" onClick={()=>{if(window.confirm("Xóa ghi chú và ảnh đính kèm trên máy này?"))removeNote(n.id)}}>Xóa</Button></div>{["suc-khoe","tam-ly"].includes(n.kind)&&<p className="flex items-center gap-2 text-sm text-ink-muted"><LockKeyhole className="size-4" />Riêng tư · không đưa vào tin phụ huynh</p>}<p>{n.text}</p>{n.evidence?.map((src,i)=><div key={i} className="mt-2">{/* eslint-disable-next-line @next/next/no-img-element -- ảnh dữ liệu cục bộ */}
<img src={src} alt={`Ảnh minh chứng bài làm ${i+1}`} className="max-h-80 max-w-full rounded-xl object-contain" /></div>)}</article>)}{!ownNotes.length&&<p>Chưa có ghi chú.</p>}</Card>
  </div>;
}
