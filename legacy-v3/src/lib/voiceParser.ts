import { Student, BehavioralCategory } from '@/types/student';

export interface ParsedVoiceAction {
  rawTranscript: string;
  matchedStudent?: Student;
  detectedStudentName?: string;
  category: BehavioralCategory;
  summaryText: string;
  suggestedImpact: string;
  suggestedBadgeText: string;
  suggestedBadgeVariant: 'danger' | 'warning' | 'success' | 'info';
  shouldMarkAbsent: boolean;
  recommendedTier: 1 | 2;
}

export function parseVietnameseClassroomVoice(
  transcript: string,
  students: Student[]
): ParsedVoiceAction {
  const lower = transcript.toLowerCase();

  // 1. Match student name
  let matchedStudent: Student | undefined;
  let detectedStudentName = '';

  for (const s of students) {
    const nameParts = s.fullName.toLowerCase().split(' ');
    const lastName = nameParts[nameParts.length - 1]; // e.g. "an", "bình", "chi"
    const fullNameLower = s.fullName.toLowerCase();

    if (lower.includes(fullNameLower) || lower.includes(`em ${lastName}`) || lower.includes(`bạn ${lastName}`)) {
      matchedStudent = s;
      detectedStudentName = s.fullName;
      break;
    }
  }

  // Fallback heuristic if student name didn't match directly
  if (!matchedStudent) {
    const commonNames = ['an', 'bình', 'chi', 'huy', 'tâm', 'ngọc', 'kiên', 'phương anh', 'anh'];
    for (const name of commonNames) {
      if (lower.includes(name)) {
        matchedStudent = students.find(s => s.fullName.toLowerCase().includes(name));
        if (matchedStudent) {
          detectedStudentName = matchedStudent.fullName;
          break;
        }
      }
    }
  }

  // 2. Identify Category and Educational triggers
  let category: BehavioralCategory = 'academic';
  let shouldMarkAbsent = false;
  let recommendedTier: 1 | 2 = 1;
  let suggestedBadgeVariant: 'danger' | 'warning' | 'success' | 'info' = 'info';
  let suggestedBadgeText = 'Cập nhật tình hình mới';
  let suggestedImpact = 'Ghi nhận vào sổ theo dõi sư phạm';

  // SICK / ABSENCE TRIGGER
  if (
    lower.includes('nghỉ') ||
    lower.includes('vắng') ||
    lower.includes('ốm') ||
    lower.includes('sốt') ||
    lower.includes('nhập viện') ||
    lower.includes('xin phép')
  ) {
    category = 'attendance';
    shouldMarkAbsent = true;
    suggestedBadgeVariant = 'danger';
    suggestedBadgeText = 'Nghỉ ốm / Có phép';
    suggestedImpact = 'Tự động tạo Phiếu học tập bù bài và đính kèm liên kết tự học trong Kế hoạch bài dạy.';
    recommendedTier = 1;
  }
  // STANDOUT / ACHIEVEMENT TRIGGER
  else if (
    lower.includes('ielts') ||
    lower.includes('tiến bộ') ||
    lower.includes('bứt phá') ||
    lower.includes('điểm cao') ||
    lower.includes('điểm 10') ||
    lower.includes('điểm 9') ||
    lower.includes('giải nhất') ||
    lower.includes('hsg') ||
    lower.includes('xuất sắc') ||
    lower.includes('giỏi')
  ) {
    category = 'achievement';
    suggestedBadgeVariant = 'success';
    suggestedBadgeText = 'Bứt phá vượt bậc';
    suggestedImpact = 'Kích hoạt thử thách nâng cao Tier 2 và bài tập vận dụng thực tiễn trong giáo án.';
    recommendedTier = 2;
  }
  // EMOTIONAL / NEEDS CARE TRIGGER
  else if (
    lower.includes('buồn') ||
    lower.includes('khóc') ||
    lower.includes('mệt') ||
    lower.includes('rụt rè') ||
    lower.includes('áp lực') ||
    lower.includes('mất tập trung') ||
    lower.includes('lo âu')
  ) {
    category = 'emotional';
    suggestedBadgeVariant = 'warning';
    suggestedBadgeText = 'Cần quan tâm tâm lý';
    suggestedImpact = 'Gợi ý cô giáo dành 2 phút hỏi thăm riêng cuối giờ và khích lệ em qua hoạt động mở đầu.';
    recommendedTier = 1;
  }
  // DISCIPLINE / STUDY HABITS
  else if (
    lower.includes('nói chuyện') ||
    lower.includes('quên bài') ||
    lower.includes('chưa làm') ||
    lower.includes('ngủ gật')
  ) {
    category = 'discipline';
    suggestedBadgeVariant = 'warning';
    suggestedBadgeText = 'Cần nhắc nhở nề nếp';
    suggestedImpact = 'Xếp ngồi cùng bạn phụ trách học tập để kèm cặp trong giờ học.';
    recommendedTier = 1;
  }

  const studentDisplay = detectedStudentName || (matchedStudent ? matchedStudent.fullName : 'Học sinh');
  const summaryText = `${studentDisplay}: ${transcript}`;

  return {
    rawTranscript: transcript,
    matchedStudent,
    detectedStudentName: studentDisplay,
    category,
    summaryText,
    suggestedImpact,
    suggestedBadgeText,
    suggestedBadgeVariant,
    shouldMarkAbsent,
    recommendedTier
  };
}
