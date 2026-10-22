"use client";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/account/AccountProvider";
import type { LessonJob } from "@/lib/jobs/types";
import type { LessonPlan } from "@/lib/lesson/types";

export function LessonJobs({ profileId, refresh, onOpen }: { profileId: string; refresh: number; onOpen: (plan: LessonPlan) => void }) {
  const { userId } = useAccount();
  const [jobs, setJobs] = useState<LessonJob[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController(); let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      let delay = 2500;
      try {
        const res = await fetch(`/api/jobs/lesson?profileId=${encodeURIComponent(profileId)}`, { cache: "no-store", signal: controller.signal });
        if (!res.ok) throw Error("UNAVAILABLE");
        const data = await res.json();
        if (controller.signal.aborted) return;
        setJobs(data.jobs); setError("");
        delay = data.jobs.some((j: LessonJob) => ["cho", "dang-chay"].includes(j.status)) ? 2500 : 15_000;
      } catch { if (!controller.signal.aborted) setError("Tạm mất kết nối theo dõi. Bài trên server vẫn có thể đang chạy; Bé Bảng sẽ thử lại."); }
      if (!controller.signal.aborted) timer = setTimeout(poll, delay);
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [userId, profileId, refresh]);
  if (!userId || (!jobs.length && !error)) return null;
  return <section aria-label="Bài đang soạn" className="space-y-3 rounded-xl border border-border bg-surface p-4"><h2 className="text-xl font-semibold">Bài đang soạn và kết quả gần đây</h2>{error && <p role="status" className="text-urgent">{error}</p>}{jobs.map(job => <div key={job.id} className="space-y-2 rounded-xl border border-border p-3"><p aria-live="polite">{job.step} · {job.progress}%</p>{["cho", "dang-chay"].includes(job.status) && <><progress aria-label="Tiến độ soạn bài" max={100} value={job.progress} className="w-full accent-primary" /><p className="text-sm text-ink-muted">Có thể đóng trang rồi mở lại để xem kết quả.</p></>}{job.error && <p className="text-urgent">{job.error}</p>}{job.status === "xong" && job.result && <button className="min-h-11 rounded-xl bg-primary px-4 py-2 text-primary-fg" onClick={() => onOpen(job.result!)}>Xem và lưu giáo án: {job.result.title}</button>}</div>)}</section>;
}
