"use client";

import { QRCodeSVG } from "qrcode.react";
import { ICONS } from "@/lib/lesson/icons";
import { SLIDE_H, SLIDE_W, layoutSlide } from "@/lib/lesson/layout";
import type { SlideTheme } from "@/lib/lesson/theme";
import type { Slide } from "@/lib/lesson/types";
import { svgData, visualSvg } from "@/lib/workshop/visual";

/*
  Vẽ slide trên web từ cùng bộ phần tử với file PowerPoint.
  Mọi kích thước tính theo % khung và cỡ chữ theo đơn vị cqw nên co giãn đúng tỉ lệ.
*/

const pctX = (v: number) => `${(v / SLIDE_W) * 100}%`;
const pctY = (v: number) => `${(v / SLIDE_H) * 100}%`;
// 1 point trên slide rộng 13.333in (960pt) = 100/960 cqw
const pt = (size: number) => `${(size * 100) / 960}cqw`;
const hex = (c: string) => `#${c}`;

export function SlideCanvas({
  slide,
  theme,
  index,
  total,
  lessonTitle,
  quizUrl,
}: {
  slide: Slide;
  theme: SlideTheme;
  index: number;
  total: number;
  lessonTitle: string;
  quizUrl?: string | null;
}) {
  const els = layoutSlide(slide, theme, { index, total, lessonTitle, quizUrl });
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-lg"
      style={{ containerType: "inline-size" }}
      role="img"
      aria-label={`Slide ${index + 1}: ${slide.title}`}
    >
      {els.map((e, i) => {
        switch (e.kind) {
          case "visual":
            // SVG nội bộ được vẽ từ dữ liệu đã kiểm tra, không tải ảnh ngoài.
            // eslint-disable-next-line @next/next/no-img-element
            return <img key={i} src={svgData(visualSvg(e.visual))} alt={e.visual.kind === "graph" ? e.visual.graph.title : e.visual.title} className="absolute" style={{ left: pctX(e.x), top: pctY(e.y), width: pctX(e.w), height: pctY(e.h) }} />;
          case "rect":
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: pctX(e.x),
                  top: pctY(e.y),
                  width: pctX(e.w),
                  height: pctY(e.h),
                  background: hex(e.fill),
                  borderRadius: e.radius ? pt(e.radius * 72) : 0,
                  border: e.line ? `${pt(1.5)} solid ${hex(e.line)}` : undefined,
                }}
              />
            );
          case "ellipse":
            return (
              <div
                key={i}
                className="absolute rounded-[50%]"
                style={{
                  left: pctX(e.x),
                  top: pctY(e.y),
                  width: pctX(e.w),
                  height: pctY(e.h),
                  background: hex(e.fill),
                  border: e.line ? `${pt(1.5)} solid ${hex(e.line)}` : undefined,
                }}
              />
            );
          case "line": {
            const dx = e.x2 - e.x1;
            const dy = e.y2 - e.y1;
            const len = Math.hypot(dx, dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            return (
              <div
                key={i}
                className="absolute origin-left"
                style={{
                  left: pctX(e.x1),
                  top: pctY(e.y1),
                  width: pctX(len),
                  height: pt(e.width),
                  background: hex(e.color),
                  transform: `rotate(${angle}deg)`,
                }}
              />
            );
          }
          case "text":
            return (
              <div
                key={i}
                className="absolute flex whitespace-pre-line"
                style={{
                  left: pctX(e.x),
                  top: pctY(e.y),
                  width: pctX(e.w),
                  height: pctY(e.h),
                  fontSize: pt(e.size),
                  lineHeight: 1.22,
                  color: hex(e.color),
                  fontWeight: e.bold ? 700 : 400,
                  fontFamily: e.font === "math" ? "'Cambria Math', 'STIX Two Math', serif" : undefined,
                  textAlign: e.align ?? "left",
                  justifyContent: e.align === "center" ? "center" : e.align === "right" ? "flex-end" : "flex-start",
                  alignItems: e.valign === "middle" ? "center" : e.valign === "bottom" ? "flex-end" : "flex-start",
                }}
              >
                <span>{e.text}</span>
              </div>
            );
          case "icon": {
            const Icon = ICONS[e.icon];
            return (
              <Icon
                key={i}
                className="absolute"
                style={{ left: pctX(e.x), top: pctY(e.y), width: pctX(e.w), height: pctY(e.h), color: hex(e.color) }}
                strokeWidth={1.75}
                aria-hidden
              />
            );
          }
          case "qr":
            return (
              <div
                key={i}
                className="absolute flex items-center justify-center"
                style={{ left: pctX(e.x), top: pctY(e.y), width: pctX(e.w), height: pctY(e.h) }}
              >
                {e.url ? (
                  <QRCodeSVG value={e.url} className="size-full" marginSize={0} />
                ) : (
                  <span className="px-[6%] text-center text-ink-muted" style={{ fontSize: pt(16) }}>
                    Dán link phòng quiz ở mục Xuất file, mã QR sẽ hiện ở đây
                  </span>
                )}
              </div>
            );
        }
      })}
    </div>
  );
}
