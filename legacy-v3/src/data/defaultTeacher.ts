import { TeacherProfile } from '@/types/teacher';

export const initialTeacherProfile: TeacherProfile = {
  id: 'teacher-mai-hoa-01',
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
  psychologicalLoad: 'moderate', // Nhẹ nhàng, Ổn định, Căng thẳng, Quá tải
  stressFactorNote: 'Đang chuẩn bị tiết thao giảng Chuyên đề Đổi mới Phương pháp dạy học chào mừng Ngày Nhà giáo Việt Nam 20/11',
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
    },
    {
      id: 'kpi-3',
      title: 'Chuyên cần & Nề nếp lớp 9A',
      target: '99% có mặt đúng giờ',
      current: '96% (tuần này có đợt cúm mùa)',
      progressPercent: 96,
      category: 'chu-nhiem'
    },
    {
      id: 'kpi-4',
      title: 'Tiết dạy đổi mới phương pháp GDPT 2018',
      target: '2 tiết thao giảng cấp Quận',
      current: 'Đã hoàn thành 1 tiết',
      progressPercent: 50,
      category: 'thi-dua'
    }
  ],
  upcomingEvents: [
    {
      id: 'evt-1',
      title: 'Hội giảng chào mừng 20/11 cấp Quận',
      date: 'Thứ Năm tuần tới',
      time: '08:30',
      location: 'Phòng Hội đồng Sư phạm',
      importance: 'high'
    },
    {
      id: 'evt-2',
      title: 'Họp Tổ Chuyên môn Toán - Duyệt đề KT Giữa kỳ',
      date: 'Chiều Thứ Sáu',
      time: '14:00',
      location: 'Phòng họp tổ 2',
      importance: 'medium'
    },
    {
      id: 'evt-3',
      title: 'Sinh hoạt lớp: Rèn thói quen tự học ở nhà',
      date: 'Thứ Bảy tiết 5',
      time: '11:15',
      location: 'Phòng học 9A',
      importance: 'normal'
    }
  ]
};
