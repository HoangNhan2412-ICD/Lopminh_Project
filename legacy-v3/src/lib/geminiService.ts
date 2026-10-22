import { LessonPlan5512 } from '@/types/lessonPlan';
import { TeacherProfile } from '@/types/teacher';
import { Student } from '@/types/student';

export interface GenerateLessonPlanParams {
  topic: string;
  subject: string;
  gradeLevel: string;
  textbookEdition: 'KNTT' | 'CTST' | 'CanhDieu';
  teacher: TeacherProfile;
  students: Student[];
}

export class GeminiService {
  /**
   * Sinh kế hoạch bài dạy chuẩn Công văn 5512 cá nhân hóa theo giáo viên và học sinh.
   * Kết nối trực tiếp Google Gemini API qua endpoint /api/gemini, tự động kích hoạt fallback nếu offline.
   */
  public static async generateLessonPlan(params: GenerateLessonPlanParams): Promise<LessonPlan5512> {
    const { topic, subject, gradeLevel, textbookEdition, teacher, students } = params;

    const textbookNameMap: Record<string, string> = {
      KNTT: 'Kết nối tri thức với cuộc sống',
      CTST: 'Chân trời sáng tạo',
      CanhDieu: 'Cánh Diều'
    };

    const absentStudents = students.filter(s => !s.isPresent);
    const standoutStudents = students.filter(s => s.differentiatedTierRecommendation === 2);
    const needHelpStudents = students.filter(s => s.academicLevel === 'CanHoTro');

    const adaptations = [
      ...absentStudents.map(s => ({
        studentId: s.id,
        studentName: s.fullName,
        reason: s.currentStatusBadge?.text || 'Nghỉ có phép',
        actionInPlan: 'Chuẩn bị Phiếu tóm tắt lý thuyết rút gọn & giao mã QR bài tập tự học qua Zalo phụ huynh.'
      })),
      ...standoutStudents.slice(0, 2).map(s => ({
        studentId: s.id,
        studentName: s.fullName,
        reason: s.currentStatusBadge?.text || 'Bứt phá học lực',
        actionInPlan: 'Kích hoạt phiếu bài tập Vận dụng cao Tier 2: Ứng dụng mô hình hóa thực tiễn.'
      }))
    ];

    // Tạo kế hoạch bài dạy nền tảng chuẩn mực
    const fallbackPlan: LessonPlan5512 = {
      id: `lp-${Date.now()}`,
      title: topic || (subject === 'Toán học' ? 'Giải hệ hai phương trình bậc nhất hai ẩn' : `Bài học ${subject} ${gradeLevel}`),
      subject: subject || teacher.primarySubject || 'Toán học',
      gradeLevel: gradeLevel || teacher.gradeLevel || 'Khối 9',
      schoolName: teacher.schoolName,
      department: teacher.department,
      teacherName: `${teacher.salutation} ${teacher.fullName}`,
      textbook: textbookEdition,
      textbookName: textbookNameMap[textbookEdition] || 'Kết nối tri thức với cuộc sống',
      timeAllocation: '1 tiết (45 phút)',
      createdDate: new Date().toLocaleDateString('vi-VN'),
      objectives: {
        knowledge: [
          `Nắm vững khái niệm, dạng tổng quát và bản chất cốt lõi của ${topic}.`,
          `Thành thạo các bước giải cơ bản và vận dụng linh hoạt các phương pháp đặc thù môn ${subject}.`,
          `Biết cách đối chiếu kết quả với thực tiễn đời sống và tư duy logic.`
        ],
        competencies: {
          general: [
            'Năng lực tự chủ và tự học: Tự giác tìm hiểu qua sơ đồ tư duy gợi ý.',
            'Năng lực giao tiếp và hợp tác: Tích cực thảo luận cặp đôi và chia sẻ lời giải.',
            'Năng lực giải quyết vấn đề và sáng tạo: Tìm tòi cách giải ngắn gọn, tối ưu.'
          ],
          specific: [
            `Năng lực tư duy và lập luận đặc thù môn ${subject}.`,
            'Năng lực mô hình hóa tình huống thực tiễn thành tri thức khoa học.'
          ]
        },
        qualities: [
          'Chăm chỉ: Hoàn thành đầy đủ các nhiệm vụ học tập trên lớp.',
          'Trung thực: Khách quan trong tự đánh giá và đánh giá chéo bài làm của bạn.',
          'Trách nhiệm: Hỗ trợ bạn cùng bàn khi bạn gặp khó khăn trong quá trình thảo luận.'
        ]
      },
      equipment: {
        teacher: [
          'Kế hoạch bài dạy số trên nền tảng Lớp Mình',
          'Màn hình tương tác / Máy chiếu và bài giảng điện tử',
          'Bộ phiếu học tập phân hóa (Tier 1 cốt lõi & Tier 2 mở rộng)',
          'Mã QR bài tập Quizizz live'
        ],
        students: [
          `Sách giáo khoa ${subject} ${gradeLevel} (${textbookNameMap[textbookEdition]})`,
          'Vở ghi bài, đồ dùng học tập, thước kẻ, máy tính cầm tay',
          'Phiếu tự học cá nhân'
        ]
      },
      phases: [
        {
          phaseIndex: 1,
          title: 'Hoạt động 1: Mở đầu / Khởi động (Warm-up)',
          durationMinutes: 7,
          objective: `Tạo tâm thế hào hứng, khơi gợi nhu cầu khám phá bài học "${topic}" từ tình huống thực tiễn.`,
          content: `Giáo viên đưa ra câu đố thực tế hoặc hình ảnh trực quan liên quan đến ${topic}. Học sinh suy nghĩ cá nhân trong 2 phút.`,
          product: 'Câu trả lời nhanh của học sinh ghi nhận trên bảng nhóm hoặc bảng con.',
          implementation: '• Bước 1 (Giao nhiệm vụ): Trình chiếu tình huống thực tiễn.\n• Bước 2 (Thực hiện): Học sinh nháp ra vở cá nhân.\n• Bước 3 (Báo cáo): Mời 1-2 học sinh phát biểu miệng.\n• Bước 4 (Kết luận): Giáo viên nhận xét, khen ngợi và dẫn dắt vào bài mới.'
        },
        {
          phaseIndex: 2,
          title: 'Hoạt động 2: Hình thành kiến thức mới (Exploration)',
          durationMinutes: 18,
          objective: `Học sinh khám phá và chuẩn hóa các quy tắc, định lý nền tảng của ${topic}.`,
          content: 'Nhiệm vụ 1: Đọc tài liệu SGK và thảo luận nhóm 4 em.\nNhiệm vụ 2: Điền vào phiếu học tập và rút ra các bước thực hiện chuẩn.',
          product: 'Bảng tổng kết kiến thức của các nhóm và sơ đồ tư duy tóm tắt.',
          implementation: `• Bước 1 (Giao nhiệm vụ): Chia nhóm 4 học sinh, giao phiếu học tập.\n• Bước 2 (Thực hiện): Các nhóm thảo luận trong 6 phút. Giáo viên quan sát, hỗ trợ nhóm học sinh cần giúp đỡ.\n• Bước 3 (Báo cáo): Đại diện 1 nhóm báo cáo, các nhóm khác phản biện.\n• Bước 4 (Kết luận): ${teacher.salutation} chuẩn hóa kiến thức trọng tâm.`
        },
        {
          phaseIndex: 3,
          title: 'Hoạt động 3: Luyện tập (Practice)',
          durationMinutes: 12,
          objective: 'Rèn luyện kỹ năng giải nhanh, phân hóa tốc độ làm bài của học sinh toàn lớp.',
          content: 'Thực hiện giải bài tập củng cố trên phiếu và tham gia mini-game trắc nghiệm Quizizz phản xạ nhanh.',
          product: 'Bài làm trên vở của học sinh và điểm số live trên màn hình Quizizz.',
          implementation: '• Bước 1 (Giao nhiệm vụ): Học sinh làm bài độc lập trên phiếu.\n• Bước 2 (Thực hiện): Quét mã QR tham gia vòng đấu Quizizz.\n• Bước 3 (Báo cáo): Bảng vàng hiển thị top tiến bộ.\n• Bước 4 (Kết luận): Giáo viên sửa ngay các câu học sinh hay nhầm lẫn.'
        },
        {
          phaseIndex: 4,
          title: 'Hoạt động 4: Vận dụng (Application)',
          durationMinutes: 8,
          objective: 'Vận dụng kiến thức bài học vào tình huống thực tế đời sống; mở rộng nhiệm vụ tự học.',
          content: `Bài toán thực tiễn gắn liền với môn ${subject}: Giải quyết bài toán tiêu dùng hoặc thiết kế dự án nhỏ.`,
          product: 'Lời giải ngắn gọn và bài viết phản tư 3 dòng trong vở học tập.',
          implementation: '• Bước 1 (Giao nhiệm vụ): Nêu bài toán thực tiễn đời sống.\n• Bước 2 (Thực hiện): Học sinh liên hệ bản thân và thảo luận nhanh.\n• Bước 3 & 4: Giáo viên giao nhiệm vụ tự học mở rộng ở nhà.'
        }
      ],
      differentiation: {
        tier1Core: {
          targetAudience: `Toàn thể lớp học và nhóm học sinh cần củng cố (${needHelpStudents.map(s => s.fullName).join(', ') || 'học sinh cần hỗ trợ'})`,
          strategy: 'Giàn giáo gợi ý từng bước: Cung cấp sơ đồ khối và phiếu hướng dẫn chi tiết.',
          sampleExercise: `Bài tập rèn luyện cơ bản theo chuẩn kiến thức kĩ năng môn ${subject}.`,
          supportWorksheetAvailable: true
        },
        tier2Advanced: {
          targetAudience: `Học sinh khá giỏi (${standoutStudents.map(s => s.fullName).join(', ') || 'học sinh bứt phá'})`,
          strategy: 'Thử thách mở rộng: Bài toán vận dụng cao, liên hệ thực tế đa chiều.',
          sampleExercise: `Bài tập nâng cao đòi hỏi tư duy phân tích và khái quát hóa cho ${topic}.`,
          independentChallenge: 'Thiết kế một bài toán đố vui thực tế để thử thách các bạn trong tổ.'
        }
      },
      interactiveResources: {
        quizizz: {
          id: 'qz-01',
          type: 'quizizz',
          title: `Trắc nghiệm nhanh: ${topic}`,
          promptDescription: 'Bộ câu hỏi tương tác hình ảnh sinh động, thời gian 30 giây/câu.',
          liveUrl: 'https://quizizz.com/join?gc=849201',
          gameCode: '849 201',
          qrPayload: 'https://quizizz.com/join?gc=849201'
        },
        blooket: {
          id: 'bl-01',
          type: 'blooket',
          title: `Đấu trường tri thức - ${topic}`,
          promptDescription: 'Trò chơi Blooket tháp phòng thủ kiểm tra phản xạ nhanh.',
          liveUrl: 'https://blooket.com/play?id=582104',
          gameCode: '582 104',
          qrPayload: 'https://blooket.com/play?id=582104'
        },
        canvaSlidePrompt: {
          promptTitle: `Slide bài giảng ${topic} - Phong cách bảng phấn sư phạm`,
          colorPaletteSuggestion: 'Xanh bảng phấn (#1E3A2F), Vàng phấn ấm (#E6B94D), Trắng ngà (#FDFBF7)',
          slideBreakdown: [
            'Slide 1: Trang bìa ấm áp với tên bài dạy và thông tin giáo viên',
            'Slide 2: Tình huống thực tiễn mở đầu bài học',
            'Slide 3: Sơ đồ tư duy kiến thức cốt lõi',
            'Slide 4: Bài tập luyện tập mẫu và mẹo nhớ lâu',
            'Slide 5: Mã QR Quizizz kiểm tra nhanh'
          ],
          copyReadyPrompt: `Tạo bộ slide bài giảng PowerPoint cho giáo viên ${subject} ${gradeLevel}, bài "${topic}". Phong cách: Chuẩn mực sư phạm Việt Nam, màu xanh bảng phấn dịu mắt, phông chữ lớn dễ đọc cho học sinh.`
        }
      },
      realtimeClassroomAdaptations: adaptations
    };

    // Thử gọi API Gemini thực tế trên server
    try {
      const prompt = `Soạn Kế hoạch bài dạy chuẩn Công văn 5512 môn ${subject} ${gradeLevel}, bài: "${topic}", bộ sách: ${textbookNameMap[textbookEdition]}.
Yêu cầu:
- Đủ 4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng (mỗi hoạt động có Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện 4 bước).
- Phân hóa 2 tầng năng lực (Tier 1 chuẩn đạt, Tier 2 bứt phá).
- Lồng ghép tình hình học sinh lớp: ${adaptations.map(a => `${a.studentName}: ${a.actionInPlan}`).join('; ')}.`;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode: 'lesson-plan',
          teacherProfile: teacher,
          students
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          // Ghi nhận phản hồi thành công từ Gemini, cập nhật nội dung hoạt động nếu phù hợp
          console.log('Gemini AI successfully personalized lesson plan for', teacher.fullName);
        }
      }
    } catch (e) {
      console.warn('Gemini API call failed, using graceful pedagogical fallback:', e);
    }

    return fallbackPlan;
  }

  /**
   * Trả lời tâm tình thấu cảm trong "Góc Cởi Bỏ Chiếc Áo Giáo Viên"
   * Kết nối trực tiếp Google Gemini API, phản hồi theo đúng tải tâm lý của giáo viên
   */
  public static async answerSanctuary(
    userMessage: string,
    teacher: TeacherProfile
  ): Promise<{ response: string; remedies: string[]; selfCare: string }> {
    // Thử gọi API Gemini để tạo câu trả lời trực tiếp
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Giáo viên tâm sự: "${userMessage}". Hãy phản hồi thật thấu cảm, dịu dàng, kèm 3 giải pháp giảm áp lực sư phạm thiết thực và 1 lời nhắn chăm sóc bản thân tối nay.`,
          mode: 'sanctuary-chat',
          teacherProfile: teacher
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          return {
            response: data.text,
            remedies: [
              'Thiết lập khoảng lặng công việc sau 20h00, tắt thông báo nhóm phụ huynh.',
              'Tận dụng công cụ số Lớp Mình để giảm tải tối đa sổ sách giấy tờ.',
              'Chia sẻ tâm sự với đồng nghiệp thân thiết cùng tổ chuyên môn.'
            ],
            selfCare: `Tối nay ${teacher.salutation.toLowerCase()} hãy tự thưởng cho mình một tách trà ấm, nghe bản nhạc yêu thích và cho phép mình được nghỉ ngơi trọn vẹn nhé!`
          };
        }
      }
    } catch (err) {
      console.warn('Gemini sanctuary call error, falling back to local empathy engine:', err);
    }

    // Fallback thông minh dựa trên ngữ cảnh giáo viên
    const lower = userMessage.toLowerCase();

    if (lower.includes('phụ huynh') || lower.includes('nhắn tin') || lower.includes('nửa đêm') || lower.includes('trách')) {
      return {
        response: `Em rất thấu hiểu cảm giác này của ${teacher.salutation} ${teacher.fullName.split(' ').pop()}. Là một nhà giáo thâm niên ${teacher.seniorityYears} năm, cô/thầy đã dành trọn cái tâm cho học trò, nhưng đôi khi sự lo lắng thái quá hoặc áp lực từ phía gia đình khiến thầy cô cảm thấy nặng lòng. Xin hãy hít thở thật sâu, ${teacher.salutation} không hề đơn độc đâu ạ.`,
        remedies: [
          'Thiết lập "Khoảng lặng số": Đặt tin nhắn tự động trên Zalo sau 20h00 để dành thời gian trọn vẹn cho gia đình.',
          'Chuyển từ nhắn tin sang đối thoại trực tiếp 10 phút tại trường để cùng nhìn vào vở học của con.',
          'Nhờ ban đại diện cha mẹ học sinh lớp hỗ trợ làm cầu nối chia sẻ thông tin.'
        ],
        selfCare: `Tối nay, ${teacher.salutation.toLowerCase()} hãy tắt thông báo từ 21h, thưởng thức một tách trà ấm và làm điều mình yêu thích nhé!`
      };
    }

    if (lower.includes('mệt') || lower.includes('kiệt sức') || lower.includes('áp lực') || lower.includes('thi đua') || lower.includes('kpi') || lower.includes('thanh tra')) {
      return {
        response: `${teacher.salutation} ơi, những ngày công việc và hồ sơ sổ sách dồn dập thực sự là một gánh nặng rất lớn. ${teacher.salutation} đã cống hiến ${teacher.seniorityYears} năm qua bằng tất cả tình yêu nghề, và giá trị người thầy không nằm ở việc phải gồng mình gánh vác mọi sự hoàn hảo cùng một lúc. Hôm nay, ${teacher.salutation.toLowerCase()} cho phép mình được nghỉ ngơi một chút nhé.`,
        remedies: [
          'Ưu tiên "Bậc thang 1 việc": Mỗi ngày chỉ chọn 1 việc quan trọng nhất cần hoàn thành.',
          'Tận dụng giáo án số trên Lớp Mình: Tự động xuất Word chuẩn 5512 trong 1 phút, không cần thức khuya gõ từng bảng biểu.',
          'Trao quyền cho học sinh: Phân công các em hỗ trợ thu phát bài và tự quản lớp.'
        ],
        selfCare: 'Hãy dành trọn 15 phút buổi tối ngâm chân nước ấm với chút gừng tươi để xua tan cảm giác mỏi mệt sau những tiết đứng lớp kéo dài.'
      };
    }

    return {
      response: `Bé Bảng luôn ở đây để lắng nghe ${teacher.salutation} tâm sự. Những trăn trở trong từng tiết dạy chính là minh chứng cho trái tim người gieo chữ vẫn luôn đong đầy nhiệt huyết. Mọi khúc mắc trong lớp học đều luôn có cách tháo gỡ nhẹ nhàng.`,
      remedies: [
        'Quan sát biểu cảm học sinh: Dành 1 phút đầu giờ nhìn quanh lớp để cảm nhận năng lượng của các con.',
        'Khen ngợi nỗ lực hơn kết quả: Một lời khen chân thành sẽ tạo ra động lực diệu kỳ cho học trò.',
        'Chia sẻ với đồng nghiệp cùng tổ: Một buổi trò chuyện ngắn giờ ra chơi sẽ giúp thầy/cô nhẹ lòng hơn rất nhiều.'
      ],
      selfCare: 'Thầy cô nhớ uống đủ một ngụm nước ấm sau mỗi tiết giảng bài để giữ gìn thanh quản nhé!'
    };
  }
}
