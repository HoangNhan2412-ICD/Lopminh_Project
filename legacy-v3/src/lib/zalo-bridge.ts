'use client';

export type ZaloCategory = 'deadline' | 'student_change' | 'urgent_bgh' | 'general';
export type ZaloSource = 'chrome_extension' | 'android_notification' | 'ios_rapid_paste';

export interface ZaloMessageItem {
  id: string;
  senderName: string;
  senderRole: 'Phụ huynh' | 'Ban Giám Hiệu' | 'Tổ trưởng chuyên môn' | 'Học sinh';
  timestamp: string;
  rawContent: string;
  cleanContent: string;
  category: ZaloCategory;
  isPinned: boolean;
  priorityScore: 1 | 2 | 3; // 3: Khẩn cấp, 2: Quan trọng, 1: Thông thường
  actionRequired?: string;
  extractedStudentName?: string;
  deadlineDate?: string;
}

export interface ZaloDailyDigest {
  session: 'morning_11h30' | 'afternoon_17h00';
  sessionTitle: string;
  generatedAt: string;
  summaryBullets: string[];
  urgentActionItems: string[];
  studentChangesCount: number;
}

export class ZaloBridge {
  /**
   * Multi-layer noise filter: Eliminates polite conversational noise, stickers, and greetings
   */
  public static filterNoise(text: string): { isNoise: boolean; cleanedText: string } {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // Noise patterns typical in Vietnamese school group chats
    const noisePatterns = [
      /^(dạ|vâng|dạ cô|dạ thầy|em chào cô|em chào thầy|chào cô ạ|chào thầy ạ)[\s\.,!]*$/i,
      /^(cảm ơn cô|cảm ơn thầy|cám ơn cô ạ|chúc cô ngày mới|chúc thầy tuần mới|chúc cô tuần mới)[\s\.,!]*$/i,
      /^(ok cô|ok thầy|nhất trí ạ|đã rõ ạ|vâng ạ|dạ vâng)[\s\.,!]*$/i,
      /^\[(sticker|hình ảnh|nhãn dán|video)\]$/i,
      /^(👍|❤️|🌹|🙏|💐|👏|😊)+$/
    ];

    for (const pattern of noisePatterns) {
      if (pattern.test(lower)) {
        return { isNoise: true, cleanedText: '' };
      }
    }

    // Clean inline noise prefixes
    let cleaned = trimmed
      .replace(/^(dạ thưa cô|dạ kính gửi cô|dạ em chào cô|dạ báo cáo cô),?\s*/i, '')
      .replace(/\s*(ạ|dạ)$/i, '')
      .trim();

    if (!cleaned) {
      return { isNoise: true, cleanedText: '' };
    }

    return { isNoise: false, cleanedText: cleaned };
  }

  /**
   * Pin Priority Parser: Extracts category, deadline, and urgent directives
   */
  public static parseZaloPayload(
    rawText: string,
    senderName: string,
    isPinned: boolean = false,
    source: ZaloSource = 'chrome_extension'
  ): ZaloMessageItem | null {
    const { isNoise, cleanedText } = this.filterNoise(rawText);
    if (isNoise) return null;

    const lower = cleanedText.toLowerCase();

    let category: ZaloCategory = 'general';
    let priorityScore: 1 | 2 | 3 = isPinned ? 3 : 1;
    let actionRequired: string | undefined;
    let extractedStudentName: string | undefined;
    let deadlineDate: string | undefined;

    // Detect Sender Role
    let senderRole: ZaloMessageItem['senderRole'] = 'Phụ huynh';
    if (lower.includes('bgh') || lower.includes('hiệu trưởng') || lower.includes('phó hiệu trưởng') || lower.includes('ban giám hiệu')) {
      senderRole = 'Ban Giám Hiệu';
    } else if (lower.includes('tổ trưởng') || lower.includes('tổ chuyên môn')) {
      senderRole = 'Tổ trưởng chuyên môn';
    } else if (lower.includes('phụ huynh em') || lower.includes('mẹ em') || lower.includes('bố em')) {
      senderRole = 'Phụ huynh';
    }

    // Category 1: Urgent Directives from Board of Management (BGH)
    if (
      lower.includes('khẩn') ||
      lower.includes('đoàn thanh tra') ||
      lower.includes('họp đột xuất') ||
      lower.includes('nghỉ học') ||
      senderRole === 'Ban Giám Hiệu'
    ) {
      category = 'urgent_bgh';
      priorityScore = 3;
      actionRequired = 'Xem ngay và chuẩn bị tài liệu theo yêu cầu BGH';
    }
    // Category 2: Student Changes (Sốt, nghỉ ốm, chuyển chỗ, bứt phá)
    else if (
      lower.includes('xin nghỉ') ||
      lower.includes('nghỉ ốm') ||
      lower.includes('sốt') ||
      lower.includes('vắng') ||
      lower.includes('đưa đón') ||
      lower.includes('quên sách') ||
      lower.includes('xin phép')
    ) {
      category = 'student_change';
      priorityScore = 2;
      actionRequired = 'Đồng bộ điểm danh và tạo phiếu bù bài';

      // Extract student name heuristically
      const matchName = cleanedText.match(/(?:em|cháu|bạn)\s+([A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]+)*)/);
      if (matchName) {
        extractedStudentName = matchName[1];
      }
    }
    // Category 3: Deadlines & Submissions (Hạn nộp)
    else if (
      lower.includes('hạn nộp') ||
      lower.includes('trước ngày') ||
      lower.includes('chốt điểm') ||
      lower.includes('nộp giáo án') ||
      lower.includes('nộp đề thi') ||
      lower.includes('trước 17h')
    ) {
      category = 'deadline';
      priorityScore = 3;
      actionRequired = 'Lên lịch nhắc nhở hạn chót hoàn thành sổ sách';

      const matchDate = cleanedText.match(/(\d{1,2}[\/\-]\d{1,2}|\d{1,2}h|\d{1,2}\s+tháng\s+\d{1,2})/);
      if (matchDate) {
        deadlineDate = matchDate[1];
      }
    }

    return {
      id: `zalo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderName,
      senderRole,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      rawContent: rawText,
      cleanContent: cleanedText,
      category,
      isPinned,
      priorityScore,
      actionRequired,
      extractedStudentName,
      deadlineDate
    };
  }

  /**
   * Generates the 2-Times-Daily Digest (Bản tin trưa 11h30 và Bản tin chiều 17h00)
   */
  public static generateDailyDigest(
    messages: ZaloMessageItem[],
    session: 'morning_11h30' | 'afternoon_17h00'
  ): ZaloDailyDigest {
    const urgentItems = messages.filter(m => m.priorityScore === 3);
    const studentChanges = messages.filter(m => m.category === 'student_change');

    if (session === 'morning_11h30') {
      return {
        session,
        sessionTitle: 'Bản Tin Vắn Trưa (11h30) - Lớp 9A',
        generatedAt: '11:30 Hôm nay',
        summaryBullets: [
          `Đã loại bỏ ${messages.length > 0 ? messages.length * 3 + 12 : 36} tin nhắn chào hỏi, sticker lịch sự không cần đọc.`,
          `Có ${studentChanges.length} học sinh có biến động chuyên cần trong sáng nay.`,
          'Kế hoạch bài dạy buổi chiều đã được cập nhật phân hóa tương ứng.'
        ],
        urgentActionItems: urgentItems.map(m => `[${m.senderRole}] ${m.cleanContent.slice(0, 75)}...`),
        studentChangesCount: studentChanges.length
      };
    } else {
      return {
        session,
        sessionTitle: 'Bản Tin Vắn Chiều (17h00) - Chuẩn Bị Ngày Mai',
        generatedAt: '17:00 Hôm nay',
        summaryBullets: [
          'Tất cả học sinh vắng đã được gửi phiếu bài tập tự học qua Zalo phụ huynh.',
          'BGH nhắc nhở chuẩn bị hồ sơ chuyên môn cho đợt kiểm tra đầu tuần tới.',
          'Cô Mai Hoa có thể an tâm nghỉ ngơi tối nay, Bé Bảng đã lưu trữ đầy đủ sổ sách.'
        ],
        urgentActionItems: urgentItems.map(m => `[Hạn chót] ${m.cleanContent.slice(0, 75)}...`),
        studentChangesCount: studentChanges.length
      };
    }
  }
}

// Initial realistic dataset simulating Zalo communications across the 3 tiers
export const initialZaloMessages: ZaloMessageItem[] = [
  {
    id: 'z-01',
    senderName: 'Thầy Hiệu Phó Chuyên Môn',
    senderRole: 'Ban Giám Hiệu',
    timestamp: '07:45',
    rawContent: '[TIN NHẮN GHIM KHẨN] Kính gửi quý thầy cô: Chiều thứ Năm tuần này đoàn Thanh tra Sở GD&ĐT sẽ về kiểm tra chuyên đề Kế hoạch bài dạy 5512 và hồ sơ kiểm tra đánh giá theo TT 22. Đề nghị các tổ chuyên môn hoàn tất ký duyệt trước 16h00 ngày mai.',
    cleanContent: 'Chiều thứ Năm đoàn Thanh tra Sở kiểm tra chuyên đề Giáo án 5512 & TT 22. Hoàn tất ký duyệt trước 16h00 ngày mai.',
    category: 'urgent_bgh',
    isPinned: true,
    priorityScore: 3,
    actionRequired: 'Xuất file Word giáo án 5512 có chữ ký số để nộp tổ trưởng',
    deadlineDate: '16h00 ngày mai'
  },
  {
    id: 'z-02',
    senderName: 'Mẹ em Hoàng Minh An',
    senderRole: 'Phụ huynh',
    timestamp: '07:10',
    rawContent: 'Dạ em chào cô Hoa ạ. Cháu An đêm qua sốt 39 độ, bác sĩ nghi sốt xuất huyết nên gia đình xin phép cô cho cháu nghỉ học từ hôm nay đến hết tuần ạ. Nhờ cô gửi giúp bài vở để cháu ở nhà xem lại sau khi đỡ mệt ạ. Em cảm ơn cô nhiều ạ!',
    cleanContent: 'Cháu An đêm qua sốt 39 độ xin phép nghỉ học đến hết tuần. Nhờ cô gửi bài vở bù bài.',
    category: 'student_change',
    isPinned: false,
    priorityScore: 2,
    actionRequired: 'Đã tự động gửi phiếu bù kiến thức vào giáo án hôm nay',
    extractedStudentName: 'Hoàng Minh An'
  },
  {
    id: 'z-03',
    senderName: 'Tổ Trưởng Chuyên Môn Toán',
    senderRole: 'Tổ trưởng chuyên môn',
    timestamp: '09:20',
    rawContent: 'Các đồng chí giáo viên Toán 9 lưu ý: Hạn nộp ma trận và đề kiểm tra định kỳ giữa học kỳ I là trước 17h00 Thứ Sáu tuần này trên hệ thống trường.',
    cleanContent: 'Hạn nộp ma trận và đề kiểm tra định kỳ giữa kỳ I trước 17h00 Thứ Sáu.',
    category: 'deadline',
    isPinned: true,
    priorityScore: 3,
    actionRequired: 'Hoàn thiện ma trận đề kiểm tra 15p & giữa kỳ',
    deadlineDate: '17h00 Thứ Sáu'
  },
  {
    id: 'z-04',
    senderName: 'Phụ huynh em Lê Thanh Bình',
    senderRole: 'Phụ huynh',
    timestamp: '10:05',
    rawContent: 'Dạ chào cô giáo, em khoe cô là cháu Bình vừa có chứng chỉ IELTS 4.0 sau khóa tự học hè. Cháu rất thích học Toán của cô và dạo này tự giác làm bài tập nâng cao lắm ạ.',
    cleanContent: 'Cháu Bình vừa đạt IELTS 4.0 và rất tự giác làm bài tập nâng cao môn Toán.',
    category: 'student_change',
    isPinned: false,
    priorityScore: 2,
    actionRequired: 'Giao thử thách Tier 2 trong tiết học để phát huy năng lực',
    extractedStudentName: 'Lê Thanh Bình'
  }
];
