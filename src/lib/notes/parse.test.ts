import { describe, expect, it } from "vitest";
import { DEMO_STUDENTS } from "@/lib/demo/data";
import { guessKind, parseNotesFallback, splitSegments } from "@/lib/notes/parse";
import { stripDiacritics } from "@/lib/text";

const roster9A = DEMO_STUDENTS.filter((s) => s.classId === "9A");

describe("bỏ dấu", () => {
  it("đổi đ thành d", () => {
    expect(stripDiacritics("Đạt Tâm Hòa")).toBe("dat tam hoa");
  });
});

describe("bộ tách ghi chú dự phòng", () => {
  it("tách theo dòng và chấm phẩy", () => {
    expect(splitSegments("An nghỉ ốm; Tâm cần giảng lại\nChi buồn")).toHaveLength(3);
  });

  it("đoán loại ghi chú", () => {
    expect(guessKind("nghỉ ốm sốt")).toBe("suc-khoe");
    expect(guessKind("hôm nay buồn, không tập trung")).toBe("tam-ly");
    expect(guessKind("cần giảng lại công thức căn bậc hai")).toBe("hoc-tap");
    expect(guessKind("đạt IELTS 4.0, tiến bộ nhanh")).toBe("khen-thuong");
  });

  it("khớp đúng học sinh và ngày hết tuần", () => {
    const notes = parseNotesFallback("Em An nghỉ ốm sốt đến hết tuần\nTâm cần giảng lại căn bậc hai", roster9A, "2026-10-20");
    expect(notes[0]).toMatchObject({ studentId: "9A-1", kind: "suc-khoe", absentToday: true, until: "2026-10-24" });
    expect(notes[1]).toMatchObject({ studentId: "9A-8", kind: "hoc-tap" });
    expect(notes[1].text).not.toMatch(/^Tâm/);
  });

  it("không đoán bừa khi tên không có trong lớp", () => {
    const [n] = parseNotesFallback("em Quỳnh đi muộn", roster9A, "2026-10-20");
    expect(n.studentId).toBeNull();
    expect(n.rawName).toBe("Quỳnh");
  });
});
