import type { LessonPlan } from "@/lib/lesson/types";
import type { WorkflowDraft } from "./templates";

export function demoWorkflowDraft(topic: string, advanced: boolean, lesson?: LessonPlan): WorkflowDraft {
  const worksheet = lesson?.worksheet[advanced ? "nangCao" : "coBan"];
  return {
    summary: lesson?.objectives.kienThuc.join("\n") || `Khung ôn tập: ${topic}. Cần giáo viên bổ sung và duyệt nội dung trước khi giao.`,
    worksheet: worksheet?.length ? worksheet : [`Viết lại các ý chính của bài ${topic}.`, "Làm lại một ví dụ đã được hướng dẫn.", "Ghi điều chưa hiểu để hỏi trong buổi bù."],
    quiz: Array.from({ length: 5 }, (_, i) => lesson?.quiz[i] ? { ...lesson.quiz[i], seconds: 30, explain: lesson.quiz[i].explain ?? "" } : { q: `Câu ${i + 1}: [Giáo viên điền câu hỏi bài ${topic}]`, options: ["[Phương án A]", "[Phương án B]", "[Phương án C]", "[Phương án D]"], answer: 0, seconds: 30, explain: "Khung mẫu, cần sửa đáp án trước khi giao." }),
    sessions: [
      { goal: "Buổi 1: Nhớ lại kiến thức cần dùng", exercise: "Xem một ví dụ và làm lại theo từng bước." },
      { goal: "Buổi 2: Luyện tập có hướng dẫn", exercise: "Làm hai bài tương tự, trao đổi chỗ còn vướng." },
      { goal: "Buổi 3: Tự làm và nhận xét", exercise: "Tự làm một bài ngắn, ghi điều đã hiểu và cần hỗ trợ." },
    ],
  };
}
