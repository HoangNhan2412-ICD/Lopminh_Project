"use client";
import Link from "next/link";
import { Card, buttonCls } from "@/components/ui";
import { useApp } from "@/lib/store/app-store";
import { useWorkflows } from "@/lib/workflows/store";
export function StudentTasks(){
 const {profile,students,today}=useApp();const [workflows]=useWorkflows(profile.id);
 const due=workflows.filter(w=>!w.closedAt).flatMap(w=>w.steps.filter(s=>s.due&&s.due<=today&&s.status!=="xong"&&s.status!=="bo-qua").slice(0,1).map(step=>({w,step})));
 return <Card className="space-y-3 p-5"><h2 className="text-xl font-semibold">Việc cho từng em hôm nay</h2>{due.map(({w,step})=><div key={w.id} className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{students.find(s=>s.id===w.studentId)?.fullName ?? "Học sinh"}</p><p>{step.label} · {step.due}</p></div><Link href={`/hoc-sinh?id=${encodeURIComponent(w.studentId)}&workflow=${encodeURIComponent(w.id)}`} className={buttonCls("secondary","md","shrink-0")}>Làm tiếp</Link></div>)}{!due.length&&<p className="text-ink-muted">Chưa có việc đến hạn cho từng em.</p>}</Card>
}
