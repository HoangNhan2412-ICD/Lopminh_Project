import { describe, expect, it } from "vitest";
import { DEMO_NOTES_FOR_TEST, fixtureRequest } from "@/lib/lesson/test-fixtures";
import { fallbackPlan, polishPlan, suggestTiers } from "@/lib/lesson/build";
import { SLIDE_H, SLIDE_W, fitSize, layoutSlide } from "@/lib/lesson/layout";
import { THEMES } from "@/lib/lesson/theme";
import { SLIDE_LAYOUTS, slideSchema } from "@/lib/lesson/types";
import { DEMO_STUDENTS } from "@/lib/demo/data";

const LONG = "Một câu rất dài để thử xem chữ có bị tràn ra ngoài khung hay không khi giáo viên gõ nhiều";

describe("dàn trang slide", () => {
  it("mọi bố cục, mọi theme: phần tử nằm trong khổ slide", () => {
    for (const layout of SLIDE_LAYOUTS) {
      const slide = slideSchema.parse({
        id: "x",
        layout,
        title: LONG,
        bullets: [LONG, LONG, LONG, LONG, LONG, LONG],
        leftTitle: "Trái",
        left: [LONG, LONG],
        rightTitle: "Phải",
        right: [LONG],
        highlight: LONG,
        caption: LONG,
        minutes: 7,
        product: LONG,
        question: { q: LONG, options: [LONG, "B", "C", "D"], answer: 1 },
        englishCue: "Work in pairs (Làm việc theo cặp)",
      });
      for (const theme of Object.values(THEMES)) {
        for (const e of layoutSlide(slide, theme, { index: 2, total: 10, lessonTitle: "Bài thử", quizUrl: "https://example.com" })) {
          if (e.kind === "line") {
            for (const [x, y] of [[e.x1, e.y1], [e.x2, e.y2]]) {
              expect(x, `${layout} line x`).toBeGreaterThanOrEqual(-0.01);
              expect(x, `${layout} line x`).toBeLessThanOrEqual(SLIDE_W + 0.01);
              expect(y, `${layout} line y`).toBeGreaterThanOrEqual(-0.01);
              expect(y, `${layout} line y`).toBeLessThanOrEqual(SLIDE_H + 0.01);
            }
            continue;
          }
          expect(e.x, `${layout} ${e.kind} x`).toBeGreaterThanOrEqual(-0.01);
          expect(e.y, `${layout} ${e.kind} y`).toBeGreaterThanOrEqual(-0.01);
          expect(e.x + e.w, `${layout} ${e.kind} phải`).toBeLessThanOrEqual(SLIDE_W + 0.01);
          expect(e.y + e.h, `${layout} ${e.kind} dưới`).toBeLessThanOrEqual(SLIDE_H + 0.01);
          if (e.kind === "text") expect(e.size, `${layout} cỡ chữ`).toBeGreaterThanOrEqual(10);
        }
      }
    }
  });

  it("chữ dài thì cỡ chữ nhỏ lại, chữ ngắn giữ cỡ lớn", () => {
    expect(fitSize("Ngắn", 6, 1, 36)).toBe(36);
    expect(fitSize(LONG.repeat(4), 6, 1, 36)).toBeLessThan(24);
  });
});

describe("giáo án", () => {
  it("giáo án khung qua bước làm sạch: bìa đầu, dặn dò cuối, có slide mã QR, 4 hoạt động đúng thứ tự", () => {
    const r = fixtureRequest();
    const plan = polishPlan(fallbackPlan(r), r);
    expect(plan.slides[0].layout).toBe("bia");
    expect(plan.slides.at(-1)?.layout).toBe("dan-do");
    expect(plan.slides.some((s) => s.layout === "ma-qr")).toBe(true);
    expect(plan.activities.map((a) => a.key)).toEqual(["khoi-dong", "hinh-thanh", "luyen-tap", "van-dung"]);
    expect(plan.activities.reduce((n, a) => n + a.minutes, 0)).toBe(r.minutes);
    expect(new Set(plan.slides.map((s) => s.id)).size).toBe(plan.slides.length);
  });

  it("slide quá 5 ý được tách đôi", () => {
    const r = fixtureRequest();
    const base = fallbackPlan(r);
    base.slides[1] = { ...base.slides[1], bullets: ["1", "2", "3", "4", "5", "6", "7"] };
    const plan = polishPlan(base, r);
    expect(plan.slides.every((s) => s.layout === "so-do" || s.bullets.length <= 5)).toBe(true);
  });

  it("xếp tầng theo ghi chú thật: em cần giảng lại vào Cơ bản", () => {
    const roster = DEMO_STUDENTS.filter((s) => s.classId === "9A");
    const tiers = suggestTiers(roster, DEMO_NOTES_FOR_TEST);
    expect(tiers.coBan).toContain("9A-8");
    expect(tiers.coBan.length + tiers.nangCao.length).toBe(roster.length);
  });
});
