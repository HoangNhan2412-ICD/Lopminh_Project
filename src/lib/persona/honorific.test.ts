import { describe, expect, it } from "vitest";
import { DEMO_CLASSES, DEMO_PROFILES, DEMO_STUDENTS, demoNotes } from "@/lib/demo/data";
import { greetingLines } from "@/lib/persona/greetings";
import { addressOf, defaultCallName, fixAddress, getHonorific, honorificLower } from "@/lib/persona/honorific";
import { profileBlock } from "@/lib/ai/prompts";

const [hoa, nam, phuong] = DEMO_PROFILES;

describe("danh xưng", () => {
  it("lấy theo giới tính", () => {
    expect(getHonorific(hoa)).toBe("Cô");
    expect(getHonorific(nam)).toBe("Thầy");
    expect(addressOf(hoa)).toBe("Cô Mai Hoa");
    expect(addressOf(nam)).toBe("Thầy Nam");
    expect(honorificLower(nam)).toBe("thầy");
  });

  it("tôn trọng danh xưng riêng", () => {
    expect(addressOf({ ...hoa, honorificOverride: "Cô giáo" })).toBe("Cô giáo Mai Hoa");
  });

  it("tên gọi mặc định là chữ cuối", () => {
    expect(defaultCallName("Nguyễn Thị Mai Hoa")).toBe("Hoa");
  });
});

describe("fixAddress — sửa danh xưng sai do AI sinh ra", () => {
  it("sửa 'Thầy Hoa' thành 'Cô Hoa' cho cô giáo", () => {
    expect(fixAddress("Chào Thầy Mai Hoa, thầy Hoa ơi!", hoa)).toBe("Chào Cô Mai Hoa, cô Hoa ơi!");
  });

  it("sửa 'Cô Nam' thành 'Thầy Nam' cho thầy giáo", () => {
    expect(fixAddress("Cô Nam vất vả quá", nam)).toBe("Thầy Nam vất vả quá");
  });

  it("không đụng tới tên người khác", () => {
    const s = "Thầy Bình dạy Hóa, cô Lan chủ nhiệm";
    expect(fixAddress(s, hoa)).toBe(s);
  });

  it("không đụng chữ 'cô' đứng một mình", () => {
    expect(fixAddress("cô ơi, thầy ơi", hoa)).toBe("cô ơi, thầy ơi");
  });
});

/** Lỗi gốc ở V3.5: chuyển Cô Mai Hoa → Thầy Nam thì Bé Bảng gọi "Thầy Hoa". */
describe("đổi hồ sơ liên tục không lẫn danh xưng", () => {
  it("10 vòng Hoa → Nam → Phương: lời chào, prompt đều đúng người", () => {
    const today = "2026-10-20";
    for (let round = 0; round < 10; round++) {
      for (const p of [hoa, nam, phuong]) {
        const classes = DEMO_CLASSES[p.id];
        const ids = new Set(classes.map((c) => c.id));
        const { title, body } = greetingLines({
          profile: p,
          hour: 7,
          classes,
          students: DEMO_STUDENTS.filter((s) => ids.has(s.classId)),
          notes: demoNotes(p.id, today),
          next: null,
          live: null,
        });
        const text = `${title} ${body} ${profileBlock(p)}`;
        expect(text).toContain(addressOf(p));
        for (const other of DEMO_PROFILES.filter((o) => o.id !== p.id)) {
          // Không còn sót tên của hồ sơ trước, dù với danh xưng nào
          expect(text).not.toContain(`Thầy ${other.callName}`);
          expect(text).not.toContain(`Cô ${other.callName}`);
        }
        const wrong = getHonorific(p) === "Cô" ? "Thầy" : "Cô";
        expect(text).not.toContain(`${wrong} ${p.callName}`);
      }
    }
  });
});
