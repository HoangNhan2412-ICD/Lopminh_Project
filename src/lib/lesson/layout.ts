import { QUIZ_COLORS, QUIZ_LETTERS, type SlideTheme } from "@/lib/lesson/theme";
import type { IconKey, Slide } from "@/lib/lesson/types";

/*
  Bộ dàn trang slide DUY NHẤT. Cả bản xem trước trên web lẫn file PowerPoint đều vẽ
  từ danh sách phần tử này, nên thầy cô thấy gì trên web thì file tải về giống hệt.
  Đơn vị: inch, khổ 16:9 (13.333 × 7.5), cỡ chữ: point.
*/

export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;
const M = 0.6; // lề

export type El =
  | { kind: "rect"; x: number; y: number; w: number; h: number; fill: string; radius?: number; line?: string }
  | { kind: "ellipse"; x: number; y: number; w: number; h: number; fill: string; line?: string }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number; color: string; width: number }
  | {
      kind: "text";
      x: number;
      y: number;
      w: number;
      h: number;
      text: string;
      size: number;
      color: string;
      bold?: boolean;
      align?: "left" | "center" | "right";
      valign?: "top" | "middle" | "bottom";
      font?: "sans" | "math";
    }
  | { kind: "icon"; x: number; y: number; w: number; h: number; icon: IconKey; color: string }
  | { kind: "qr"; x: number; y: number; w: number; h: number; url: string | null };

/** Ước lượng cỡ chữ vừa khung: giảm dần tới khi số dòng ước tính lọt chiều cao. */
export function fitSize(text: string, w: number, h: number, max: number, min = 14, lineHeight = 1.25): number {
  const paragraphs = text.split("\n");
  for (let size = max; size > min; size -= 1) {
    const charW = (size * 0.52) / 72; // bề ngang trung bình một ký tự (inch)
    const perLine = Math.max(4, Math.floor(w / charW));
    const lines = paragraphs.reduce((n, p) => n + Math.max(1, Math.ceil(p.length / perLine)), 0);
    if ((lines * size * lineHeight) / 72 <= h) return size;
  }
  return min;
}

function title(t: string, th: SlideTheme, y = 0.45, h = 1.1): El {
  return { kind: "text", x: M, y, w: SLIDE_W - 2 * M - 1.4, h, text: t, size: fitSize(t, SLIDE_W - 2 * M - 1.4, h, 36, 24), color: th.title, bold: true, valign: "middle" };
}

function bulletsBlock(items: string[], x: number, y: number, w: number, h: number, th: SlideTheme, max = 26): El[] {
  if (!items.length) return [];
  const rowH = Math.min(1.05, h / items.length);
  const size = Math.min(...items.map((b) => fitSize(b, w - 0.5, rowH, max, 18)));
  return items.flatMap((b, i): El[] => [
    { kind: "ellipse", x, y: y + i * rowH + rowH / 2 - 0.09, w: 0.18, h: 0.18, fill: th.accent },
    { kind: "text", x: x + 0.38, y: y + i * rowH, w: w - 0.38, h: rowH, text: b, size, color: th.text, valign: "middle" },
  ]);
}

function chrome(s: Slide, th: SlideTheme, index: number, total: number, lessonTitle: string): El[] {
  const els: El[] = [{ kind: "rect", x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: th.bg }];
  if (th.tray) {
    els.push({ kind: "rect", x: 0, y: SLIDE_H - 0.14, w: SLIDE_W, h: 0.14, fill: "A8743A" });
    els.push({ kind: "rect", x: SLIDE_W - 2.4, y: SLIDE_H - 0.24, w: 0.7, h: 0.1, fill: "F3EFE2", radius: 0.05 });
  } else {
    els.push({ kind: "rect", x: 0, y: 0, w: SLIDE_W, h: 0.12, fill: th.accent });
  }
  if (s.layout !== "bia") {
    els.push({ kind: "text", x: M, y: SLIDE_H - 0.62, w: 8, h: 0.35, text: lessonTitle, size: 11, color: th.muted });
    els.push({ kind: "text", x: SLIDE_W - M - 1.2, y: SLIDE_H - 0.62, w: 1.2, h: 0.35, text: `${index + 1}/${total}`, size: 11, color: th.muted, align: "right" });
  }
  if (s.englishCue) {
    const w = Math.min(5.2, 0.6 + s.englishCue.length * 0.105);
    els.push({ kind: "rect", x: SLIDE_W - M - w, y: 0.42, w, h: 0.5, fill: th.panel, radius: 0.25, line: th.accent });
    els.push({ kind: "text", x: SLIDE_W - M - w, y: 0.42, w, h: 0.5, text: s.englishCue, size: fitSize(s.englishCue, w - 0.3, 0.45, 14, 10), color: th.panelText, align: "center", valign: "middle" });
  }
  return els;
}

function cornerIcon(s: Slide, th: SlideTheme): El[] {
  if (s.englishCue) return [];
  return [
    { kind: "ellipse", x: SLIDE_W - M - 1.05, y: 0.45, w: 1.05, h: 1.05, fill: th.panel, line: th.line },
    { kind: "icon", x: SLIDE_W - M - 0.8, y: 0.7, w: 0.55, h: 0.55, icon: s.icon, color: th.accent },
  ];
}

export function layoutSlide(
  s: Slide,
  th: SlideTheme,
  opts: { index: number; total: number; lessonTitle: string; quizUrl?: string | null },
): El[] {
  const els = chrome(s, th, opts.index, opts.total, opts.lessonTitle);
  const top = 1.75;
  const bodyH = SLIDE_H - top - 0.85;
  const fullW = SLIDE_W - 2 * M;

  switch (s.layout) {
    case "bia": {
      els.push({ kind: "ellipse", x: 8.6, y: 1.2, w: 4.6, h: 4.6, fill: th.panel, line: th.line });
      els.push({ kind: "icon", x: 9.85, y: 2.45, w: 2.1, h: 2.1, icon: s.icon, color: th.accent });
      els.push({ kind: "rect", x: M, y: 1.75, w: 1.2, h: 0.12, fill: th.accent });
      els.push({ kind: "text", x: M, y: 2.05, w: 7.6, h: 2.6, text: s.title, size: fitSize(s.title, 7.6, 2.6, 54, 30, 1.15), color: th.title, bold: true, valign: "top" });
      els.push({ kind: "text", x: M, y: 4.85, w: 7.6, h: 1.2, text: s.bullets.join("\n"), size: 22, color: th.muted, valign: "top" });
      break;
    }
    case "muc-tieu":
    case "dan-do":
    case "hai-cot": {
      els.push(title(s.title, th), ...cornerIcon(s, th));
      if (s.layout === "hai-cot") {
        els.push(...bulletsBlock(s.bullets, M, top, 7.0, bodyH, th));
        els.push({ kind: "rect", x: 8.2, y: top, w: SLIDE_W - M - 8.2, h: bodyH, fill: th.panel, radius: 0.2, line: th.line });
        els.push({ kind: "icon", x: 9.55, y: top + 0.9, w: 1.8, h: 1.8, icon: s.icon, color: th.accent });
        if (s.caption) els.push({ kind: "text", x: 8.4, y: top + 3.0, w: SLIDE_W - M - 8.6, h: bodyH - 3.2, text: s.caption, size: 16, color: th.panelText, align: "center" });
      } else {
        els.push(...bulletsBlock(s.bullets, M, top, fullW - 0.4, bodyH, th, 28));
      }
      break;
    }
    case "khoi-dong": {
      const q = s.bullets[0] ?? s.title;
      els.push(title(s.title, th), ...cornerIcon(s, th));
      els.push({ kind: "rect", x: M, y: top + 0.1, w: fullW, h: 3.2, fill: th.panel, radius: 0.3, line: th.accent });
      els.push({ kind: "text", x: M + 0.5, y: top + 0.2, w: fullW - 1, h: 3.0, text: q, size: fitSize(q, fullW - 1, 3.0, 40, 22), color: th.panelText, bold: true, align: "center", valign: "middle" });
      if (s.bullets.length > 1) {
        els.push({ kind: "text", x: M, y: top + 3.55, w: fullW, h: 1.0, text: s.bullets.slice(1).join("   "), size: 20, color: th.muted, align: "center" });
      }
      break;
    }
    case "quy-trinh": {
      els.push(title(s.title, th), ...cornerIcon(s, th));
      const n = Math.max(1, Math.min(5, s.bullets.length));
      const gap = 0.3;
      const w = (fullW - gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) {
        const x = M + i * (w + gap);
        els.push({ kind: "ellipse", x: x + w / 2 - 0.55, y: top + 0.2, w: 1.1, h: 1.1, fill: th.branch[i % th.branch.length] });
        els.push({ kind: "text", x: x + w / 2 - 0.55, y: top + 0.2, w: 1.1, h: 1.1, text: String(i + 1), size: 32, color: th.bg, bold: true, align: "center", valign: "middle" });
        if (i < n - 1) els.push({ kind: "line", x1: x + w / 2 + 0.65, y1: top + 0.75, x2: x + w + gap + w / 2 - 0.65, y2: top + 0.75, color: th.line, width: 3 });
        els.push({ kind: "rect", x, y: top + 1.6, w, h: bodyH - 1.7, fill: th.panel, radius: 0.18, line: th.line });
        const b = s.bullets[i] ?? "";
        els.push({ kind: "text", x: x + 0.15, y: top + 1.7, w: w - 0.3, h: bodyH - 1.9, text: b, size: fitSize(b, w - 0.3, bodyH - 1.9, 24, 14), color: th.panelText, align: "center", valign: "middle" });
      }
      break;
    }
    case "so-sanh": {
      els.push(title(s.title, th), ...cornerIcon(s, th));
      const w = (fullW - 0.4) / 2;
      const sides: [string, string[], string][] = [
        [s.leftTitle ?? "", s.left ?? [], th.branch[0]],
        [s.rightTitle ?? "", s.right ?? [], th.branch[1]],
      ];
      sides.forEach(([head, items, color], i) => {
        const x = M + i * (w + 0.4);
        els.push({ kind: "rect", x, y: top, w, h: bodyH, fill: th.panel, radius: 0.2, line: th.line });
        els.push({ kind: "rect", x, y: top, w, h: 0.85, fill: color, radius: 0.2 });
        els.push({ kind: "text", x: x + 0.2, y: top, w: w - 0.4, h: 0.85, text: head, size: 24, color: th.bg, bold: true, align: "center", valign: "middle" });
        els.push(...bulletsBlock(items, x + 0.35, top + 1.1, w - 0.6, bodyH - 1.3, { ...th, text: th.panelText }, 24));
      });
      break;
    }
    case "noi-bat":
    case "cong-thuc": {
      els.push(title(s.title, th), ...cornerIcon(s, th));
      const hl = s.highlight ?? s.bullets[0] ?? "";
      els.push({ kind: "rect", x: M + 0.6, y: top + 0.1, w: fullW - 1.2, h: 2.7, fill: th.panel, radius: 0.3, line: th.accent });
      els.push({ kind: "text", x: M + 0.9, y: top + 0.2, w: fullW - 1.8, h: 2.5, text: hl, size: fitSize(hl, fullW - 1.8, 2.5, s.layout === "cong-thuc" ? 54 : 44, 22, 1.2), color: th.panelText, bold: true, align: "center", valign: "middle", font: s.layout === "cong-thuc" ? "math" : "sans" });
      const sub = [s.caption, ...s.bullets.slice(s.highlight ? 0 : 1)].filter(Boolean).join("\n");
      if (sub) els.push({ kind: "text", x: M + 0.6, y: top + 3.05, w: fullW - 1.2, h: bodyH - 3.1, text: sub, size: fitSize(sub, fullW - 1.2, bodyH - 3.1, 22, 14), color: th.text, align: "center", valign: "top" });
      break;
    }
    case "nhom": {
      els.push(title(s.title, th), ...cornerIcon(s, th));
      els.push(...bulletsBlock(s.bullets, M, top, 7.2, bodyH, th));
      const cx = 9.0;
      els.push({ kind: "ellipse", x: cx, y: top, w: 2.6, h: 2.6, fill: th.accent });
      els.push({ kind: "text", x: cx, y: top + 0.35, w: 2.6, h: 1.3, text: String(s.minutes ?? 5), size: 60, color: th.accentText, bold: true, align: "center", valign: "middle" });
      els.push({ kind: "text", x: cx, y: top + 1.55, w: 2.6, h: 0.6, text: "phút", size: 20, color: th.accentText, align: "center" });
      if (s.product) {
        els.push({ kind: "rect", x: 8.2, y: top + 2.9, w: SLIDE_W - M - 8.2, h: bodyH - 2.9, fill: th.panel, radius: 0.18, line: th.line });
        els.push({ kind: "text", x: 8.4, y: top + 2.95, w: SLIDE_W - M - 8.6, h: bodyH - 3.0, text: `Sản phẩm: ${s.product}`, size: fitSize(`Sản phẩm: ${s.product}`, SLIDE_W - M - 8.6, bodyH - 3.0, 20, 13), color: th.panelText, valign: "middle", align: "center" });
      }
      break;
    }
    case "trac-nghiem": {
      const q = s.question;
      els.push(title(s.title, th, 0.35, 0.8));
      const qt = q?.q ?? s.bullets[0] ?? "";
      els.push({ kind: "rect", x: M, y: 1.3, w: fullW, h: 1.5, fill: th.panel, radius: 0.2, line: th.line });
      els.push({ kind: "text", x: M + 0.3, y: 1.35, w: fullW - 0.6, h: 1.4, text: qt, size: fitSize(qt, fullW - 0.6, 1.4, 30, 18), color: th.panelText, bold: true, align: "center", valign: "middle" });
      const opts = q?.options ?? [];
      const w = (fullW - 0.3) / 2;
      const h = 1.6;
      opts.forEach((o, i) => {
        const x = M + (i % 2) * (w + 0.3);
        const y = 3.05 + Math.floor(i / 2) * (h + 0.2);
        els.push({ kind: "rect", x, y, w, h, fill: QUIZ_COLORS[i], radius: 0.18 });
        els.push({ kind: "ellipse", x: x + 0.25, y: y + h / 2 - 0.45, w: 0.9, h: 0.9, fill: "FFFFFF" });
        els.push({ kind: "text", x: x + 0.25, y: y + h / 2 - 0.45, w: 0.9, h: 0.9, text: QUIZ_LETTERS[i], size: 28, color: QUIZ_COLORS[i], bold: true, align: "center", valign: "middle" });
        els.push({ kind: "text", x: x + 1.35, y, w: w - 1.55, h, text: o, size: fitSize(o, w - 1.55, h, 26, 14), color: "FFFFFF", bold: true, valign: "middle" });
      });
      break;
    }
    case "ma-qr": {
      els.push(title(s.title, th), ...cornerIcon(s, th));
      s.bullets.slice(0, 4).forEach((b, i) => {
        const y = top + i * 1.15;
        els.push({ kind: "ellipse", x: M, y: y + 0.1, w: 0.8, h: 0.8, fill: th.accent });
        els.push({ kind: "text", x: M, y: y + 0.1, w: 0.8, h: 0.8, text: String(i + 1), size: 24, color: th.accentText, bold: true, align: "center", valign: "middle" });
        els.push({ kind: "text", x: M + 1.05, y, w: 6.2, h: 1.0, text: b, size: fitSize(b, 6.2, 1.0, 26, 16), color: th.text, valign: "middle" });
      });
      els.push({ kind: "rect", x: 8.3, y: top - 0.15, w: 4.4, h: 4.4, fill: "FFFFFF", radius: 0.2, line: th.line });
      els.push({ kind: "qr", x: 8.55, y: top + 0.1, w: 3.9, h: 3.9, url: opts.quizUrl ?? null });
      break;
    }
    case "so-do": {
      const branches = s.bullets.slice(0, 6);
      const cx = SLIDE_W / 2;
      const cy = SLIDE_H / 2 + 0.05;
      els.push({ kind: "ellipse", x: cx - 2.0, y: cy - 0.85, w: 4.0, h: 1.7, fill: th.accent });
      els.push({ kind: "text", x: cx - 1.85, y: cy - 0.8, w: 3.7, h: 1.6, text: s.title, size: fitSize(s.title, 3.7, 1.6, 28, 14), color: th.accentText, bold: true, align: "center", valign: "middle" });
      // Vị trí nhánh quanh tâm (đều nằm trong khổ slide, chừa lề 0.4in)
      const slots: [number, number][] = [
        [-4.1, -2.3], [4.1, -2.3], [-4.6, 0], [4.6, 0], [-4.1, 2.3], [4.1, 2.3],
      ];
      const order = branches.length <= 4 ? [0, 1, 4, 5] : [0, 1, 2, 3, 4, 5];
      branches.forEach((b, i) => {
        const [dx, dy] = slots[order[i]];
        const bw = 3.0;
        const bh = 1.05;
        const bx = cx + dx - bw / 2;
        const by = cy + dy - bh / 2;
        const color = th.branch[i % th.branch.length];
        els.push({ kind: "line", x1: cx + Math.sign(dx) * 1.7, y1: cy + dy * 0.25, x2: cx + dx - Math.sign(dx) * (bw / 2), y2: cy + dy, color, width: 3 });
        els.push({ kind: "rect", x: bx, y: by, w: bw, h: bh, fill: th.panel, radius: 0.5, line: color });
        els.push({ kind: "text", x: bx + 0.15, y: by, w: bw - 0.3, h: bh, text: b, size: fitSize(b, bw - 0.3, bh, 22, 13), color: th.panelText, bold: true, align: "center", valign: "middle" });
      });
      break;
    }
  }
  return els;
}
