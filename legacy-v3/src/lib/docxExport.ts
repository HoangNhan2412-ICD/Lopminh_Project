import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import { LessonPlan5512 } from '@/types/lessonPlan';
import { SoundService } from './soundService';
import { normalizeNFC, deepNormalizeNFC } from './unicodeUtils';

/**
 * Xuất kế hoạch bài dạy chuẩn Công văn 5512/BGDĐT-GDTrH và Nghị định 30/2020/NĐ-CP
 * - Font chữ: Times New Roman (Unicode TCVN 6909:2001 chuẩn văn bản hành chính)
 * - Khắc phục hoàn toàn lỗi vỡ dấu thanh tiếng Việt bằng Unicode NFC
 * - Căn lề chuẩn trang A4: Trên 25mm, Dưới 25mm, Trái 30mm (đóng gáy), Phải 20mm
 */
export async function exportLessonPlanToDocx(rawPlan: LessonPlan5512): Promise<Blob> {
  const plan = deepNormalizeNFC(rawPlan);

  const FONT_ADMIN = 'Times New Roman';

  // Helper tạo TextRun chuẩn font Times New Roman và chuẩn hóa NFC
  const createRun = (options: {
    text: string;
    bold?: boolean;
    italics?: boolean;
    size?: number; // half-points (26 = 13pt)
    color?: string;
  }) => {
    return new TextRun({
      text: normalizeNFC(options.text),
      font: FONT_ADMIN,
      bold: options.bold,
      italics: options.italics,
      size: options.size ?? 26,
      color: options.color
    });
  };

  const tableBorderConfig = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'B0B0B0' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'B0B0B0' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'B0B0B0' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'B0B0B0' },
  };

  // Build rows for 4 mandatory phases of Circular 5512
  const phaseRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: tableBorderConfig,
          shading: { fill: 'F3F4F6' },
          margins: { top: 120, bottom: 120, left: 150, right: 150 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [createRun({ text: 'Hoạt động & Thời lượng', bold: true, size: 24 })]
            })
          ]
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          borders: tableBorderConfig,
          shading: { fill: 'F3F4F6' },
          margins: { top: 120, bottom: 120, left: 150, right: 150 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [createRun({ text: 'Nội dung thực hiện (Chuẩn Công văn 5512)', bold: true, size: 24 })]
            })
          ]
        })
      ]
    })
  ];

  plan.phases.forEach((phase) => {
    phaseRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            borders: tableBorderConfig,
            margins: { top: 120, bottom: 120, left: 150, right: 150 },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [
                  createRun({ text: phase.title, bold: true, size: 24, color: '1E3A2F' }),
                  createRun({ text: `\n(Dự kiến: ${phase.durationMinutes} phút)`, italics: true, size: 22, color: '555555' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: tableBorderConfig,
            margins: { top: 120, bottom: 120, left: 150, right: 150 },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 40 },
                children: [
                  createRun({ text: 'a) Mục tiêu: ', bold: true, color: '1E3A2F' }),
                  createRun({ text: phase.objective })
                ]
              }),
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  createRun({ text: 'b) Nội dung nhiệm vụ: ', bold: true, color: '1E3A2F' }),
                  createRun({ text: phase.content })
                ]
              }),
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  createRun({ text: 'c) Sản phẩm học tập: ', bold: true, color: '1E3A2F' }),
                  createRun({ text: phase.product })
                ]
              }),
              new Paragraph({
                spacing: { before: 40, after: 60 },
                children: [
                  createRun({ text: 'd) Tổ chức thực hiện: ', bold: true, color: '1E3A2F' }),
                  createRun({ text: phase.implementation })
                ]
              })
            ]
          })
        ]
      })
    );
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_ADMIN,
            size: 26, // 13pt
            color: '000000',
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              before: 80,
              after: 80,
            }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 25mm (Nghị định 30/2020/NĐ-CP)
              bottom: 1440, // 25mm
              left: 1700,   // ~30mm (đóng gáy hồ sơ giáo án)
              right: 1134,  // ~20mm
            }
          }
        },
        children: [
          // Header: Quốc hiệu & Tiêu ngữ (Chuẩn Nghị định 30/2020/NĐ-CP)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              createRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 24 }),
              createRun({ text: '\nĐộc lập - Tự do - Hạnh phúc', bold: true, size: 24 }),
              createRun({ text: '\n------------------------------------', size: 20 })
            ]
          }),

          // Thông tin trường & giáo viên
          new Paragraph({
            spacing: { before: 100, after: 120 },
            children: [
              createRun({ text: `Trường: ${plan.schoolName}`, bold: true }),
              createRun({ text: `\nTổ chuyên môn: ${plan.department}` }),
              createRun({ text: `\nGiáo viên thực hiện: ${plan.teacherName}` }),
              createRun({ text: `\nBộ môn: ${plan.subject} - Khối: ${plan.gradeLevel}` }),
              createRun({ text: `\nBộ sách giáo khoa: ${plan.textbookName}` })
            ]
          }),

          // Tên bài học
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 150 },
            children: [
              createRun({
                text: `KẾ HOẠCH BÀI DẠY: ${plan.title.toUpperCase()}`,
                bold: true,
                size: 30,
                color: '1E3A2F'
              }),
              createRun({
                text: '\n(Chuẩn hóa theo Công văn số 5512/BGDĐT-GDTrH)',
                italics: true,
                size: 22,
                color: '444444'
              })
            ]
          }),

          // I. MỤC TIÊU BÀI DẠY
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 100 },
            children: [createRun({ text: 'I. MỤC TIÊU BÀI DẠY', bold: true, size: 26, color: '1E3A2F' })]
          }),
          new Paragraph({
            spacing: { before: 60, after: 80 },
            children: [
              createRun({ text: '1. Về kiến thức:\n', bold: true }),
              ...plan.objectives.knowledge.map(k => createRun({ text: `  • ${k}\n` })),
              createRun({ text: '2. Về năng lực:\n', bold: true }),
              createRun({ text: '  - Năng lực chung: ', bold: true }),
              createRun({ text: `${plan.objectives.competencies.general.join(', ')}\n` }),
              createRun({ text: '  - Năng lực đặc thù: ', bold: true }),
              createRun({ text: `${plan.objectives.competencies.specific.join(', ')}\n` }),
              createRun({ text: '3. Về phẩm chất:\n', bold: true }),
              ...plan.objectives.qualities.map(q => createRun({ text: `  • ${q}\n` }))
            ]
          }),

          // II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 100 },
            children: [createRun({ text: 'II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU', bold: true, size: 26, color: '1E3A2F' })]
          }),
          new Paragraph({
            spacing: { before: 60, after: 80 },
            children: [
              createRun({ text: '1. Chuẩn bị của giáo viên: ', bold: true }),
              createRun({ text: `${plan.equipment.teacher.join(', ')}\n` }),
              createRun({ text: '2. Chuẩn bị của học sinh: ', bold: true }),
              createRun({ text: `${plan.equipment.students.join(', ')}\n` })
            ]
          }),

          // III. TIẾN TRÌNH DẠY HỌC (4 BƯỚC BẮT BUỘC CV 5512)
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 120 },
            children: [createRun({ text: 'III. TIẾN TRÌNH DẠY HỌC (4 BƯỚC BẮT BUỘC THEO CV 5512)', bold: true, size: 26, color: '1E3A2F' })]
          }),
          new Table({
            rows: phaseRows,
            width: { size: 100, type: WidthType.PERCENTAGE }
          }),

          // IV. KẾ HOẠCH DẠY HỌC PHÂN HÓA (2 TẦNG NĂNG LỰC)
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [createRun({ text: 'IV. KẾ HOẠCH DẠY HỌC PHÂN HÓA (2 TẦNG NĂNG LỰC)', bold: true, size: 26, color: '1E3A2F' })]
          }),
          new Paragraph({
            spacing: { before: 60, after: 80 },
            children: [
              createRun({ text: '1. Tầng 1 (Cốt lõi / Chuẩn đạt - Toàn lớp & Học sinh cần hỗ trợ):\n', bold: true, color: '0D47A1' }),
              createRun({ text: `  - Đối tượng tiếp cận: ${plan.differentiation.tier1Core.targetAudience}\n` }),
              createRun({ text: `  - Chiến lược hỗ trợ: ${plan.differentiation.tier1Core.strategy}\n` }),
              createRun({ text: `  - Bài tập mẫu củng cố: ${plan.differentiation.tier1Core.sampleExercise}\n\n` }),
              createRun({ text: '2. Tầng 2 (Mở rộng / Nâng cao - Học sinh khá giỏi bứt phá):\n', bold: true, color: '1B5E20' }),
              createRun({ text: `  - Đối tượng phát triển: ${plan.differentiation.tier2Advanced.targetAudience}\n` }),
              createRun({ text: `  - Chiến lược thúc đẩy: ${plan.differentiation.tier2Advanced.strategy}\n` }),
              createRun({ text: `  - Bài tập thử thách cao: ${plan.differentiation.tier2Advanced.sampleExercise}\n` }),
              createRun({ text: `  - Dự án tự chủ sáng tạo: ${plan.differentiation.tier2Advanced.independentChallenge}\n` })
            ]
          }),

          // V. ĐIỀU CHỈNH THỜI GIAN THỰC & HỌC LIỆU SỐ TÍCH HỢP
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [createRun({ text: 'V. ĐIỀU CHỈNH THỜI GIAN THỰC & HỌC LIỆU SỐ TÍCH HỢP', bold: true, size: 26, color: '1E3A2F' })]
          }),
          new Paragraph({
            spacing: { before: 60, after: 80 },
            children: [
              createRun({ text: '1. Học liệu số tương tác:\n', bold: true }),
              createRun({ text: `  • Quizizz kiểm tra nhanh: ${plan.interactiveResources.quizizz.title}\n` }),
              createRun({ text: `    - Mã tham gia trực tiếp: ${plan.interactiveResources.quizizz.gameCode || 'LIVE'}\n` }),
              createRun({ text: `    - Đường dẫn: ${plan.interactiveResources.quizizz.liveUrl}\n` }),
              createRun({ text: '2. Ghi chú điều chỉnh theo học sinh lớp học:\n', bold: true }),
              ...plan.realtimeClassroomAdaptations.map(
                ad => createRun({ text: `  • Học sinh ${ad.studentName} (${ad.reason}): ${ad.actionInPlan}\n` })
              )
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

export function downloadBlobAsFile(blob: Blob, filename: string): void {
  saveAs(blob, normalizeNFC(filename));
  SoundService.playSuccessChime();
}
