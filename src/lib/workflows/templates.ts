import { z } from "zod";
import { quizQuestionSchema } from "@/lib/quiz/types";

export const workflowDraftSchema = z.object({
  summary: z.string().max(4000),
  worksheet: z.array(z.string().max(2000)).min(1).max(8),
  quiz: z.array(quizQuestionSchema).length(5),
  sessions: z.array(z.object({ goal: z.string(), exercise: z.string() })).length(3),
});
export type WorkflowDraft = z.infer<typeof workflowDraftSchema>;
export type WorkflowKind = "bu-bai" | "phu-dao" | "hoi-tham";
export const WORKFLOW_LABELS = { "bu-bai": "Bù bài khi vắng", "phu-dao": "Phụ đạo", "hoi-tham": "Hỏi thăm khi ốm nhiều ngày" };
export interface WorkflowStep {
  key: string; label: string; status: "cho" | "dang-lam" | "xong" | "bo-qua";
  due?: string; ketQua?: string; artifact?: string;
}
export interface StudentWorkflow {
  id: string; studentId: string; classId: string; loai: WorkflowKind; noteId: string; lessonId?: string;
  steps: WorkflowStep[]; createdAt: string; closedAt?: string;
  topic?: string; draft?: WorkflowDraft; mode?: "demo" | "ai";
  generation?: "cho" | "dang-lam" | "xong" | "loi"; error?: string;
}
export function template(kind: WorkflowKind, today: string, due: string): WorkflowStep[] {
  const rows = kind === "bu-bai"
    ? [["bai", "Chọn và tóm tắt bài em nghỉ"], ["phieu", "Duyệt phiếu bù bài"], ["quiz", "Duyệt kiểm tra bù 5 câu"], ["hen", "Hẹn ngày bù"], ["phu-huynh", "Duyệt nháp tin phụ huynh"], ["ket-qua", "Ghi kết quả bù"]]
    : kind === "phu-dao"
      ? [["ke-hoach", "Duyệt kế hoạch 2 tuần"], ["buoi-1", "Buổi 1: Củng cố kiến thức"], ["buoi-2", "Buổi 2: Luyện tập có hướng dẫn"], ["buoi-3", "Buổi 3: Tự làm và nhận xét"]]
      : [["giam-bai", "Giảm lượng bài phù hợp"], ["phu-huynh", "Duyệt nháp hỏi thăm gia đình"], ["theo-doi", "Ghi nhận sau khi hỏi thăm"]];
  return rows.map(([key, label]) => ({ key, label, status: "cho", due: key === "ket-qua" || key.startsWith("buoi-") ? due : today }));
}
