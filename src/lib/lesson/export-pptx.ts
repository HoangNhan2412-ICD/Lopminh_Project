"use client";

import { createElement } from "react";
import { ICONS } from "@/lib/lesson/icons";
import { layoutSlide, type El } from "@/lib/lesson/layout";
import { THEMES } from "@/lib/lesson/theme";
import type { IconKey, LessonPlan } from "@/lib/lesson/types";
import { visualPng } from "@/lib/workshop/visual";

/*
  Dựng file PowerPoint trong trình duyệt bằng pptxgenjs, từ đúng bộ phần tử của bản xem trước.
  Biểu tượng được vẽ thành ảnh PNG nét cao; mã QR vẽ từ link phòng quiz.
*/

async function svgToPng(svg: string, px = 512): Promise<string> {
  const img = new Image();
  img.decoding = "async";
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không vẽ được ảnh");
  ctx.drawImage(img, 0, 0, px, px);
  return canvas.toDataURL("image/png");
}

async function iconPng(key: IconKey, color: string, cache: Map<string, string>): Promise<string> {
  const id = `${key}-${color}`;
  const hit = cache.get(id);
  if (hit) return hit;
  const { renderToStaticMarkup } = await import("react-dom/server");
  const svg = renderToStaticMarkup(
    createElement(ICONS[key], { color: `#${color}`, size: 256, strokeWidth: 1.75, xmlns: "http://www.w3.org/2000/svg" }),
  );
  const png = await svgToPng(svg);
  cache.set(id, png);
  return png;
}

export type Progress = (step: string, pct: number) => void;

export async function buildPptx(plan: LessonPlan, opts: { quizUrl?: string | null; teacherName: string; onProgress?: Progress }): Promise<Blob> {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const QRCode = (await import("qrcode")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = plan.title;
  pptx.author = opts.teacherName;
  pptx.company = "Lớp Mình";
  pptx.theme = { headFontFace: "Be Vietnam Pro", bodyFontFace: "Be Vietnam Pro" };

  const theme = THEMES[plan.theme];
  const iconCache = new Map<string, string>();
  const qrPng = opts.quizUrl ? await QRCode.toDataURL(opts.quizUrl, { margin: 0, width: 800, errorCorrectionLevel: "M" }) : null;
  const total = plan.slides.length;

  for (let i = 0; i < total; i++) {
    const s = plan.slides[i];
    opts.onProgress?.(`Dựng slide ${i + 1}/${total}: ${s.title}`, 0.15 + (0.8 * i) / total);
    const slide = pptx.addSlide();
    const els: El[] = layoutSlide(s, theme, { index: i, total, lessonTitle: plan.title, quizUrl: opts.quizUrl });
    for (const e of els) {
      switch (e.kind) {
        case "visual": {
          if (e.visual.kind === "graph" && e.visual.graph.family === "table") {
            const g = e.visual.graph;
            slide.addChart(pptx.ChartType.bar, [{ name: g.yLabel, labels: g.rows.map(r => r.label), values: g.rows.map(r => r.value) }], {
              x: e.x, y: e.y, w: e.w, h: e.h, barDir: "col", showLegend: false,
              showTitle: true, title: g.title,
              catAxisTitle: `${g.xLabel} (${g.xUnit})`, valAxisTitle: `${g.yLabel} (${g.yUnit})`,
              chartColors: [theme.accent], showValue: true,
            });
          } else slide.addImage({ data: await visualPng(e.visual), x: e.x, y: e.y, w: e.w, h: e.h });
          break;
        }
        case "rect":
          slide.addShape(e.radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {
            x: e.x,
            y: e.y,
            w: e.w,
            h: e.h,
            fill: { color: e.fill },
            line: e.line ? { color: e.line, width: 1.5 } : { type: "none" },
            rectRadius: e.radius ? Math.min(e.radius, Math.min(e.w, e.h) / 2) : undefined,
          });
          break;
        case "ellipse":
          slide.addShape(pptx.ShapeType.ellipse, {
            x: e.x,
            y: e.y,
            w: e.w,
            h: e.h,
            fill: { color: e.fill },
            line: e.line ? { color: e.line, width: 1.5 } : { type: "none" },
          });
          break;
        case "line":
          slide.addShape(pptx.ShapeType.line, {
            x: Math.min(e.x1, e.x2),
            y: Math.min(e.y1, e.y2),
            w: Math.max(0.01, Math.abs(e.x2 - e.x1)),
            h: Math.max(0.01, Math.abs(e.y2 - e.y1)),
            flipH: e.x2 < e.x1 !== e.y2 < e.y1 && e.y1 !== e.y2 ? true : undefined,
            line: { color: e.color, width: e.width },
          });
          break;
        case "text":
          slide.addText(e.text, {
            x: e.x,
            y: e.y,
            w: e.w,
            h: e.h,
            fontSize: e.size,
            fontFace: e.font === "math" ? "Cambria Math" : "Be Vietnam Pro",
            color: e.color,
            bold: e.bold,
            align: e.align ?? "left",
            valign: e.valign ?? "top",
            margin: 0,
            lineSpacingMultiple: 1.05,
            fit: "shrink",
          });
          break;
        case "icon":
          slide.addImage({ data: await iconPng(e.icon, e.color, iconCache), x: e.x, y: e.y, w: e.w, h: e.h });
          break;
        case "qr":
          if (qrPng) slide.addImage({ data: qrPng, x: e.x, y: e.y, w: e.w, h: e.h });
          else
            slide.addText("Dán link phòng quiz ở mục Xuất file của Lớp Mình rồi tải lại, mã QR sẽ hiện ở đây", {
              x: e.x,
              y: e.y,
              w: e.w,
              h: e.h,
              fontSize: 16,
              color: "6B756F",
              align: "center",
              valign: "middle",
              fontFace: "Be Vietnam Pro",
            });
          break;
      }
    }
    const notes = [s.notes, s.imagePrompt ? `Gợi ý tạo hình (dán vào Canva/Google Slides): ${s.imagePrompt}` : ""]
      .filter(Boolean)
      .join("\n\n");
    if (notes) slide.addNotes(notes);
  }

  opts.onProgress?.("Đóng gói file PowerPoint", 0.97);
  const out = await pptx.write({ outputType: "blob" });
  return out as Blob;
}
