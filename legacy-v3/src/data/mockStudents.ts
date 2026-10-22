import { Student } from '@/types/student';

export const initialStudents: Student[] = [
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
      },
      {
        id: 'log-01-b',
        timestamp: 'Tuần trước',
        category: 'academic',
        text: 'Bài kiểm tra 15 phút đạt 6.5, phần biến đổi căn bậc hai còn nhầm dấu.',
        resolved: true
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
      },
      {
        id: 'log-02-b',
        timestamp: 'Thứ Hai',
        category: 'academic',
        text: 'Chủ động lên bảng chữa câu điểm 10 hình học cho cả lớp nghe rất gãy gọn.',
        resolved: true
      }
    ]
  },
  {
    id: 'hs-03',
    orderNumber: 3,
    fullName: 'Phạm Ngọc Chi',
    avatarSeed: 'Chi',
    gender: 'nu',
    birthYear: 2011,
    academicLevel: 'Kha',
    personalityTraits: ['Rụt rè', 'Cẩn thận', 'Sợ sai trước đám đông'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Tâm lý: Hôm nay hơi trầm, cần khích lệ',
      variant: 'warning'
    },
    differentiatedTierRecommendation: 1,
    notesForNextLesson: 'Ưu tiên gọi Chi trả lời câu hỏi vừa sức ở Hoạt động Khởi động để tăng tự tin',
    behavioralLogs: [
      {
        id: 'log-03-a',
        timestamp: 'Sáng nay, 08:00',
        category: 'emotional',
        text: 'Chi vào lớp vẻ mặt lo âu, ít trò chuyện với bạn cùng bàn. Cô giáo chú ý hỏi han nhẹ nhàng.',
        impactNote: 'Gợi ý cô dành 2 phút cuối giờ động viên tinh thần em',
        resolved: false
      }
    ]
  },
  {
    id: 'hs-04',
    orderNumber: 4,
    fullName: 'Đỗ Quang Huy',
    avatarSeed: 'Huy',
    gender: 'nam',
    birthYear: 2011,
    academicLevel: 'Gioi',
    personalityTraits: ['Tư duy hình học xuất sắc', 'Thích làm việc nhóm', 'Năng nổ'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Trưởng nhóm hoạt động tích cực',
      variant: 'info'
    },
    differentiatedTierRecommendation: 2,
    notesForNextLesson: 'Phân công làm nhóm trưởng điều phối nhóm thảo luận Hoạt động 2',
    behavioralLogs: [
      {
        id: 'log-04-a',
        timestamp: 'Hôm qua',
        category: 'academic',
        text: 'Phát hiện thêm cách giải thứ 2 ngắn hơn cho bài toán tiếp tuyến đường tròn.',
        resolved: true
      }
    ]
  },
  {
    id: 'hs-05',
    orderNumber: 5,
    fullName: 'Vũ Minh Tâm',
    avatarSeed: 'Tam',
    gender: 'nam',
    birthYear: 2011,
    academicLevel: 'CanHoTro',
    personalityTraits: ['Chậm rãi', 'Cần giảng từng bước', 'Dễ mất tập trung'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Cần kèm cặp giàn giáo lý thuyết',
      variant: 'warning'
    },
    differentiatedTierRecommendation: 1,
    notesForNextLesson: 'Xếp ngồi cạnh bạn Bảo Ngọc kèm cặp và cấp phiếu hỗ trợ có ví dụ mẫu',
    behavioralLogs: [
      {
        id: 'log-05-a',
        timestamp: 'Hôm nay, 08:15',
        category: 'academic',
        text: 'Tâm đã thuộc công thức nhưng khi áp dụng vào bài tập 2 bước còn lúng túng.',
        impactNote: 'Đưa vào danh sách nhận phiếu trợ giúp giàn giáo (scaffolding sheet)',
        resolved: false
      }
    ]
  },
  {
    id: 'hs-06',
    orderNumber: 6,
    fullName: 'Trần Bảo Ngọc',
    avatarSeed: 'Ngoc',
    gender: 'nu',
    birthYear: 2011,
    academicLevel: 'Gioi',
    personalityTraits: ['Trách nhiệm cao', 'Gương mẫu', 'Giọng nói truyền cảm'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Lớp phó học tập xuất sắc',
      variant: 'success'
    },
    differentiatedTierRecommendation: 2,
    notesForNextLesson: 'Hỗ trợ cô giáo kiểm tra chéo sản phẩm học tập của các nhóm',
    behavioralLogs: [
      {
        id: 'log-06-a',
        timestamp: 'Đầu tuần',
        category: 'achievement',
        text: 'Giúp đỡ 2 bạn trong tổ tiến bộ rõ rệt trong bài kiểm tra định kỳ.',
        resolved: true
      }
    ]
  },
  {
    id: 'hs-07',
    orderNumber: 7,
    fullName: 'Nguyễn Đức Kiên',
    avatarSeed: 'Kien',
    gender: 'nam',
    birthYear: 2011,
    academicLevel: 'Kha',
    personalityTraits: ['Đam mê công nghệ', 'Thích mô phỏng GeoGebra', 'Nhanh nhẹn'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Sẵn sàng hỗ trợ CNTT trong tiết',
      variant: 'info'
    },
    differentiatedTierRecommendation: 2,
    notesForNextLesson: 'Giao điều khiển máy chiếu và mở app GeoGebra tương tác',
    behavioralLogs: [
      {
        id: 'log-07-a',
        timestamp: 'Thứ Năm tuần trước',
        category: 'academic',
        text: 'Tự vẽ hình động minh họa định lý Talet trên máy tính bảng mang đến lớp.',
        resolved: true
      }
    ]
  },
  {
    id: 'hs-08',
    orderNumber: 8,
    fullName: 'Bùi Phương Anh',
    avatarSeed: 'PAnh',
    gender: 'nu',
    birthYear: 2011,
    academicLevel: 'Kha',
    personalityTraits: ['Cẩn trọng', 'Chữ đẹp', 'Trình bày khoa học'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Vở ghi chép mẫu mực',
      variant: 'success'
    },
    differentiatedTierRecommendation: 1,
    notesForNextLesson: 'Chụp bài làm mẫu của Phương Anh chiếu lên bảng cho cả lớp nhận xét',
    behavioralLogs: [
      {
        id: 'log-08-a',
        timestamp: 'Hôm qua',
        category: 'academic',
        text: 'Trình bày lời giải bài toán đồ thị hàm số rất chuẩn mực, rõ ràng từng bước.',
        resolved: true
      }
    ],
    classRoom: '9A'
  },
  // LỚP BỘ MÔN 9B
  {
    id: 'hs-9b-01',
    orderNumber: 1,
    fullName: 'Đặng Quốc Thái',
    avatarSeed: 'Thai',
    gender: 'nam',
    birthYear: 2011,
    academicLevel: 'Gioi',
    classRoom: '9B',
    personalityTraits: ['Tư duy đại số sắc bén', 'Thích tranh biện', 'Chủ động phát biểu'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Tiến bộ vượt bậc đại số',
      variant: 'success'
    },
    differentiatedTierRecommendation: 2,
    notesForNextLesson: 'Giao bài tập chuyên đề bất đẳng thức Cauchy',
    behavioralLogs: [
      {
        id: 'log-9b-01',
        timestamp: 'Tiết trước',
        category: 'academic',
        text: 'Thái tìm ra 2 cách chứng minh cho bài toán cực trị hình học.',
        impactNote: 'Khuyến khích trình bày trước lớp',
        resolved: true
      }
    ]
  },
  {
    id: 'hs-9b-02',
    orderNumber: 2,
    fullName: 'Lê Thu Trang',
    avatarSeed: 'Trang',
    gender: 'nu',
    birthYear: 2011,
    academicLevel: 'Kha',
    classRoom: '9B',
    personalityTraits: ['Cẩn thận', 'Trực quan sinh động', 'Chăm chỉ'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Vở học tập chỉn chu',
      variant: 'info'
    },
    differentiatedTierRecommendation: 1,
    notesForNextLesson: 'Rèn luyện thêm kỹ năng vẽ hình không gian',
    behavioralLogs: [
      {
        id: 'log-9b-02',
        timestamp: 'Hôm qua',
        category: 'academic',
        text: 'Làm đầy đủ bài tập về nhà, chữ viết nắn nót.',
        resolved: true
      }
    ]
  },
  {
    id: 'hs-9b-03',
    orderNumber: 3,
    fullName: 'Bùi Gia Huy',
    avatarSeed: 'GHuy',
    gender: 'nam',
    birthYear: 2011,
    academicLevel: 'CanHoTro',
    classRoom: '9B',
    personalityTraits: ['Thích thực hành', 'Cần hỗ trợ công thức', 'Chăm chú'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Cần hỗ trợ rút gọn biểu thức',
      variant: 'warning'
    },
    differentiatedTierRecommendation: 1,
    notesForNextLesson: 'Cung cấp phiếu giàn giáo có bước giải mẫu',
    behavioralLogs: [
      {
        id: 'log-9b-03',
        timestamp: 'Sáng nay',
        category: 'academic',
        text: 'Còn nhầm lẫn thứ tự phép tính khi bỏ ngoặc.',
        impactNote: 'Gợi ý bạn ngồi cạnh hướng dẫn thêm',
        resolved: false
      }
    ]
  },
  // LỚP BỘ MÔN 9C
  {
    id: 'hs-9c-01',
    orderNumber: 1,
    fullName: 'Trần Tiến Đạt',
    avatarSeed: 'Dat',
    gender: 'nam',
    birthYear: 2011,
    academicLevel: 'Kha',
    classRoom: '9C',
    personalityTraits: ['Đam mê CNTT', 'Tự học tốt', 'Nhanh nhẹn'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Ứng dụng máy tính cầm tay nhanh',
      variant: 'info'
    },
    differentiatedTierRecommendation: 2,
    notesForNextLesson: 'Hướng dẫn các bạn cách bấm máy tính giải phương trình',
    behavioralLogs: [
      {
        id: 'log-9c-01',
        timestamp: 'Đầu tuần',
        category: 'academic',
        text: 'Biết dùng chức năng bảng giá trị Table để kiểm tra nghiệm.',
        resolved: true
      }
    ]
  },
  {
    id: 'hs-9c-02',
    orderNumber: 2,
    fullName: 'Nguyễn Lan Hương',
    avatarSeed: 'Huong',
    gender: 'nu',
    birthYear: 2011,
    academicLevel: 'Gioi',
    classRoom: '9C',
    personalityTraits: ['Sáng tạo', 'Học đều', 'Bao dung'],
    isPresent: true,
    currentStatusBadge: {
      text: 'Cán sự môn Toán năng nổ',
      variant: 'success'
    },
    differentiatedTierRecommendation: 2,
    notesForNextLesson: 'Giao điều phối nhóm 1 trong hoạt động thực hành',
    behavioralLogs: [
      {
        id: 'log-9c-02',
        timestamp: 'Hôm qua',
        category: 'achievement',
        text: 'Đạt điểm tối đa bài kiểm tra 1 tiết Đại số chương 1.',
        resolved: true
      }
    ]
  }
];
