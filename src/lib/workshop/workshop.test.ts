import { describe, expect, it } from "vitest";
import { EXAMPLE_GRAPH, oscillatorFromText, sampleGraph, validateGraph, valueAt } from "./graph";
import { runQueue, type QueueState } from "./queue";
import { assertShareable, fileStem, visualSlide } from "./export";
import { visualSvg, type WorkshopVisual } from "./visual";
import { layoutSlide, SLIDE_H, SLIDE_W } from "@/lib/lesson/layout";
import { THEMES } from "@/lib/lesson/theme";

describe("đồ thị tính từ công thức", () => {
  it("A=5 cm, T=2 s: cực trị và điểm qua vị trí cân bằng đúng", () => {
    const g = oscillatorFromText("đồ thị li độ của dao động điều hòa, A = 5 cm, T = 2 s")!;
    expect([0, .5, 1, 1.5, 2].map(x => Math.round(valueAt(g, x) * 1e8) / 1e8)).toEqual([5, 0, -5, -0, 5]);
    const points = sampleGraph(g);
    expect(points).toHaveLength(801);
    expect(Math.max(...points.map(p => p.y))).toBe(5);
    expect(Math.min(...points.map(p => p.y))).toBe(-5);
    expect(g.xUnit).toBe("s"); expect(g.yUnit).toBe("cm");
  });
  it("không đoán đơn vị, pha hay chu kỳ bị thiếu", () => {
    for (const text of ["dao động điều hòa A=5 T=2", "dao động điều hòa A=5 cm T=2 phút", "dao động điều hòa A=5 cm T=2 s pha pi/2"]) expect(oscillatorFromText(text)).toBeNull();
    expect(() => oscillatorFromText("dao động điều hòa A=5 cm T=0 s")).toThrow();
  });
  it("các họ công thức được tính bằng hàm cố định", () => {
    expect(valueAt({ ...EXAMPLE_GRAPH, family: "linear", a: 2, b: 3 }, 4)).toBe(11);
    expect(valueAt({ ...EXAMPLE_GRAPH, family: "quadratic", a: 2, b: 3, c: 1 }, 4)).toBe(45);
    expect(valueAt({ ...EXAMPLE_GRAPH, family: "exp", a: 2, b: 1, c: 1 }, 0)).toBe(3);
    expect(valueAt({ ...EXAMPLE_GRAPH, family: "sin" }, .5)).toBeCloseTo(5);
  });
  it("từ chối khoảng, số vô hạn, hàm tràn và dao động quá dày", () => {
    for (const patch of [{ max: 0 }, { a: NaN }, { a: Infinity }, { family: "exp", b: 1000 }, { b: 1e6 }, { family: "table", rows: [] }]) expect(() => validateGraph({ ...EXAMPLE_GRAPH, ...patch })).toThrow();
  });
  it("bảng giữ đúng số liệu người dùng, không tự tạo giá trị", () => {
    expect(sampleGraph({ ...EXAMPLE_GRAPH, family: "table", rows: [{ label: "Lần 1", value: -2 }, { label: "Lần 2", value: 7 }] })).toEqual([{ x: 0, y: -2 }, { x: 1, y: 7 }]);
  });
});

describe("xuất nhiều file", () => {
  it("4 việc: 1 lỗi không làm hỏng 3 việc khác, thử lại chỉ việc lỗi", async () => {
    const rows: Record<string, QueueState<string>> = {}; const calls: string[] = [];
    const update = (id: string, state: QueueState<string>) => { rows[id] = state; };
    const jobs = ["word", "slide", "graph", "quiz"].map(id => ({ id, run: async () => { calls.push(id); if (id === "graph") throw Error("private content"); return id; } }));
    await runQueue(jobs, update);
    expect(Object.values(rows).filter(r => r.status === "xong")).toHaveLength(3);
    expect(rows.graph.message).not.toContain("private content");
    await runQueue([{ id: "graph", run: async () => "fixed" }], update);
    expect(rows.graph.status).toBe("xong"); expect(calls).toEqual(["word", "slide", "graph", "quiz"]);
  });
  it("tên file ASCII và chặn nguồn chứa tên/ghi chú riêng", () => {
    expect(fileStem("Lớp 11", "Vật Lý", "Bài 11")).toBe("Lop11_VatLy_Bai11");
    expect(() => assertShareable("Bạn Nguyễn Văn An cần bài riêng", ["Nguyễn Văn An"])).toThrow();
    expect(() => assertShareable("Ghi chú tâm lý: thông tin riêng", [])).toThrow();
    expect(() => assertShareable("Dao động điều hòa", ["Nguyễn Văn An"])).not.toThrow();
  });
  it("SVG mã hóa chữ, không chèn markup người dùng", () => {
    const svg = visualSvg({ kind: "mindmap", title: "<script>alert(1)</script>", items: ["<image href='https://example.com' />"] });
    expect(svg).not.toContain("<script>"); expect(svg).not.toContain("<image"); expect(svg).toContain("&lt;");
  });
  it("mọi hình học liệu ở trong khổ slide với mọi theme", () => {
    const visuals: WorkshopVisual[] = [{ kind: "graph", graph: EXAMPLE_GRAPH }, { kind: "mindmap", title: "Bài học", items: ["Ý 1", "Ý 2"] }, { kind: "infographic", title: "Bài học", items: ["Ý 1"] }];
    for (const visual of visuals) for (const theme of Object.values(THEMES)) {
      const els = layoutSlide(visualSlide(visual), theme, { index: 0, total: 1, lessonTitle: "Bài học" });
      expect(els.filter(e => e.kind === "visual")).toHaveLength(1);
      for (const e of els) if (e.kind !== "line") {
        expect(e.x).toBeGreaterThanOrEqual(0); expect(e.y).toBeGreaterThanOrEqual(0);
        expect(e.x + e.w).toBeLessThanOrEqual(SLIDE_W); expect(e.y + e.h).toBeLessThanOrEqual(SLIDE_H);
      }
    }
  });
});
