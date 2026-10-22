import pptxgen from 'pptxgenjs';
import { LessonPlan5512 } from '@/types/lessonPlan';
import { SoundService } from './soundService';
import { normalizeNFC, deepNormalizeNFC } from './unicodeUtils';

/**
 * Xuất bài giảng điện tử PowerPoint 16:9 đồng bộ với giáo án Công văn 5512
 * - Thiết lập font chữ tiêu chuẩn: Arial (Unicode tương thích 100% mọi phiên bản MS PowerPoint)
 * - Khắc phục triệt để lỗi vỡ dấu tiếng Việt ("Số ́", "Xuâ ́ t") bằng Unicode NFC
 * - Thiết kế phong cách Sư phạm thân thiện: Tông màu bảng phấn & ngà ấm
 */
export async function exportLessonPlanToPptx(rawPlan: LessonPlan5512): Promise<void> {
  const plan = deepNormalizeNFC(rawPlan);
  const pptx = new pptxgen();

  // Cấu hình màn hình rộng 16:9 chuẩn giảng dạy hiện đại
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = normalizeNFC(plan.teacherName);
  pptx.company = normalizeNFC(plan.schoolName);
  pptx.title = normalizeNFC(`Bài giảng điện tử: ${plan.title}`);

  const FONT_NAME = 'Arial';
  const COLOR_BG_CHALK = '1E3A2F';
  const COLOR_GOLD = 'E6B94D';
  const COLOR_WHITE = 'FFFFFF';
  const COLOR_IVORY = 'FDFBF7';
  const COLOR_DARK = '1E2922';

  // Helper thêm văn bản đảm bảo font và chuẩn hóa NFC
  const addSafeText = (
    slide: pptxgen.Slide,
    text: string,
    opts: pptxgen.TextPropsOptions
  ) => {
    slide.addText(normalizeNFC(text), {
      fontFace: FONT_NAME,
      ...opts
    });
  };

  // ==========================================
  // SLIDE 1: Trang bìa bài giảng (Phong cách bảng phấn)
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_BG_CHALK };

  addSafeText(slide1, 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc', {
    x: 1.0,
    y: 0.4,
    w: '80%',
    h: 0.8,
    fontSize: 13,
    color: COLOR_GOLD,
    align: 'center',
    bold: true
  });

  addSafeText(slide1, plan.schoolName.toUpperCase(), {
    x: 0.8,
    y: 1.4,
    w: '85%',
    h: 0.5,
    fontSize: 14,
    color: 'A7D7C5',
    align: 'center',
    bold: true
  });

  addSafeText(slide1, `BÀI GIẢNG ĐIỆN TỬ: ${plan.title.toUpperCase()}`, {
    x: 0.8,
    y: 2.1,
    w: '85%',
    h: 1.5,
    fontSize: 28,
    color: COLOR_GOLD,
    align: 'center',
    bold: true
  });

  addSafeText(slide1, `Môn: ${plan.subject} - ${plan.gradeLevel} • Bộ sách: ${plan.textbookName}`, {
    x: 1.0,
    y: 3.8,
    w: '80%',
    h: 0.5,
    fontSize: 16,
    color: COLOR_WHITE,
    align: 'center'
  });

  addSafeText(slide1, `Giáo viên thực hiện: ${plan.teacherName}\n${plan.department}`, {
    x: 1.0,
    y: 4.8,
    w: '80%',
    h: 0.8,
    fontSize: 16,
    color: 'EAEAEA',
    align: 'center',
    italic: true
  });

  // ==========================================
  // SLIDE 2: Mục tiêu bài học (GDPT 2018)
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: COLOR_IVORY };

  addSafeText(slide2, 'I. MỤC TIÊU BÀI DẠY (CHUẨN CHƯƠNG TRÌNH GDPT 2018)', {
    x: 0.8,
    y: 0.6,
    w: '85%',
    h: 0.6,
    fontSize: 22,
    color: COLOR_BG_CHALK,
    bold: true
  });

  const knowledgeText = plan.objectives.knowledge.map(k => `• ${k}`).join('\n');
  const compText = `• Năng lực chung: ${plan.objectives.competencies.general.join(', ')}\n• Năng lực đặc thù: ${plan.objectives.competencies.specific.join(', ')}`;
  const qualityText = plan.objectives.qualities.map(q => `• ${q}`).join('\n');

  addSafeText(slide2, `1. Về kiến thức:\n${knowledgeText}`, {
    x: 0.8,
    y: 1.4,
    w: '85%',
    h: 1.5,
    fontSize: 15,
    color: COLOR_DARK
  });

  addSafeText(slide2, `2. Về năng lực:\n${compText}`, {
    x: 0.8,
    y: 3.0,
    w: '85%',
    h: 1.4,
    fontSize: 15,
    color: COLOR_DARK
  });

  addSafeText(slide2, `3. Về phẩm chất:\n${qualityText}`, {
    x: 0.8,
    y: 4.5,
    w: '85%',
    h: 1.3,
    fontSize: 15,
    color: COLOR_DARK
  });

  // ==========================================
  // SLIDE 3: Thiết bị dạy học & Học liệu số
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: COLOR_IVORY };

  addSafeText(slide3, 'II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU SỐ', {
    x: 0.8,
    y: 0.6,
    w: '85%',
    h: 0.6,
    fontSize: 22,
    color: COLOR_BG_CHALK,
    bold: true
  });

  addSafeText(slide3, `1. CHUẨN BỊ CỦA GIÁO VIÊN:\n• ${plan.equipment.teacher.join('\n• ')}`, {
    x: 0.8,
    y: 1.5,
    w: 5.0,
    h: 4.4,
    fontSize: 14,
    color: '1E3A2F',
    fill: { color: 'E8F0EC' }
  });

  addSafeText(slide3, `2. CHUẨN BỊ CỦA HỌC SINH:\n• ${plan.equipment.students.join('\n• ')}`, {
    x: 6.1,
    y: 1.5,
    w: 5.0,
    h: 4.4,
    fontSize: 14,
    color: '8B4513',
    fill: { color: 'FDF4EB' }
  });

  // ==========================================
  // SLIDES 4-7: 4 Hoạt động bắt buộc của Công văn 5512
  // ==========================================
  plan.phases.forEach((phase, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_IVORY };

    // Phase Title Header
    addSafeText(slide, `HOẠT ĐỘNG ${index + 1}: ${phase.title.toUpperCase()}`, {
      x: 0.8,
      y: 0.5,
      w: '85%',
      h: 0.6,
      fontSize: 22,
      color: COLOR_BG_CHALK,
      bold: true
    });

    addSafeText(slide, `Thời lượng dự kiến: ${phase.durationMinutes} phút • Chuẩn hóa theo CV 5512`, {
      x: 0.8,
      y: 1.1,
      w: '85%',
      h: 0.4,
      fontSize: 13,
      color: '666666',
      italic: true
    });

    // a) Mục tiêu
    addSafeText(slide, `a) Mục tiêu: ${phase.objective}`, {
      x: 0.8,
      y: 1.6,
      w: '85%',
      h: 0.7,
      fontSize: 14,
      color: '1E3A2F',
      bold: true
    });

    // b) Nội dung nhiệm vụ
    addSafeText(slide, `b) Nội dung nhiệm vụ:\n${phase.content}`, {
      x: 0.8,
      y: 2.4,
      w: '85%',
      h: 1.3,
      fontSize: 14,
      color: COLOR_DARK
    });

    // c) Tổ chức thực hiện
    addSafeText(slide, `c) Tổ chức thực hiện (Giao nhiệm vụ -> Báo cáo -> Nhận định):\n${phase.implementation}`, {
      x: 0.8,
      y: 3.8,
      w: '85%',
      h: 2.5,
      fontSize: 13,
      color: '2C3E35'
    });
  });

  // ==========================================
  // SLIDE 8: Dạy học phân hóa (2 Tầng năng lực)
  // ==========================================
  const slide8 = pptx.addSlide();
  slide8.background = { color: COLOR_IVORY };

  addSafeText(slide8, 'IV. KẾ HOẠCH DẠY HỌC PHÂN HÓA (2 TẦNG NĂNG LỰC)', {
    x: 0.8,
    y: 0.6,
    w: '85%',
    h: 0.6,
    fontSize: 22,
    color: COLOR_BG_CHALK,
    bold: true
  });

  addSafeText(slide8, `TẦNG 1: CỐT LÕI (CHUẨN ĐẠT)\n\n• Đối tượng: ${plan.differentiation.tier1Core.targetAudience}\n\n• Chiến lược: ${plan.differentiation.tier1Core.strategy}\n\n• Bài tập mẫu: ${plan.differentiation.tier1Core.sampleExercise}`, {
    x: 0.8,
    y: 1.5,
    w: 5.0,
    h: 4.5,
    fontSize: 13,
    color: '0D47A1',
    fill: { color: 'E3F2FD' }
  });

  addSafeText(slide8, `TẦNG 2: MỞ RỘNG (NÂNG CAO)\n\n• Đối tượng: ${plan.differentiation.tier2Advanced.targetAudience}\n\n• Chiến lược: ${plan.differentiation.tier2Advanced.strategy}\n\n• Thử thách cao: ${plan.differentiation.tier2Advanced.sampleExercise}\n\n• Dự án tự chủ: ${plan.differentiation.tier2Advanced.independentChallenge}`, {
    x: 6.1,
    y: 1.5,
    w: 5.0,
    h: 4.5,
    fontSize: 13,
    color: '1B5E20',
    fill: { color: 'E8F5E9' }
  });

  // ==========================================
  // SLIDE 9: Học liệu tương tác Quizizz & QR Code
  // ==========================================
  const slide9 = pptx.addSlide();
  slide9.background = { color: COLOR_BG_CHALK };

  addSafeText(slide9, 'HỌC LIỆU TƯƠNG TÁC SỐ & KIỂM TRA NHANH', {
    x: 0.8,
    y: 0.8,
    w: '85%',
    h: 0.8,
    fontSize: 24,
    color: COLOR_GOLD,
    align: 'center',
    bold: true
  });

  addSafeText(slide9, `Quizizz tương tác: ${plan.interactiveResources.quizizz.title}\n\nMã tham gia trực tiếp: ${plan.interactiveResources.quizizz.gameCode || '849 201'}\n\nĐường dẫn vào phòng: ${plan.interactiveResources.quizizz.liveUrl}`, {
    x: 1.5,
    y: 2.0,
    w: '75%',
    h: 2.2,
    fontSize: 18,
    color: COLOR_WHITE,
    align: 'center'
  });

  addSafeText(slide9, 'Học sinh sử dụng điện thoại thông minh hoặc máy tính bảng để quét mã QR và tham gia.', {
    x: 1.0,
    y: 4.6,
    w: '80%',
    h: 0.6,
    fontSize: 14,
    color: 'EAEAEA',
    align: 'center',
    italic: true
  });

  // ==========================================
  // SLIDE 10: Tổng kết & Cảm ơn
  // ==========================================
  const slide10 = pptx.addSlide();
  slide10.background = { color: COLOR_BG_CHALK };

  addSafeText(slide10, 'TỔNG KẾT TIẾT HỌC', {
    x: 0.8,
    y: 1.5,
    w: '85%',
    h: 0.8,
    fontSize: 28,
    color: COLOR_GOLD,
    align: 'center',
    bold: true
  });

  addSafeText(slide10, '• Hoàn thành nhiệm vụ tự học và bài tập vận dụng ở nhà.\n• Chuẩn bị bài học tiếp theo theo hướng dẫn của giáo viên.', {
    x: 1.5,
    y: 2.6,
    w: '75%',
    h: 1.5,
    fontSize: 18,
    color: COLOR_WHITE,
    align: 'center'
  });

  addSafeText(slide10, 'Chúc các em học sinh học tập tiến bộ và tràn đầy niềm vui!\nCảm ơn quý thầy cô đã đồng hành cùng Lớp Mình.', {
    x: 1.0,
    y: 4.8,
    w: '80%',
    h: 1.0,
    fontSize: 16,
    color: COLOR_GOLD,
    align: 'center',
    italic: true
  });

  const sanitizedTitle = normalizeNFC(plan.title).replace(/[\\/:*?"<>|]/g, '_').slice(0, 30);
  const fileName = `BaiGiang_5512_${plan.subject}_${sanitizedTitle}.pptx`;

  await pptx.writeFile({ fileName: normalizeNFC(fileName) });
  SoundService.playSuccessChime();
}
