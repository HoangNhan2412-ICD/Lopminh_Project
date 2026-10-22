import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { THEME_BOOTSTRAP, themeAt, themeChoice } from "./theme";

describe("giờ Việt Nam và màu trước khi vẽ", () => {
  for (const zone of ["UTC", "America/New_York"]) {
    it(`đổi đúng bốn mốc khi máy ở ${zone}`, () => {
      const before = process.env.TZ;
      process.env.TZ = zone;
      try {
        for (const [time, expected] of [["05:59", "dark"], ["06:00", "light"], ["17:59", "light"], ["18:00", "dark"]]) {
          const date = new Date(`2026-10-21T${time}:00+07:00`);
          expect(themeAt("auto", date)).toBe(expected);
          const document = { documentElement: { dataset: { theme: "" } } };
          class Clock extends Date { constructor() { super(date); } }
          runInNewContext(THEME_BOOTSTRAP, { document, Date: Clock, Intl, localStorage: { getItem: () => { throw Error("storage blocked"); } } });
          expect(document.documentElement.dataset.theme).toBe(expected);
        }
      } finally { if (before === undefined) delete process.env.TZ; else process.env.TZ = before; }
    });
  }
  it("lựa chọn tay luôn thắng giờ; dữ liệu lạ trở về tự động", () => {
    expect(themeAt("light", new Date("2026-10-21T23:00:00+07:00"))).toBe("light");
    expect(themeAt("dark", new Date("2026-10-21T12:00:00+07:00"))).toBe("dark");
    expect(themeChoice("system")).toBe("auto");
  });
});

function luminance(hex: string) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
it("token chữ, nhãn, nút và quiz đạt AA cả sáng/tối", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const values = (block: string) => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/g)].map(m => [m[1], m[2]]));
  const light = values(css.match(/:root, \.presentation\[data-theme="light"\] \{([^}]+)\}/)![1]);
  const dark = { ...light, ...values(css.match(/:root\[data-theme="dark"\], \.presentation\[data-theme="dark"\] \{([^}]+)\}/)![1]) };
  const pairs = [ ["primary-fg", "primary"], ["primary-fg", "primary-hover"], ["accent-fg", "accent"], ...["bg", "surface", "surface-muted"].flatMap(bg => [["ink", bg], ["ink-muted", bg]]), ...["urgent", "homeroom", "subject", "success"].map(t => [t, `${t}-soft`]), ...["a", "b", "c", "d"].map(t => ["quiz-fg", `quiz-${t}`]) ];
  for (const [name, tokens] of [["light", light], ["dark", dark]] as const) for (const [fg, bg] of pairs) {
    const [a, b] = [luminance(tokens[fg]), luminance(tokens[bg])].sort((a, b) => b - a);
    expect((a + 0.05) / (b + 0.05), `${name}: ${fg}/${bg}`).toBeGreaterThanOrEqual(4.5);
  }
});
