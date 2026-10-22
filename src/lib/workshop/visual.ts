import type { Graph } from "./graph";
import { sampleGraph } from "./graph";
import { THEMES } from "@/lib/lesson/theme";

export type WorkshopVisual = { kind: "graph"; graph: Graph } | { kind: "mindmap" | "infographic"; title: string; items: string[] };
export function visualSize(v: WorkshopVisual) { return v.kind === "infographic" ? { width: 840, height: 1188 } : { width: 1200, height: 600 }; }
const palette = THEMES["giay-kem"];
const escape = (s: string) => s.normalize("NFC").replace(/[<>&"']/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
function text(s: string, x: number, y: number, size = 24, anchor = "start", color = palette.text) {
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="#${color}">${escape(s)}</text>`;
}
function wrapped(s: string, x: number, y: number, chars: number, lines: number, size = 24) {
  const words = s.split(/\s+/); const out: string[] = []; let line = "";
  for (const word of words) {
    if ((line + " " + word).length > chars && line) { out.push(line); line = ""; }
    line += (line ? " " : "") + word;
  }
  if (line) out.push(line);
  return out.slice(0, lines).map((l, i) => text(l.slice(0, chars) + (i === lines - 1 && out.length > lines ? "…" : ""), x, y + i * size * 1.3, size)).join("");
}

/** SVG chỉ do code sinh ra: không nhận markup, URL hay tọa độ từ AI. */
export function visualSvg(v: WorkshopVisual): string {
  const { width, height } = visualSize(v);
  let body = `<rect width="100%" height="100%" fill="#${palette.bg}"/>`;
  if (v.kind === "graph") {
    const g = v.graph, points = sampleGraph(g);
    const ys = points.map(p => p.y), lo = Math.min(0, ...ys), hi = Math.max(0, ...ys);
    const span = hi - lo || 1, ymin = lo - span * .1, ymax = hi + span * .1;
    const xmin = g.family === "table" ? -.5 : g.min, xmax = g.family === "table" ? Math.max(.5, points.length - .5) : g.max;
    const X = (x: number) => 120 + (x - xmin) / (xmax - xmin) * 1000;
    const Y = (y: number) => 480 - (y - ymin) / (ymax - ymin) * 350;
    body += wrapped(g.title, 120, 42, 68, 2, 28);
    body += text(`${g.yLabel}${g.yUnit ? ` (${g.yUnit})` : ""}`, 120, 110, 20);
    for (let i = 0; i <= 4; i++) {
      const y = ymin + (ymax - ymin) * i / 4;
      body += `<path d="M120 ${Y(y)} H1120" stroke="#${palette.line}"/>` + text(Number(y.toPrecision(4)).toString(), 105, Y(y) + 7, 18, "end");
      if (g.family !== "table") { const x = xmin + (xmax - xmin) * i / 4; body += text(Number(x.toPrecision(4)).toString(), X(x), 515, 20, "middle"); }
    }
    body += `<path d="M120 130 V480 H1120 M120 ${Y(0)} H1120" fill="none" stroke="#${palette.text}" stroke-width="2"/>`;
    if (g.family === "table") {
      const bw = Math.min(100, 800 / points.length);
      points.forEach((p, i) => {
        body += `<rect x="${X(p.x) - bw / 2}" y="${Math.min(Y(0), Y(p.y))}" width="${bw}" height="${Math.max(.5, Math.abs(Y(0) - Y(p.y)))}" fill="#${palette.accent}"/>`;
        body += `<g transform="translate(${X(p.x)},510) rotate(35)">${text(g.rows[i].label, 0, 0, Math.min(20, 280 / points.length))}</g>`;
      });
    } else body += `<polyline points="${points.map(p => `${X(p.x).toFixed(3)},${Y(p.y).toFixed(3)}`).join(" ")}" fill="none" stroke="#${palette.accent}" stroke-width="4"/>`;
    body += text(`${g.xLabel}${g.xUnit ? ` (${g.xUnit})` : ""}`, 1120, 585, 20, "end");
  } else if (v.kind === "mindmap") {
    body += `<rect x="425" y="235" width="350" height="130" rx="20" fill="#${palette.panel}" stroke="#${palette.accent}" stroke-width="3"/>` + wrapped(v.title, 445, 275, 22, 3, 24);
    v.items.slice(0, 6).forEach((item, i) => {
      const x = i < 3 ? 30 : 840, y = 20 + i % 3 * 190;
      body += `<path d="M${i < 3 ? 425 : 775} 300 L${i < 3 ? 360 : 840} ${y + 80}" stroke="#${palette.branch[i]}" stroke-width="4"/>`;
      body += `<rect x="${x}" y="${y}" width="330" height="160" rx="16" fill="#${palette.panel}" stroke="#${palette.branch[i]}" stroke-width="2"/>` + wrapped(item, x + 20, y + 35, 22, 4, 23);
    });
  } else {
    body += wrapped(v.title, 50, 70, 36, 3, 34);
    v.items.slice(0, 5).forEach((item, i) => {
      const y = 210 + i * 185;
      body += `<rect x="45" y="${y}" width="750" height="165" rx="16" fill="#${palette.panel}"/><path d="M45 ${y + 15} v135" stroke="#${palette.branch[i]}" stroke-width="8"/>`;
      body += wrapped(item, 75, y + 40, 48, 4, 26);
    });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Arial, sans-serif">${body}</svg>`;
}

export function svgData(svg: string) { return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`; }
export async function visualPng(v: WorkshopVisual, scale = 2): Promise<string> {
  const { width, height } = visualSize(v), img = new Image();
  img.src = svgData(visualSvg(v)); await img.decode();
  const canvas = document.createElement("canvas"); canvas.width = width * scale; canvas.height = height * scale;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Không vẽ được ảnh.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height); return canvas.toDataURL("image/png");
}
