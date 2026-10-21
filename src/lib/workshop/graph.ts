import { z } from "zod";
import { nfc } from "@/lib/text";

const number = z.number().finite().min(-1e6).max(1e6);
const label = z.string().min(1).max(60);
export const graphSchema = z.object({
  family: z.enum(["linear", "quadratic", "sin", "cos", "exp", "table"]),
  title: z.string().min(1).max(120),
  xLabel: label, yLabel: label,
  xUnit: z.string().max(16), yUnit: z.string().max(16),
  min: number, max: number,
  a: number, b: number, c: number,
  rows: z.array(z.object({ label: z.string().min(1).max(24), value: number })).max(24),
});
export type Graph = z.infer<typeof graphSchema>;
export type Point = { x: number; y: number };

/** y=ax+b; y=ax²+bx+c; y=a sin/cos(bx+c); y=a exp(bx)+c. */
export function valueAt(g: Graph, x: number): number {
  switch (g.family) {
    case "linear": return g.a * x + g.b;
    case "quadratic": return g.a * x * x + g.b * x + g.c;
    case "sin": return g.a * Math.sin(g.b * x + g.c);
    case "cos": return g.a * Math.cos(g.b * x + g.c);
    case "exp": return g.a * Math.exp(g.b * x) + g.c;
    case "table": throw new Error("Bảng số liệu không dùng công thức.");
  }
}

export function validateGraph(input: unknown): Graph {
  const parsed = graphSchema.safeParse(input);
  if (!parsed.success) throw new Error("Tham số chưa hợp lệ. Hãy kiểm tra số, tên trục và đơn vị.");
  const g = parsed.data;
  if (g.family === "table") {
    if (!g.rows.length) throw new Error("Cần nhập ít nhất một dòng số liệu thật.");
  } else {
    if (g.max <= g.min || g.max - g.min < 1e-6) throw new Error("Điểm cuối phải lớn hơn điểm đầu; khoảng vẽ tối thiểu 0,000001.");
    if (["sin", "cos"].includes(g.family) && Math.abs(g.b * (g.max - g.min)) > 80 * Math.PI) throw new Error("Khoảng vẽ chứa quá 40 chu kỳ. Hãy thu hẹp khoảng để nhìn rõ dao động.");
    for (let i = 0; i <= 800; i++) {
      const y = valueAt(g, g.min + (g.max - g.min) * i / 800);
      if (!Number.isFinite(y) || Math.abs(y) > 1e9) throw new Error("Giá trị vượt khoảng vẽ an toàn. Hãy giảm tham số hoặc khoảng vẽ.");
    }
  }
  for (const k of ["title", "xLabel", "yLabel", "xUnit", "yUnit"] as const) g[k] = nfc(g[k]);
  return g;
}

export function sampleGraph(input: Graph): Point[] {
  const g = validateGraph(input);
  return g.family === "table" ? g.rows.map((r, x) => ({ x, y: r.value })) : Array.from({ length: 801 }, (_, i) => {
    const x = g.min + (g.max - g.min) * i / 800;
    return { x, y: valueAt(g, x) };
  });
}

/** Chỉ nhận mẫu đủ A, T, đúng đơn vị; mọi yêu cầu khác cần sửa tay/Gemini. */
export function oscillatorFromText(text: string): Graph | null {
  const t = nfc(text);
  if (!/dao động điều hòa|dao dong dieu hoa/i.test(t)) return null;
  const a = t.match(/\bA\s*=\s*(\d+(?:[.,]\d+)?)\s*(cm|mm|m)\b/i);
  const period = t.match(/\bT\s*=\s*(\d+(?:[.,]\d+)?)\s*(s|giây)\b/i);
  if (!a || !period || /pha|φ|sin\s*\(/i.test(t)) return null;
  const amplitude = Number(a[1].replace(",", "."));
  const seconds = Number(period[1].replace(",", "."));
  if (seconds <= 0 || amplitude <= 0) throw new Error("Biên độ và chu kỳ phải lớn hơn 0.");
  return validateGraph({ family: "cos", title: "Li độ theo thời gian (pha ban đầu 0)", xLabel: "Thời gian", yLabel: "Li độ", xUnit: "s", yUnit: a[2].toLowerCase(), min: 0, max: 2 * seconds, a: amplitude, b: 2 * Math.PI / seconds, c: 0, rows: [] });
}

export const EXAMPLE_GRAPH = oscillatorFromText("dao động điều hòa, A = 5 cm, T = 2 s")!;
