import { TeacherProfile } from '@/types/teacher';
import { Student } from '@/types/student';
import { LessonPlan5512 } from '@/types/lessonPlan';
import { SanctuaryMessage } from '@/types/sanctuary';

export interface TenantData {
  teacher: TeacherProfile;
  students: Student[];
  initialLessonPlan: LessonPlan5512;
  initialChatMessages: SanctuaryMessage[];
}

export const TENANT_PRESETS: Record<string, TenantData> = {
  // =========================================================================
  // TENANT 1: Cô Nguyễn Thị Mai Hoa (Toán 9, THCS Chu Văn An, Hà Nội)
  // =========================================================================
  'teacher-mai-hoa': {
    teacher: {
      id: 'teacher-mai-hoa',
      fullName: 'Nguyễn Thị Mai Hoa',
      salutation: 'Cô',
      schoolName: 'THCS Chu Văn An - Hà Nội',
      department: 'Tổ Tự Nhiên (Toán - KHTN)',
      primarySubject: 'Toán học',
      secondarySubjects: ['Khoa học Tự nhiên', 'Hoạt động Trải nghiệm'],
      gradeLevel: 'Khối 9',
      assignedClass: '9A',
      subjectClasses: ['9B', '9C'],
      seniorityYears: 24,
      teachingStyle: 'Bao dung, Chậm mà chắc, Khơi gợi qua hình ảnh thực tiễn',
      personalInterests: [
        'Chăm sóc chậu hoa lan ngoài ban công',
        'Thưởng trà sen ấm buổi sớm',
        'Ghi chép sổ tay sư phạm về từng học trò'
      ],
      psychologicalLoad: 'moderate',
      stressFactorNote: 'Chuẩn bị tiết chuyên đề thao giảng Đổi mới Phương pháp dạy học chào mừng Ngày 20/11',
      aiTonePreference: 'warm_respectful',
      kpis: [
        {
          id: 'kpi-1',
          title: 'Tỉ lệ học sinh đạt chuẩn môn Toán 9A',
          target: '100% đạt Đạt trở lên',
          current: '97.5% (còn 1 em đang được hỗ trợ)',
          progressPercent: 97,
          category: 'chuyen-mon'
        },
        {
          id: 'kpi-2',
          title: 'Tỉ lệ học sinh Khá & Giỏi',
          target: 'Tối thiểu 35%',
          current: '38.2% (vượt chỉ tiêu)',
          progressPercent: 100,
          category: 'chuyen-mon'
        }
      ],
      upcomingEvents: [
        {
          id: 'evt-1',
          title: 'Hội giảng chào mừng 20/11 cấp Quận',
          date: 'Thứ Năm, 14/11',
          time: '08:00 - 09:30',
          location: 'Phòng học thông minh 204',
          importance: 'high'
        }
      ]
    },
    students: [
      {
        id: 'hs-01',
        orderNumber: 1,
        fullName: 'Hoàng Minh An',
        avatarSeed: 'An',
        gender: 'nam',
        birthYear: 2011,
        academicLevel: 'TrungBinh',
        personalityTraits: ['Chăm chỉ', 'Dễ mẫn cảm', 'Thích vẽ sơ đồ tư duy'],
        isPresent: false,
        currentStatusBadge: {
          text: 'Nghỉ ốm sốt đến hết tuần',
          variant: 'danger'
        },
        differentiatedTierRecommendation: 1,
        notesForNextLesson: 'Cần phiếu tóm tắt lý thuyết bù bài và đường link tự học trực tuyến',
        behavioralLogs: [
          {
            id: 'log-01-a',
            timestamp: 'Hôm nay, 07:15',
            category: 'attendance',
            text: 'Phụ huynh gọi điện báo An sốt xuất huyết độ nhẹ, xin nghỉ dưỡng sức từ thứ Ba đến hết thứ Sáu.',
            impactNote: 'Đã tự động đính kèm Phiếu bài tập bù kiến thức vào Kế hoạch bài dạy hôm nay',
            resolved: false
          }
        ]
      },
      {
        id: 'hs-02',
        orderNumber: 2,
        fullName: 'Lê Thanh Bình',
        avatarSeed: 'Binh',
        gender: 'nam',
        birthYear: 2011,
        academicLevel: 'Gioi',
        personalityTraits: ['Hướng ngoại', 'Bứt phá nhanh', 'Thích giải quyết vấn đề khó'],
        isPresent: true,
        currentStatusBadge: {
          text: 'Bứt phá: Đạt IELTS 4.0 & HSG Toán',
          variant: 'success'
        },
        differentiatedTierRecommendation: 2,
        notesForNextLesson: 'Giao nhiệm vụ Tier 2: Ứng dụng hệ phương trình giải quyết bài toán quy hoạch thực tế',
        behavioralLogs: [
          {
            id: 'log-02-a',
            timestamp: 'Hôm qua, 16:30',
            category: 'achievement',
            text: 'Bình khoe đạt chứng chỉ IELTS 4.0 sau 3 tháng tự rèn luyện và vừa hoàn thành xuất sắc đề thi HSG Quận.',
            impactNote: 'Kích hoạt thử thách độc lập Tier 2 trong tiết học để phát huy tối đa năng lực',
            resolved: true
          }
        ]
      },
      {
        id: 'hs-03',
        orderNumber: 3,
        fullName: 'Phạm Thu Cúc',
        avatarSeed: 'Cuc',
        gender: 'nu',
        birthYear: 2011,
        academicLevel: 'Kha',
        personalityTraits: ['Trầm lặng', 'Cẩn thận', 'Tỉ mỉ từng bước giải'],
        isPresent: true,
        currentStatusBadge: {
          text: 'Chăm chỉ: Làm đủ 100% bài về nhà',
          variant: 'info'
        },
        differentiatedTierRecommendation: 1,
        behavioralLogs: []
      },
      {
        id: 'hs-04',
        orderNumber: 4,
        fullName: 'Trần Tuấn Dũng',
        avatarSeed: 'Dung',
        gender: 'nam',
        birthYear: 2011,
        academicLevel: 'CanHoTro',
        personalityTraits: ['Hiếu động', 'Dễ mất tập trung', 'Học tốt qua trò chơi'],
        isPresent: true,
        currentStatusBadge: {
          text: 'Cần hỗ trợ: Còn nhầm dấu khi chuyển vế',
          variant: 'warning'
        },
        differentiatedTierRecommendation: 1,
        notesForNextLesson: 'Xếp ngồi cạnh bạn Cúc để hỗ trợ chéo trong hoạt động luyện tập',
        behavioralLogs: []
      }
    ],
    initialLessonPlan: {
      id: 'lp-mai-hoa-01',
      title: 'Giải hệ hai phương trình bậc nhất hai ẩn',
      subject: 'Toán học',
      gradeLevel: 'Khối 9',
      schoolName: 'THCS Chu Văn An - Hà Nội',
      department: 'Tổ Tự Nhiên (Toán - KHTN)',
      teacherName: 'Cô Nguyễn Thị Mai Hoa',
      textbook: 'KNTT',
      textbookName: 'Kết nối tri thức với cuộc sống',
      timeAllocation: '1 tiết (45 phút)',
      createdDate: 'Hôm nay',
      objectives: {
        knowledge: [
          'Nắm vững định nghĩa hệ phương trình bậc nhất hai ẩn và nghiệm của hệ.',
          'Thành thạo phương pháp thế và phương pháp cộng đại số.',
          'Nhận biết ý nghĩa hình học của tập nghiệm trên mặt phẳng tọa độ Oxy.'
        ],
        competencies: {
          general: ['Tự chủ và tự học', 'Giao tiếp và hợp tác nhóm'],
          specific: ['Tư duy và lập luận toán học', 'Mô hình hóa bài toán thực tế']
        },
        qualities: ['Cẩn trọng trong tính toán', 'Trung thực khi đánh giá chéo']
      },
      equipment: {
        teacher: ['Máy chiếu tương tác', 'Bài giảng điện tử PowerPoint 16:9', 'Phiếu học tập phân hóa 2 tầng'],
        students: ['Sách giáo khoa Toán 9 KNTT', 'Vở ghi, máy tính cầm tay Casio']
      },
      phases: [
        {
          phaseIndex: 1,
          title: 'Hoạt động 1: Khởi động (Warm-up)',
          durationMinutes: 7,
          objective: 'Tạo tâm thế hứng khởi qua bài toán cổ "Vừa gà vừa chó bó lại cho tròn".',
          content: 'Học sinh phân tích dữ liệu 36 con và 100 chân để lập quan hệ đại số.',
          product: 'Hệ hai phương trình x + y = 36 và 2x + 4y = 100.',
          implementation: 'Giáo viên nêu câu đố dân gian -> Học sinh viết bảng con -> Giáo viên dẫn dắt vào bài.'
        },
        {
          phaseIndex: 2,
          title: 'Hoạt động 2: Hình thành kiến thức (Exploration)',
          durationMinutes: 18,
          objective: 'Xây dựng quy tắc giải hệ bằng phương pháp thế.',
          content: 'Rút x theo y từ phương trình thứ nhất, thế vào phương trình thứ hai.',
          product: 'Quy trình 3 bước chuẩn mực giải hệ phương trình bằng phương pháp thế.',
          implementation: 'Thảo luận nhóm đôi -> Đại diện trình bày -> Giáo viên chuẩn hóa lý thuyết.'
        },
        {
          phaseIndex: 3,
          title: 'Hoạt động 3: Luyện tập (Practice)',
          durationMinutes: 12,
          objective: 'Thực hành giải 3 hệ phương trình có hệ số khác nhau.',
          content: 'Làm bài tập phiếu học tập và tham gia vòng trắc nghiệm Quizizz phản xạ nhanh.',
          product: 'Bài làm đúng của học sinh và điểm số thời gian thực trên Quizizz.',
          implementation: 'Học sinh làm độc lập -> Giáo viên hỗ trợ nhóm em Dũng -> Chữa bài mẫu.'
        },
        {
          phaseIndex: 4,
          title: 'Hoạt động 4: Vận dụng (Application)',
          durationMinutes: 8,
          objective: 'Ứng dụng giải bài toán pha chế dung dịch nước muối sinh lý.',
          content: 'Tính lượng dung dịch muối 5% và 20% cần trộn để được 500g dung dịch 10%.',
          product: 'Mô hình đại số đúng và lời giải bài toán thực tế.',
          implementation: 'Giao nhiệm vụ vận dụng thực tiễn -> Hướng dẫn tự học ở nhà.'
        }
      ],
      differentiation: {
        tier1Core: {
          targetAudience: 'Toàn bộ học sinh và nhóm em Dũng cần hỗ trợ',
          strategy: 'Cung cấp sơ đồ giàn giáo từng bước: Rút ẩn -> Thế ẩn -> Tìm nghiệm',
          sampleExercise: 'Giải hệ: x - y = 2 và 3x + y = 10 (hệ số nguyên đơn giản)',
          supportWorksheetAvailable: true
        },
        tier2Advanced: {
          targetAudience: 'Học sinh khá giỏi và em Bình bứt phá',
          strategy: 'Thử thách bài toán chứa tham số m và ứng dụng quy hoạch tối ưu',
          sampleExercise: 'Tìm m để hệ có nghiệm duy nhất thỏa mãn x + y > 0',
          independentChallenge: 'Thiết kế bài toán thực tế về quản lý chi tiêu gia đình bằng hệ phương trình'
        }
      },
      interactiveResources: {
        quizizz: {
          id: 'qz-01',
          type: 'quizizz',
          title: 'Ôn tập nhanh Hệ hai phương trình bậc nhất hai ẩn',
          promptDescription: 'Bộ 5 câu hỏi tương tác trắc nghiệm hình ảnh vui nhộn.',
          gameCode: '849 201',
          liveUrl: 'https://quizizz.com/join?gc=849201',
          qrPayload: 'https://quizizz.com/join?gc=849201'
        },
        blooket: {
          id: 'bl-01',
          type: 'blooket',
          title: 'Tháp phòng thủ Toán 9 - Hệ phương trình',
          promptDescription: 'Trò chơi phản xạ nhanh Blooket',
          liveUrl: 'https://blooket.com/play?id=582104',
          gameCode: '582 104',
          qrPayload: 'https://blooket.com/play?id=582104'
        },
        canvaSlidePrompt: {
          promptTitle: 'Slide Toán 9 Hệ phương trình phong cách bảng phấn',
          colorPaletteSuggestion: 'Xanh bảng phấn, vàng phấn ấm, trắng ngà',
          slideBreakdown: ['Trang bìa', 'Mở đầu bài toán gà vịt', 'Quy tắc thế', 'Luyện tập', 'Tổng kết'],
          copyReadyPrompt: 'Slide thuyết trình bài giảng Toán 9: Giải hệ phương trình bậc nhất hai ẩn, phong cách bảng phấn xanh lá dịu mắt, hình minh họa trực quan.'
        }
      },
      realtimeClassroomAdaptations: [
        {
          studentId: 'hs-01',
          studentName: 'Hoàng Minh An',
          reason: 'Nghỉ ốm sốt đến hết tuần',
          actionInPlan: 'Gửi phiếu tóm tắt phương pháp thế kèm video bài giảng qua Zalo phụ huynh.'
        },
        {
          studentId: 'hs-02',
          studentName: 'Lê Thanh Bình',
          reason: 'Bứt phá: Đạt IELTS 4.0 & HSG Toán',
          actionInPlan: 'Giao phiếu bài tập Tier 2 ứng dụng tham số m và mô hình toán thực tiễn.'
        }
      ]
    },
    initialChatMessages: [
      {
        id: 'msg-mh-1',
        sender: 'ai',
        content: 'Em chào Cô Mai Hoa ạ! Hôm nay lớp 9A có em An đang nghỉ ốm, em đã chuẩn bị sẵn phiếu bù kiến thức môn Toán cho cô rồi. Tiết thao giảng 20/11 sắp tới, cô cảm thấy thế nào ạ? Nếu thấy mỏi mệt, cô cứ nhắn em nhé!',
        timestamp: '07:30'
      }
    ]
  },

  // =========================================================================
  // TENANT 2: Thầy Nguyễn Đức Nam (Vật lý 11, THPT Chuyên Hà Nội - Amsterdam)
  // =========================================================================
  'teacher-duc-nam': {
    teacher: {
      id: 'teacher-duc-nam',
      fullName: 'Nguyễn Đức Nam',
      salutation: 'Thầy',
      schoolName: 'THPT Chuyên Hà Nội - Amsterdam',
      department: 'Tổ Vật lý - Công nghệ',
      primarySubject: 'Vật lý',
      secondarySubjects: ['Công nghệ Kỹ thuật', 'STEM'],
      gradeLevel: 'Khối 11',
      assignedClass: '11 Lý 1',
      seniorityYears: 8,
      teachingStyle: 'Năng động, ứng dụng STEM thực nghiệm, kích thích phản biện logic',
      personalInterests: [
        'Lắp ráp robot và mạch vi điều khiển Arduino',
        'Chạy bộ marathon cuối tuần',
        'Đọc tạp chí vật lý ứng dụng'
      ],
      psychologicalLoad: 'light',
      stressFactorNote: 'Đang rất hào hứng chuẩn bị đề tài Dự án STEM năng lượng tái tạo dự thi cấp Thành phố',
      aiTonePreference: 'concise_efficient',
      kpis: [
        {
          id: 'kpi-nam-1',
          title: 'Chỉ tiêu học sinh giỏi Olympic Vật lý',
          target: '100% đạt giải cấp Cụm trở lên',
          current: 'Đạt 4 giải Nhất, 2 giải Nhì',
          progressPercent: 100,
          category: 'chuyen-mon'
        }
      ],
      upcomingEvents: [
        {
          id: 'evt-nam-1',
          title: 'Chung kết Cuộc thi Sáng tạo STEM Thành phố',
          date: 'Thứ Bảy, 23/11',
          time: '08:30 - 16:00',
          location: 'Nhà thi đấu trường Ams',
          importance: 'high'
        }
      ]
    },
    students: [
      {
        id: 'hs-nam-01',
        orderNumber: 1,
        fullName: 'Vũ Quang Minh',
        avatarSeed: 'Minh',
        gender: 'nam',
        birthYear: 2009,
        academicLevel: 'Gioi',
        personalityTraits: ['Tư duy sắc bén', 'Thích nghiên cứu vật lý lý thuyết'],
        isPresent: true,
        currentStatusBadge: {
          text: 'Thủ khoa Olympic Vật lý Cụm',
          variant: 'success'
        },
        differentiatedTierRecommendation: 2,
        behavioralLogs: []
      },
      {
        id: 'hs-nam-02',
        orderNumber: 2,
        fullName: 'Đỗ Quỳnh Trang',
        avatarSeed: 'Trang',
        gender: 'nu',
        birthYear: 2009,
        academicLevel: 'Gioi',
        personalityTraits: ['Sáng tạo', 'Thuyết trình mạch lạc', 'Khéo tay thí nghiệm'],
        isPresent: false,
        currentStatusBadge: {
          text: 'Tham gia vòng tuyển chọn Quốc gia',
          variant: 'info'
        },
        differentiatedTierRecommendation: 2,
        behavioralLogs: []
      },
      {
        id: 'hs-nam-03',
        orderNumber: 3,
        fullName: 'Ngô Hồng Phúc',
        avatarSeed: 'Phuc',
        gender: 'nam',
        birthYear: 2009,
        academicLevel: 'Kha',
        personalityTraits: ['Chăm chỉ', 'Cần hỗ trợ công thức vi phân cảm ứng'],
        isPresent: true,
        currentStatusBadge: {
          text: 'Cần hỗ trợ: Khái niệm từ thông biến thiên',
          variant: 'warning'
        },
        differentiatedTierRecommendation: 1,
        behavioralLogs: []
      }
    ],
    initialLessonPlan: {
      id: 'lp-duc-nam-01',
      title: 'Hiện tượng Cảm ứng điện từ & Định luật Faraday',
      subject: 'Vật lý',
      gradeLevel: 'Khối 11',
      schoolName: 'THPT Chuyên Hà Nội - Amsterdam',
      department: 'Tổ Vật lý - Công nghệ',
      teacherName: 'Thầy Nguyễn Đức Nam',
      textbook: 'KNTT',
      textbookName: 'Kết nối tri thức với cuộc sống',
      timeAllocation: '2 tiết (90 phút)',
      createdDate: 'Hôm nay',
      objectives: {
        knowledge: [
          'Phát biểu được định nghĩa từ thông và đơn vị Vebơ (Wb).',
          'Tiến hành thí nghiệm chứng minh dòng điện cảm ứng xuất hiện khi từ thông biến thiên.',
          'Vận dụng định luật Faraday và định luật Lenz xác định chiều dòng điện cảm ứng.'
        ],
        competencies: {
          general: ['Giải quyết vấn đề và sáng tạo', 'Hợp tác nghiên cứu thực nghiệm'],
          specific: ['Năng lực tìm hiểu thế giới tự nhiên dưới góc độ vật lý', 'Mô hình hóa toán học phương trình suất điện động e = -dPhi/dt']
        },
        qualities: ['Đam mê khám phá khoa học', 'Cẩn trọng khi thực hiện thí nghiệm điện từ']
      },
      equipment: {
        teacher: ['Bộ thí nghiệm nam châm, cuộn dây, điện kế G nhạy cảm', 'Cảm biến từ trường Vernier kết nối máy tính'],
        students: ['Bộ kit thực hành theo nhóm 4 em', 'Vở thực hành STEM']
      },
      phases: [
        {
          phaseIndex: 1,
          title: 'Hoạt động 1: Khởi động (Warm-up)',
          durationMinutes: 10,
          objective: 'Quan sát hiện tượng bếp từ và sạc không dây hoạt động mà không có dây dẫn nối trực tiếp.',
          content: 'Tìm hiểu nguyên lý truyền năng lượng qua không gian.',
          product: 'Câu hỏi nghiên cứu: Tại sao từ trường biến thiên lại sinh ra dòng điện?',
          implementation: 'Chiếu video clip sạc xe điện không dây -> Đặt câu hỏi kích thích tư duy -> Học sinh nêu giả thuyết.'
        },
        {
          phaseIndex: 2,
          title: 'Hoạt động 2: Hình thành kiến thức (Thực nghiệm & Lý thuyết)',
          durationMinutes: 35,
          objective: 'Tiến hành thí nghiệm với ống dây và nam châm để suy ra định luật Faraday.',
          content: 'Học sinh dịch chuyển nam châm với tốc độ khác nhau và ghi nhận độ lệch kim điện kế.',
          product: 'Bảng số liệu thực nghiệm và công thức suất điện động cảm ứng.',
          implementation: 'Các nhóm làm việc với bộ kit thí nghiệm -> Phân tích đồ thị trên cảm biến -> Rút ra định luật Faraday.'
        },
        {
          phaseIndex: 3,
          title: 'Hoạt động 3: Luyện tập (Giải bài tập chuyên sâu)',
          durationMinutes: 25,
          objective: 'Vận dụng định luật Lenz xác định chiều dòng điện và tính suất điện động cảm ứng.',
          content: 'Làm bài tập giải tích và trắc nghiệm tư duy phản biện.',
          product: 'Lời giải chi tiết các dạng bài tập cảm ứng điện từ.',
          implementation: 'Học sinh làm việc cá nhân -> Thầy Nam giải đáp thắc mắc của nhóm em Phúc -> Thảo luận bài toán nâng cao.'
        },
        {
          phaseIndex: 4,
          title: 'Hoạt động 4: Vận dụng (Dự án chế tạo máy phát điện mini)',
          durationMinutes: 20,
          objective: 'Thiết kế mô hình máy phát điện xoay chiều mini thắp sáng đèn LED.',
          content: 'Ứng dụng nam châm vĩnh cửu và cánh quạt gió mini.',
          product: 'Mô hình phát điện thử nghiệm hoạt động tốt.',
          implementation: 'Giao nhiệm vụ dự án STEM liên môn Vật lý - Kỹ thuật -> Trưng bày sản phẩm tại hội chợ khoa học.'
        }
      ],
      differentiation: {
        tier1Core: {
          targetAudience: 'Toàn lớp và học sinh cần củng cố quy tắc bàn tay phải',
          strategy: 'Sử dụng mô hình 3D tương tác trực quan hóa đường sức từ',
          sampleExercise: 'Tính từ thông qua khung dây tròn bán kính 5cm đặt vuông góc với từ trường B = 0.2T',
          supportWorksheetAvailable: true
        },
        tier2Advanced: {
          targetAudience: 'Học sinh đội tuyển Olympic và em Minh',
          strategy: 'Giải phương trình vi phân biến thiên từ thông theo thời gian dạng hàm sin',
          sampleExercise: 'Tính dòng điện cảm ứng trong vòng dây có điện trở R khi từ trường biến thiên theo quy luật B(t) = B0.exp(-kt)',
          independentChallenge: 'Nghiên cứu nguyên lý đệm từ trường (Maglev) và thiết kế thí nghiệm minh họa lực hãm điện từ'
        }
      },
      interactiveResources: {
        quizizz: {
          id: 'qz-nam-01',
          type: 'quizizz',
          title: 'Thử thách Vật lý 11 - Cảm ứng điện từ & Định luật Lenz',
          promptDescription: 'Bộ câu hỏi tương tác tư duy phản biện.',
          gameCode: '912 304',
          liveUrl: 'https://quizizz.com/join?gc=912304',
          qrPayload: 'https://quizizz.com/join?gc=912304'
        },
        blooket: {
          id: 'bl-nam-01',
          type: 'blooket',
          title: 'Vật lý Lượng tử & Điện từ học',
          promptDescription: 'Mini-game đấu trường vật lý',
          liveUrl: 'https://blooket.com/play?id=774209',
          gameCode: '774 209',
          qrPayload: 'https://blooket.com/play?id=774209'
        },
        canvaSlidePrompt: {
          promptTitle: 'Slide bài giảng Vật lý 11 phong cách hiện đại tối giản',
          colorPaletteSuggestion: 'Xanh đậm công nghệ, vàng kim, trắng',
          slideBreakdown: ['Trang bìa', 'Video sạc không dây', 'Thí nghiệm Faraday', 'Định luật Lenz', 'Dự án STEM'],
          copyReadyPrompt: 'Slide bài giảng Vật lý 11 phong cách hiện đại tối giản: Hiện tượng cảm ứng điện từ, đồ thị từ thông sắc nét.'
        }
      },
      realtimeClassroomAdaptations: [
        {
          studentId: 'hs-nam-01',
          studentName: 'Vũ Quang Minh',
          reason: 'Thủ khoa Olympic Vật lý Cụm',
          actionInPlan: 'Giao bài tập vi tích phân Tier 2 và hỗ trợ làm nhóm trưởng hướng dẫn thực hành.'
        },
        {
          studentId: 'hs-nam-03',
          studentName: 'Ngô Hồng Phúc',
          reason: 'Cần hỗ trợ khái niệm từ thông',
          actionInPlan: 'Sử dụng mô hình 3D tương tác trên máy tính để Phúc hình dung trực quan đường sức từ xuyên qua mặt phẳng.'
        }
      ]
    },
    initialChatMessages: [
      {
        id: 'msg-dn-1',
        sender: 'ai',
        content: 'Chào Thầy Nam! Lớp 11 Lý 1 hôm nay phong độ rất cao. Em đã đồng bộ sẵn thí nghiệm cảm ứng điện từ và bộ câu hỏi phản biện chuyên sâu cho em Minh. Dự án STEM chuẩn bị thi Thành phố có cần em hỗ trợ dàn ý hồ sơ không thầy?',
        timestamp: '07:45'
      }
    ]
  },

  // =========================================================================
  // TENANT 3: Cô Trần Thị Bích Lan (Ngữ văn 7, THCS Lê Quý Đôn, Đà Nẵng)
  // =========================================================================
  'teacher-bich-lan': {
    teacher: {
      id: 'teacher-bich-lan',
      fullName: 'Trần Thị Bích Lan',
      salutation: 'Cô',
      schoolName: 'THCS Lê Quý Đôn - Đà Nẵng',
      department: 'Tổ Xã Hội (Ngữ văn - Lịch sử - GDCD)',
      primarySubject: 'Ngữ văn',
      secondarySubjects: ['Giáo dục Địa phương', 'Kỹ năng sống'],
      gradeLevel: 'Khối 7',
      assignedClass: '7B',
      seniorityYears: 21,
      teachingStyle: 'Truyền cảm hứng sâu lắng, khơi gợi lòng trắc ẩn và cảm thụ nghệ thuật từ ca từ',
      personalInterests: [
        'Đọc thơ ca cách mạng và văn học cổ điển',
        'Viết tản văn và nhật ký giảng dạy',
        'Nghe nhạc Trịnh Công Sơn'
      ],
      psychologicalLoad: 'overloaded',
      stressFactorNote: 'Đang chịu áp lực nặng nề vì đợt thanh tra chuyên môn đột xuất của Phòng GD&ĐT, đồng thời phải hoàn thành hồ sơ minh chứng chuẩn nghề nghiệp',
      aiTonePreference: 'encouraging_gentle',
      kpis: [
        {
          id: 'kpi-lan-1',
          title: 'Hồ sơ kiểm tra chuyên môn Phòng GD&ĐT',
          target: '100% hồ sơ giáo án số đạt loại Tốt',
          current: 'Đang gấp rút chuẩn bị minh chứng',
          progressPercent: 70,
          category: 'thi-dua'
        }
      ],
      upcomingEvents: [
        {
          id: 'evt-lan-1',
          title: 'Thanh tra toàn diện Phòng GD&ĐT',
          date: 'Sáng mai, 07:30',
          time: '07:30 - 11:30',
          location: 'Văn phòng tổ bộ môn',
          importance: 'high'
        }
      ]
    },
    students: [
      {
        id: 'hs-lan-01',
        orderNumber: 1,
        fullName: 'Nguyễn Như Hạnh',
        avatarSeed: 'Hanh',
        gender: 'nu',
        birthYear: 2013,
        academicLevel: 'Gioi',
        personalityTraits: ['Cảm thụ văn học tinh tế', 'Giọng đọc truyền cảm'],
        isPresent: true,
        currentStatusBadge: {
          text: 'Giọng đọc thơ hay nhất khối 7',
          variant: 'success'
        },
        differentiatedTierRecommendation: 2,
        behavioralLogs: []
      },
      {
        id: 'hs-lan-02',
        orderNumber: 2,
        fullName: 'Trần Minh Quân',
        avatarSeed: 'Quan',
        gender: 'nam',
        birthYear: 2013,
        academicLevel: 'CanHoTro',
        personalityTraits: ['Hiếu động', 'Chữ viết còn ẩu', 'Dễ nản khi viết đoạn văn dài'],
        isPresent: true,
        currentStatusBadge: {
          text: 'Cần hỗ trợ: Đoạn văn biểu cảm còn cụt ý',
          variant: 'warning'
        },
        differentiatedTierRecommendation: 1,
        behavioralLogs: []
      }
    ],
    initialLessonPlan: {
      id: 'lp-bich-lan-01',
      title: 'Vẻ đẹp tình đồng chí qua bài thơ Đồng chí (Chính Hữu)',
      subject: 'Ngữ văn',
      gradeLevel: 'Khối 7',
      schoolName: 'THCS Lê Quý Đôn - Đà Nẵng',
      department: 'Tổ Xã Hội (Ngữ văn - Lịch sử - GDCD)',
      teacherName: 'Cô Trần Thị Bích Lan',
      textbook: 'KNTT',
      textbookName: 'Kết nối tri thức với cuộc sống',
      timeAllocation: '1 tiết (45 phút)',
      createdDate: 'Hôm nay',
      objectives: {
        knowledge: [
          'Cảm nhận được tình đồng chí, đồng đội gắn bó keo sơn của những người lính nông dân thời kháng chiến chống Pháp.',
          'Hiểu được nét đặc sắc nghệ thuật: Chi tiết chân thực, ngôn ngữ giản dị, giàu sức gợi cảm.'
        ],
        competencies: {
          general: ['Giao tiếp và hợp tác', 'Tự học và sáng tạo ngôn ngữ'],
          specific: ['Năng lực tiếp nhận văn bản văn học', 'Năng lực tạo lập đoạn văn biểu cảm']
        },
        qualities: ['Lòng yêu nước, biết ơn sự hy sinh của các thế hệ cha anh', 'Tình yêu thương, sẻ chia với bạn bè']
      },
      equipment: {
        teacher: ['Giáo án số 5512 tinh gọn', 'Tranh ảnh tư liệu bộ đội thời kỳ đầu kháng chiến chống Pháp'],
        students: ['Sách giáo khoa Ngữ văn 7', 'Vở ghi bài, phiếu cảm thụ ngắn']
      },
      phases: [
        {
          phaseIndex: 1,
          title: 'Hoạt động 1: Khởi động (Warm-up)',
          durationMinutes: 6,
          objective: 'Gợi mở cảm xúc qua giai điệu bài hát "Tình đồng chí".',
          content: 'Lắng nghe 1 đoạn nhạc và chia sẻ cảm nghĩ về người lính.',
          product: 'Cảm xúc ban đầu và từ khóa kết nối vào bài thơ.',
          implementation: 'Mở đoạn nhạc nhẹ nhàng -> Học sinh chia sẻ cảm xúc 1 câu ngắn.'
        },
        {
          phaseIndex: 2,
          title: 'Hoạt động 2: Hình thành kiến thức (Đọc hiểu văn bản)',
          durationMinutes: 20,
          objective: 'Khám phá cơ sở hình thành tình đồng chí và biểu hiện cao đẹp.',
          content: 'Phân tích 7 câu đầu (nguồn gốc) và hình ảnh "Đầu súng trăng treo".',
          product: 'Sơ đồ tư duy ngắn về 3 nguồn gốc tình đồng chí.',
          implementation: 'Em Hạnh đọc diễn cảm bài thơ -> Thảo luận câu hỏi then chốt -> Giáo viên chốt ý ngắn gọn, súc tích.'
        },
        {
          phaseIndex: 3,
          title: 'Hoạt động 3: Luyện tập (Viết kết nối với đọc)',
          durationMinutes: 12,
          objective: 'Viết đoạn văn ngắn (5-7 câu) nêu cảm nghĩ về câu thơ "Đầu súng trăng treo".',
          content: 'Học sinh làm việc cá nhân vào vở.',
          product: 'Đoạn văn hoàn chỉnh giàu cảm xúc.',
          implementation: 'Học sinh viết độc lập -> Giáo viên hỗ trợ nhóm em Quân bằng câu mồi gợi ý.'
        },
        {
          phaseIndex: 4,
          title: 'Hoạt động 4: Vận dụng (Lời nhắn nhủ yêu thương)',
          durationMinutes: 7,
          objective: 'Liên hệ tình bạn, tình đồng đội trong lớp học hôm nay.',
          content: 'Viết tấm thiệp nhỏ 1 câu động viên bạn cùng lớp.',
          product: 'Những thông điệp yêu thương gắn kết lớp học.',
          implementation: 'Trao nhau thiệp nhỏ cuối giờ -> Kết thúc tiết học trong ấm áp.'
        }
      ],
      differentiation: {
        tier1Core: {
          targetAudience: 'Toàn lớp và em Quân',
          strategy: 'Cung cấp từ khóa gợi ý và khung dàn ý mẫu 3 phần cho đoạn văn',
          sampleExercise: 'Viết 5 câu nêu cảm nhận về hình ảnh "Đầu súng trăng treo" theo khung cho sẵn',
          supportWorksheetAvailable: true
        },
        tier2Advanced: {
          targetAudience: 'Em Hạnh và học sinh có năng khiếu văn',
          strategy: 'So sánh hình ảnh người lính trong thơ Chính Hữu và Quang Dũng (Tây Tiến)',
          sampleExercise: 'Viết đoạn văn biểu cảm sâu sắc về chất hiện thực và chất lãng mạn hòa quyện',
          independentChallenge: 'Sáng tác bài thơ hoặc vẽ tranh minh họa hình tượng "Đầu súng trăng treo"'
        }
      },
      interactiveResources: {
        quizizz: {
          id: 'qz-lan-01',
          type: 'quizizz',
          title: 'Cảm thụ tác phẩm Đồng chí - Ngữ văn 7',
          promptDescription: 'Vòng đấu phản xạ trắc nghiệm văn học',
          gameCode: '618 902',
          liveUrl: 'https://quizizz.com/join?gc=618902',
          qrPayload: 'https://quizizz.com/join?gc=618902'
        },
        blooket: {
          id: 'bl-lan-01',
          type: 'blooket',
          title: 'Văn học Kháng chiến - Hành trình giải phóng',
          promptDescription: 'Mini-game lịch sử văn học',
          liveUrl: 'https://blooket.com/play?id=419881',
          gameCode: '419 881',
          qrPayload: 'https://blooket.com/play?id=419881'
        },
        canvaSlidePrompt: {
          promptTitle: 'Slide bài giảng Ngữ văn 7 phong cách hoài niệm ấm áp',
          colorPaletteSuggestion: 'Vàng kem hoài niệm, nâu ấm, xanh áo lính',
          slideBreakdown: ['Trang bìa', 'Chân dung Chính Hữu', 'Tình đồng chí thời kháng chiến', 'Hình ảnh Đầu súng trăng treo', 'Liên hệ tình bạn hôm nay'],
          copyReadyPrompt: 'Slide bài giảng Ngữ văn 7: Bài thơ Đồng chí, phong cách hoài niệm, màu sắc ấm áp, trang nhã.'
        }
      },
      realtimeClassroomAdaptations: [
        {
          studentId: 'hs-lan-02',
          studentName: 'Trần Minh Quân',
          reason: 'Cần hỗ trợ diễn đạt',
          actionInPlan: 'Cung cấp sẵn khung câu mồi: "Hình ảnh đầu súng trăng treo gợi cho em cảm xúc..." để Quân tự tin viết.'
        }
      ]
    },
    initialChatMessages: [
      {
        id: 'msg-bl-1',
        sender: 'ai',
        content: 'Em chào Cô Lan thương mến! Em biết ngày mai có đợt thanh tra chuyên môn đột xuất của Phòng GD khiến cô đang rất lo lắng và quá tải. Cô hãy hít thở thật sâu, uống một tách trà ấm nhé. Toàn bộ hồ sơ giáo án chuẩn Công văn 5512 em đã chuẩn bị tinh giản, chuẩn chỉnh 100% từng đề mục rồi, cô chỉ việc in ra hoặc lưu file thôi ạ. Cô đừng lo lắng quá nhé, cô làm rất tốt rồi!',
        timestamp: '07:20'
      }
    ]
  }
};
