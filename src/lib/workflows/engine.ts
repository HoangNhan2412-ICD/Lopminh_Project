import type { Student, StudentNote } from "@/lib/types";
import { stripDiacritics } from "@/lib/text";
import { vnNow } from "@/lib/time";
import { template, type StudentWorkflow, type WorkflowKind } from "./templates";

export function schoolDaysAfter(date: string, count: number, weekdays = [1, 2, 3, 4, 5]) {
  const d = new Date(`${date}T12:00:00Z`);
  const days = weekdays.length ? weekdays : [1, 2, 3, 4, 5];
  for (let n = 0; n < count;) { d.setUTCDate(d.getUTCDate() + 1); if (days.includes(d.getUTCDay())) n++; }
  return d.toISOString().slice(0, 10);
}

export function openWorkflow(all: StudentWorkflow[], student: Student, kind: WorkflowKind, noteId: string, now: string, weekdays?: number[]) {
  const day = vnNow(new Date(now)).date;
  if (all.some(w => w.studentId === student.id && w.classId === student.classId && w.loai === kind && (kind === "bu-bai" ? vnNow(new Date(w.createdAt)).date === day : !w.closedAt))) return all;
  const due = schoolDaysAfter(day, 3, weekdays);
  const workflow: StudentWorkflow = { id: `wf-${student.id}-${kind}-${day}`, studentId: student.id, classId: student.classId, loai: kind, noteId, createdAt: now, steps: template(kind, day, due), generation: "cho" };
  if (kind === "phu-dao") workflow.steps.forEach((s, i) => { if (i) s.due = schoolDaysAfter(day, i * 3, weekdays); });
  return [...all, workflow];
}

/** Dùng cho nút vắng, ghi nhanh và giọng nói: cùng một nguồn ghi chú. */
export function syncAbsences(all: StudentWorkflow[], students: Student[], notes: StudentNote[], today: string, weekdays?: number[]) {
  let next = all;
  for (const note of notes) {
    if (!note.absentToday || vnNow(new Date(note.createdAt)).date !== today) continue;
    const student = students.find(s => s.id === note.studentId && s.classId === note.classId);
    if (student) next = openWorkflow(next, student, "bu-bai", note.id, note.createdAt, weekdays);
  }
  for (const student of students) {
    const latest = notes.filter(n => n.studentId === student.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt))[0];
    const now = `${today}T23:59:59+07:00`;
    for (const kind of suggestions(student, notes, now)) {
      // Một gợi ý đang chờ duyệt; đóng rồi không tự mở lại cùng ngày.
      if (next.some(w => w.studentId === student.id && w.loai === kind && (vnNow(new Date(w.createdAt)).date === today || w.noteId === (latest?.id ?? "")))) continue;
      next = openWorkflow(next, student, kind, latest?.id ?? "", `${today}T00:00:00+07:00`, weekdays);
    }
  }
  return next;
}

export function suggestions(student: Student, notes: StudentNote[], now: string): WorkflowKind[] {
  const cutoff = Date.parse(now) - 14 * 86400000;
  const recent = notes.filter(n => n.studentId === student.id && n.classId === student.classId && Date.parse(n.createdAt) >= cutoff && Date.parse(n.createdAt) <= Date.parse(now));
  const weak = recent.filter(n => n.kind === "hoc-tap" && /yeu|chua hieu|chua lam bai|hong kien thuc|duoi trung binh/.test(stripDiacritics(n.text)));
  const sick = new Set(recent.filter(n => n.kind === "suc-khoe" && n.absentToday).map(n => vnNow(new Date(n.createdAt)).date));
  const today = vnNow(new Date(now)).date;
  const yesterday = new Date(`${today}T12:00:00Z`); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const result: WorkflowKind[] = [];
  if (student.noiBat?.loai === "can-ho-tro" || weak.length >= 3) result.push("phu-dao");
  if (sick.has(today) && sick.has(yesterday.toISOString().slice(0, 10))) result.push("hoi-tham");
  return result;
}

/** Không nhận ghi chú hoặc hồ sơ: không thể vô tình ghép dữ liệu sức khỏe/tâm lý. */
export function parentDraft(kind: WorkflowKind, due?: string) {
  return kind === "hoi-tham"
    ? "Kính gửi gia đình, tôi muốn hỏi thăm tình hình của em và trao đổi cách hỗ trợ học tập phù hợp. Gia đình phản hồi khi thuận tiện nhé. Tôi sẽ điều chỉnh lượng bài để em theo kịp dần."
    : `Kính gửi gia đình, tôi đã chuẩn bị phiếu ôn tập và bài kiểm tra ngắn cho em. Nhờ gia đình hỗ trợ em sắp xếp thời gian hoàn thành${due ? ` trước ngày ${due.split("-").reverse().join("/")}` : ""}. Tôi sẽ xem bài và hướng dẫn thêm. Cảm ơn gia đình.`;
}

export function closeWorkflow(w: StudentWorkflow, now: string, cancel = false): StudentWorkflow {
  if (!cancel && w.steps.some(s => s.status !== "xong" && s.status !== "bo-qua")) return w;
  return { ...w, closedAt: now, steps: cancel ? w.steps.map(s => s.status === "xong" ? s : { ...s, status: "bo-qua" }) : w.steps };
}

export function attendanceDecision(studentId: string, all: StudentWorkflow[], today: string) {
  return all.some(w => w.studentId === studentId && w.loai === "bu-bai" && !w.closedAt && vnNow(new Date(w.createdAt)).date === today) ? "confirm-cancel" : "present";
}
