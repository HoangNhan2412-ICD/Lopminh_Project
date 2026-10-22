import type { LessonPlan } from "@/lib/lesson/types";
export interface LessonJob {
  id: string; profile_id: string; status: "cho" | "dang-chay" | "xong" | "loi";
  progress: number; step: string; result: LessonPlan | null; error: string | null; created_at: string;
}
export const JOB_TIMEOUT_MS = 300_000;
export function jobExpired(job: Pick<LessonJob, "status" | "created_at">, now = Date.now()) {
  return ["cho", "dang-chay"].includes(job.status) && now - Date.parse(job.created_at) > JOB_TIMEOUT_MS;
}
