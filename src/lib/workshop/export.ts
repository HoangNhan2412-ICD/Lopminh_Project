"use client";
import type { LessonPlan, Slide } from "@/lib/lesson/types";
import type { TeacherProfile } from "@/lib/types";
import { nfc } from "@/lib/text";
import { visualPng, visualSvg, type WorkshopVisual } from "./visual";
import { slideSchema } from "@/lib/lesson/types";

export const OUTPUTS = [
  { id: "docx", label: "Giáo án 5512", file: ".docx" },
  { id: "pptx", label: "Slide bài giảng", file: ".pptx" },
  { id: "mindmap", label: "Sơ đồ tư duy", file: ".png + .svg" },
  { id: "graph", label: "Đồ thị / biểu đồ", file: ".png + .svg + .pptx" },
  { id: "worksheet", label: "Phiếu học tập hai tầng", file: ".docx" },
  { id: "quiz", label: "Bộ câu hỏi", file: "Wayground .xlsx, Kahoot .xlsx, Quizlet .txt" },
  { id: "infographic", label: "Infographic một trang A4", file: ".png" },
  { id: "notebook", label: "Gói NotebookLM", file: "Nguồn + câu lệnh .md" },
] as const;
export type OutputKind = typeof OUTPUTS[number]["id"];
export type Artifact = { name: string; blob: Blob };
export function fileStem(grade: string, subject: string, title: string): string {
  const ascii = (s: string) => nfc(s).normalize("NFD").replace(/\p{M}/gu, "").replace(/[đĐ]/g, "D").replace(/[^a-zA-Z0-9]+/g, "").slice(0, 60);
  return `Lop${ascii(grade.match(/\d+/)?.[0] || grade)}_${ascii(subject)}_${ascii(title) || "HocLieu"}`;
}

/** Chặn nguồn có tên trong danh sách lớp hoặc mô tả sức khỏe/tâm lý, trước khi gửi/xuất.
 * Không cố che vài từ rồi cho rằng nội dung riêng tư đã an toàn.
 */
export function assertShareable(text: string, studentNames: string[]) {
  const normalized = nfc(text).toLocaleLowerCase("vi");
  if (studentNames.some(name => normalized.includes(nfc(name).toLocaleLowerCase("vi"))) || /ghi chú (sức khỏe|tâm lý)|chẩn đoán|trầm cảm|tự hại|bệnh án/i.test(normalized)) {
    throw new Error("Nội dung có thông tin riêng của học sinh. Hãy tạo học liệu từ tên bài và kiến thức, không dùng ghi chú cá nhân.");
  }
}

export function visualSlide(visual: WorkshopVisual): Slide {
  const title = visual.kind === "graph" ? visual.graph.title : visual.title;
  return { ...slideSchema.parse({ id: `visual-${visual.kind}`, layout: "hai-cot", title }), visual };
}
export function lessonVisual(plan: LessonPlan, kind: "mindmap" | "infographic"): WorkshopVisual {
  return { kind, title: plan.title, items: [...plan.objectives.kienThuc, ...plan.activities.map(a => a.goal)].slice(0, kind === "mindmap" ? 6 : 5) };
}
async function pictureFiles(v: WorkshopVisual, stem: string): Promise<Artifact[]> {
  return [{ name: `${stem}.svg`, blob: new Blob([visualSvg(v)], { type: "image/svg+xml;charset=utf-8" }) }, { name: `${stem}.png`, blob: await (await fetch(await visualPng(v))).blob() }];
}

export async function exportWorkshop(kind: OutputKind, plan: LessonPlan, profile: TeacherProfile, stem: string, visuals: WorkshopVisual[], progress: (pct: number) => void): Promise<Artifact[]> {
  progress(10);
  if (kind === "docx") {
    const { buildDocx } = await import("@/lib/lesson/export-docx");
    return [{ name: `${stem}_GiaoAn.docx`, blob: await buildDocx(plan, profile, []) }];
  }
  if (kind === "pptx" || kind === "graph") {
    const { buildPptx } = await import("@/lib/lesson/export-pptx");
    const graph = visuals.find(v => v.kind === "graph");
    if (kind === "graph" && !graph) throw new Error("Chưa có đồ thị.");
    const pics = kind === "graph" ? await pictureFiles(graph!, `${stem}_DoThi`) : [];
    const slides = kind === "graph" ? [visualSlide(graph!)] : [...plan.slides, ...visuals.map(visualSlide)];
    return [...pics, { name: `${stem}_${kind === "graph" ? "DoThi" : "Slide"}.pptx`, blob: await buildPptx({ ...plan, slides }, { teacherName: profile.fullName, onProgress: (_, pct) => progress(pct * 100) }) }];
  }
  if (kind === "mindmap" || kind === "infographic") {
    const files = await pictureFiles(lessonVisual(plan, kind), `${stem}_${kind === "mindmap" ? "SoDoTuDuy" : "Infographic"}`);
    return kind === "infographic" ? files.filter(f => f.name.endsWith(".png")) : files;
  }
  if (kind === "worksheet") {
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const para = (text: string, bold = false) => new Paragraph({ spacing: { after: 180 }, children: [new TextRun({ text: nfc(text), bold, size: 26, font: "Be Vietnam Pro" })] });
    const children = [para(plan.title, true), para("Tầng 1 — Cốt lõi", true), ...plan.worksheet.coBan.map((s, i) => para(`${i + 1}. ${s}`)), para("Tầng 2 — Nâng cao", true), ...plan.worksheet.nangCao.map((s, i) => para(`${i + 1}. ${s}`))];
    return [{ name: `${stem}_PhieuHocTap.docx`, blob: await Packer.toBlob(new Document({ sections: [{ children }] })) }];
  }
  if (kind === "quiz") {
    const { waygroundXlsx, kahootXlsx, quizletText } = await import("@/lib/quiz/export");
    const set = { id: plan.id, title: plan.title, questions: plan.quiz.map(q => ({ ...q, seconds: 30 })), createdAt: plan.createdAt };
    return [{ name: `${stem}_Wayground.xlsx`, blob: await waygroundXlsx(set) }, { name: `${stem}_Kahoot.xlsx`, blob: await kahootXlsx(set) }, { name: `${stem}_Quizlet.txt`, blob: new Blob([quizletText(set)], { type: "text/plain;charset=utf-8" }) }];
  }
  const source = [`# ${plan.title}`, "## Nguồn học liệu (bản nháp cần giáo viên duyệt)", ...plan.objectives.kienThuc, ...plan.activities.map(a => `${a.goal}\n${a.content}`)];
  const commands = ["Video Overview: Tạo video giải thích bài dựa hoàn toàn vào nguồn này; tiếng Việt, từng ý ngắn, không thêm dữ kiện chưa có.", "Slide Deck: Tạo bộ slide để chiếu trong lớp, tối đa 5 ý mỗi trang, chữ lớn, kèm câu hỏi kiểm tra hiểu bài.", "Infographic: Tóm tắt thành một trang, tối đa 5 ý và mối liên hệ giữa các ý; giữ đúng công thức, đơn vị trong nguồn."];
  const guide = "## Cách dùng\nMở https://notebooklm.google.com, tự tạo sổ mới, tải file này làm nguồn. Chọn loại đầu ra và dán câu lệnh tương ứng. Lớp Mình không tự đăng nhập hay gửi file. Kiểm tra bản nháp trước khi chia sẻ.";
  return [{ name: `${stem}_NotebookLM.md`, blob: new Blob([nfc([...source, guide, "## Câu lệnh", ...commands].join("\n\n"))], { type: "text/markdown;charset=utf-8" }) }];
}
