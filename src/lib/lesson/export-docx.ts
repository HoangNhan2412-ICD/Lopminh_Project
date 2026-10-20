"use client";

import { ACTIVITY_NAMES, type LessonPlan } from "@/lib/lesson/types";
import type { Student, TeacherProfile } from "@/lib/types";

/*
  Kế hoạch bài dạy theo Phụ lục IV Công văn 5512/BGDĐT-GDTrH.
  Chữ Times New Roman 13pt, lề theo Nghị định 30/2020 (trên/dưới 2cm, trái 3cm, phải 1,5cm).
*/

const CM = 567; // twip / cm
const FONT = "Times New Roman";
const SIZE = 26; // nửa point → 13pt

export async function buildDocx(plan: LessonPlan, teacher: TeacherProfile, students: Student[]): Promise<Blob> {
  const d = await import("docx");
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, PageNumber, Footer } = d;

  const run = (text: string, o: { bold?: boolean; italics?: boolean; size?: number } = {}) =>
    new TextRun({ text, bold: o.bold, italics: o.italics, font: FONT, size: o.size ?? SIZE });
  const para = (children: InstanceType<typeof TextRun>[] | string, o: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; before?: number; after?: number; indent?: number } = {}) =>
    new Paragraph({
      children: typeof children === "string" ? [run(children)] : children,
      alignment: o.align ?? AlignmentType.JUSTIFIED,
      spacing: { before: o.before ?? 0, after: o.after ?? 80, line: 300 },
      indent: o.indent ? { left: o.indent } : undefined,
    });
  const heading = (text: string) => para([run(text, { bold: true })], { before: 160 });
  const bullets = (items: string[]) => items.map((t) => para(`- ${t}`, { indent: 360 }));
  const name = (id: string) => students.find((s) => s.id === id)?.fullName ?? id;

  const border = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (children: InstanceType<typeof Paragraph>[], widthPct: number, shade?: string) =>
    new TableCell({
      children,
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders,
      shading: shade ? { fill: shade } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
    });

  const r = plan.request;
  const body: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];

  // Phần đầu
  body.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [para([run(`Trường: ${teacher.school}`)], { align: AlignmentType.LEFT }), para([run(`Tổ: ${teacher.team}`)], { align: AlignmentType.LEFT })],
              borders: { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [para([run(`Họ và tên giáo viên: ${teacher.fullName}`)], { align: AlignmentType.RIGHT })],
              borders: { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
    }),
    para([run("KẾ HOẠCH BÀI DẠY", { bold: true, size: 28 })], { align: AlignmentType.CENTER, before: 240 }),
    para([run(plan.title.toUpperCase(), { bold: true, size: 28 })], { align: AlignmentType.CENTER }),
    para([run(`Môn: ${r.subject}; lớp: ${r.className} (${r.grade})`, { italics: true })], { align: AlignmentType.CENTER }),
    para([run(`Thời gian thực hiện: ${r.minutes} phút`, { italics: true })], { align: AlignmentType.CENTER, after: 200 }),
  );

  // I. Mục tiêu
  body.push(heading("I. MỤC TIÊU"));
  body.push(para([run("1. Về kiến thức", { bold: true })]), ...bullets(plan.objectives.kienThuc));
  body.push(para([run("2. Về năng lực", { bold: true })]), ...bullets(plan.objectives.nangLuc));
  body.push(para([run("3. Về phẩm chất", { bold: true })]), ...bullets(plan.objectives.phamChat));

  // II. Thiết bị
  body.push(heading("II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU"), ...bullets(plan.materials));

  // III. Tiến trình
  body.push(heading("III. TIẾN TRÌNH DẠY HỌC"));
  for (const a of plan.activities) {
    body.push(para([run(`${ACTIVITY_NAMES[a.key]} (${a.minutes} phút)`, { bold: true })], { before: 120 }));
    body.push(para([run("a) Mục tiêu: ", { bold: true }), run(a.goal)]));
    body.push(para([run("b) Nội dung: ", { bold: true }), run(a.content)]));
    if (a.coBan || a.nangCao) {
      body.push(para([run("   Tầng Cơ bản: ", { italics: true }), run(a.coBan ?? "")]));
      body.push(para([run("   Tầng Nâng cao: ", { italics: true }), run(a.nangCao ?? "")]));
    }
    body.push(para([run("c) Sản phẩm: ", { bold: true }), run(a.product)]));
    body.push(para([run("d) Tổ chức thực hiện:", { bold: true })]));
    const steps: [string, string][] = [
      ["Bước 1: Chuyển giao nhiệm vụ", a.steps.giao],
      ["Bước 2: Thực hiện nhiệm vụ", a.steps.thucHien],
      ["Bước 3: Báo cáo, thảo luận", a.steps.baoCao],
      ["Bước 4: Kết luận, nhận định", a.steps.ketLuan],
    ];
    body.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              cell([para([run("Hoạt động của giáo viên và học sinh", { bold: true })], { align: AlignmentType.CENTER })], 62, "EDEDED"),
              cell([para([run("Sản phẩm dự kiến", { bold: true })], { align: AlignmentType.CENTER })], 38, "EDEDED"),
            ],
          }),
          new TableRow({
            children: [
              cell(steps.flatMap(([k, v]) => [para([run(k, { bold: true })]), para(v)]), 62),
              cell([para(a.product)], 38),
            ],
          }),
        ],
      }),
    );
  }

  // Phân hóa theo học sinh cụ thể
  body.push(heading("IV. PHÂN HÓA THEO HỌC SINH"));
  body.push(para([run("Tầng Cơ bản: ", { bold: true }), run(plan.tiers.coBan.map(name).join(", ") || "(chưa xếp)")]));
  body.push(para([run("Tầng Nâng cao: ", { bold: true }), run(plan.tiers.nangCao.map(name).join(", ") || "(chưa xếp)")]));

  // Phụ lục
  body.push(heading("PHỤ LỤC 1. PHIẾU HỌC TẬP"));
  body.push(para([run("Phiếu tầng Cơ bản", { bold: true })]), ...bullets(plan.worksheet.coBan));
  body.push(para([run("Phiếu tầng Nâng cao", { bold: true })]), ...bullets(plan.worksheet.nangCao));
  body.push(heading("PHỤ LỤC 2. CÂU HỎI TRẮC NGHIỆM VÀ ĐÁP ÁN"));
  plan.quiz.forEach((q, i) => {
    body.push(para([run(`Câu ${i + 1}. `, { bold: true }), run(q.q)]));
    q.options.forEach((o, j) => body.push(para(`${"ABCD"[j]}. ${o}`, { indent: 360, after: 0 })));
    body.push(para([run(`Đáp án: ${"ABCD"[q.answer]}. `, { italics: true }), run(q.explain ?? "", { italics: true })], { after: 120 }));
  });
  body.push(heading("HƯỚNG DẪN VỀ NHÀ"), para(plan.homework));

  const doc = new Document({
    creator: teacher.fullName,
    title: plan.title,
    styles: { default: { document: { run: { font: FONT, size: SIZE } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 2 * CM, bottom: 2 * CM, left: 3 * CM, right: 1.5 * CM } },
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 22 })] })],
          }),
        },
        children: body,
      },
    ],
  });
  return Packer.toBlob(doc);
}
