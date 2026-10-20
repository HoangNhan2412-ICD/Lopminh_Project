import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { kahootXlsx, quizletText, waygroundXlsx } from "@/lib/quiz/export";
import { nearestKahootTime, type QuizSet } from "@/lib/quiz/types";

const set: QuizSet = {
  id: "q1",
  title: "Căn bậc hai",
  createdAt: "2026-10-20",
  questions: [
    { q: "√16 bằng bao nhiêu?", options: ["2", "4", "8", "16"], answer: 1, explain: "Vì 4² = 16", seconds: 20 },
    { q: "√(A²) bằng?", options: ["A", "−A", "|A|", "A²"], answer: 2, explain: "", seconds: 45 },
  ],
};

async function read(blob: Blob) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await blob.arrayBuffer());
  return wb.worksheets[0];
}

describe("file nhập quiz", () => {
  it("Wayground: cột đúng mẫu, đáp án đánh số từ 1", async () => {
    const ws = await read(await waygroundXlsx(set));
    expect(ws.getRow(1).getCell(1).value).toBe("Question Text");
    expect(ws.getRow(1).getCell(8).value).toBe("Correct Answer");
    expect(ws.getRow(2).getCell(1).value).toBe("√16 bằng bao nhiêu?");
    expect(ws.getRow(2).getCell(8).value).toBe(2);
    expect(ws.getRow(3).getCell(8).value).toBe(3);
  });

  it("Kahoot: dữ liệu từ dòng 9, thời gian làm tròn về mức Kahoot cho phép", async () => {
    const ws = await read(await kahootXlsx(set));
    expect(String(ws.getRow(8).getCell(2).value)).toMatch(/^Question/);
    expect(ws.getRow(9).getCell(2).value).toBe("√16 bằng bao nhiêu?");
    expect(ws.getRow(9).getCell(8).value).toBe("2");
    expect(ws.getRow(10).getCell(7).value).toBe(nearestKahootTime(45));
    expect([30, 60]).toContain(nearestKahootTime(45));
  });

  it("Quizlet: Tab giữa câu và đáp án, mỗi thẻ một dòng", () => {
    const lines = quizletText(set).split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("√16 bằng bao nhiêu?\t4 — Vì 4² = 16");
    expect(lines[1]).toBe("√(A²) bằng?\t|A|");
  });
});
