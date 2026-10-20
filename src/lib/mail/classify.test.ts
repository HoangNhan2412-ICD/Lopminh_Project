import { describe, expect, it } from "vitest";
import { demoMails } from "@/lib/demo/mail";
import { classifyFallback } from "@/lib/mail/classify";

const classes = [
  { id: "9A", name: "9A", role: "chu-nhiem" as const },
  { id: "9C", name: "9C", role: "bo-mon" as const },
];

describe("lọc thư theo từ khóa (khi chưa có Gemini)", () => {
  const today = "2026-10-20";
  const mails = demoMails("gv-mai-hoa", today);
  const by = (id: string) => classifyFallback(mails.find((m) => m.id === id)!, classes, today);

  it("thư quảng cáo bị gạt", () => {
    expect(by("m-spam-1").label).toBe("khong-lien-quan");
    expect(by("m-spam-2").label).toBe("khong-lien-quan");
  });
  it("thư BGH là khẩn và bắt được hạn chót", () => {
    const r = by("m-bgh-1");
    expect(r.label).toBe("khan");
    expect(r.deadline).toBe("2026-10-22");
  });
  it("tin phụ huynh nhận đúng nhãn và đúng lớp", () => {
    const r = by("m-ph-1");
    expect(r.label).toBe("phu-huynh");
    expect(r.classId).toBe("9A");
  });
  it("thư học sinh lớp bộ môn gắn đúng lớp", () => {
    expect(by("m-bm-1").classId).toBe("9C");
  });
});
