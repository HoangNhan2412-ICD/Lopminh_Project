"use client";

import { nearestKahootTime, type QuizSet } from "@/lib/quiz/types";

/*
  File nhập câu hỏi cho các nền tảng quen thuộc. Wayground (Quizizz cũ) và Kahoot không có API
  công khai để tạo quiz, nên Lớp Mình xuất file đúng mẫu nhập, thầy cô tải lên là xong.
  Cột theo mẫu chính thức của từng nền tảng tại thời điểm viết; nếu nền tảng đổi mẫu,
  chỉ cần sửa ở file này.
*/

async function workbook() {
  const ExcelJS = (await import("exceljs")).default;
  return new ExcelJS.Workbook();
}

async function toBlob(wb: Awaited<ReturnType<typeof workbook>>): Promise<Blob> {
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** Wayground: Question Text | Question Type | Option 1..5 | Correct Answer | Time in seconds | Image Link | Answer explanation */
export async function waygroundXlsx(set: QuizSet): Promise<Blob> {
  const wb = await workbook();
  const ws = wb.addWorksheet("Sheet1");
  ws.addRow([
    "Question Text",
    "Question Type",
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Option 5",
    "Correct Answer",
    "Time in seconds",
    "Image Link",
    "Answer explanation",
  ]);
  for (const q of set.questions) {
    ws.addRow([q.q, "Multiple Choice", ...q.options, "", q.answer + 1, q.seconds, "", q.explain]);
  }
  ws.getRow(1).font = { bold: true };
  ws.columns.forEach((c, i) => (c.width = i === 0 ? 60 : i < 7 ? 28 : 16));
  return toBlob(wb);
}

/** Kahoot: tiêu đề cột ở dòng 8, dữ liệu từ dòng 9, cột B→H như mẫu "Kahoot! Quiz Import Template". */
export async function kahootXlsx(set: QuizSet): Promise<Blob> {
  const wb = await workbook();
  const ws = wb.addWorksheet("Sheet1");
  ws.getCell("B2").value = "Quiz template";
  ws.getCell("B3").value = set.title;
  ws.getCell("B4").value = "Tạo bởi Lớp Mình. Câu hỏi tối đa 120 ký tự, đáp án tối đa 75 ký tự.";
  const header = [
    "",
    "Question - max 120 characters",
    "Answer 1 - max 75 characters",
    "Answer 2 - max 75 characters",
    "Answer 3 - max 75 characters",
    "Answer 4 - max 75 characters",
    "Time limit (sec) – 5, 10, 20, 30, 60, 90, 120, or 240 secs",
    "Correct answer(s) - choose at least one",
  ];
  ws.getRow(8).values = header;
  ws.getRow(8).font = { bold: true };
  set.questions.forEach((q, i) => {
    ws.getRow(9 + i).values = [i + 1, q.q.slice(0, 120), ...q.options.map((o) => o.slice(0, 75)), nearestKahootTime(q.seconds), String(q.answer + 1)];
  });
  ws.columns.forEach((c, i) => (c.width = i === 0 ? 5 : i === 1 ? 60 : 26));
  return toBlob(wb);
}

/** Quizlet: mỗi thẻ một dòng, Tab giữa thuật ngữ và định nghĩa (dán vào ô Nhập của Quizlet). */
export function quizletText(set: QuizSet): string {
  return set.questions
    .map((q) => `${q.q.replace(/\s+/g, " ")}\t${q.options[q.answer]}${q.explain ? ` — ${q.explain}` : ""}`.replace(/\n/g, " "))
    .join("\n");
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
