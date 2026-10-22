import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LessonPlan5512 } from '@/types/lessonPlan';
import { SoundService } from './soundService';
import { normalizeNFC } from './unicodeUtils';

export interface QuizizzQuestionRow {
  'Question Text': string;
  'Question Type': string;
  'Option 1': string;
  'Option 2': string;
  'Option 3': string;
  'Option 4': string;
  'Correct Answer': number;
  'Time in seconds': number;
}

export function exportQuizizzExcel(plan: LessonPlan5512): void {
  const normTitle = normalizeNFC(plan.title);

  // Generate 5 structured questions aligned with the lesson topic in NFC Unicode
  const sampleQuestions: QuizizzQuestionRow[] = [
    {
      'Question Text': normalizeNFC(`Khái niệm cơ bản nào sau đây đúng nhất khi nói về ${normTitle}?`),
      'Question Type': 'Multiple Choice',
      'Option 1': normalizeNFC('Là phương trình chỉ có một ẩn duy nhất'),
      'Option 2': normalizeNFC('Là tập hợp các đẳng thức chứa hai ẩn biến thiên đồng thời'),
      'Option 3': normalizeNFC('Không thể biểu diễn được trên hệ trục tọa độ Oxy'),
      'Option 4': normalizeNFC('Luôn luôn vô nghiệm với mọi hệ số thực'),
      'Correct Answer': 2,
      'Time in seconds': 30
    },
    {
      'Question Text': normalizeNFC('Khi giải bằng phương pháp thế, bước đầu tiên quan trọng nhất là gì?'),
      'Question Type': 'Multiple Choice',
      'Option 1': normalizeNFC('Nhân cả hai vế với số 0'),
      'Option 2': normalizeNFC('Rút một ẩn theo ẩn còn lại từ phương trình đơn giản hơn'),
      'Option 3': normalizeNFC('Bình phương hai vế của phương trình'),
      'Option 4': normalizeNFC('Quy đồng mẫu thức tất cả các số hạng'),
      'Correct Answer': 2,
      'Time in seconds': 30
    },
    {
      'Question Text': normalizeNFC('Cặp số (x; y) = (2; 1) là nghiệm của hệ phương trình nào dưới đây?'),
      'Question Type': 'Multiple Choice',
      'Option 1': normalizeNFC('x + y = 3 và 2x - y = 3'),
      'Option 2': normalizeNFC('x - y = 5 và x + 2y = 4'),
      'Option 3': normalizeNFC('2x + y = 6 và x - y = 0'),
      'Option 4': normalizeNFC('3x - y = 1 và x + y = 4'),
      'Correct Answer': 1,
      'Time in seconds': 45
    },
    {
      'Question Text': normalizeNFC('Ứng dụng thực tế nào sau đây thường giải quyết bằng việc lập hệ phương trình hai ẩn?'),
      'Question Type': 'Multiple Choice',
      'Option 1': normalizeNFC('Tính chu vi của hình tròn'),
      'Option 2': normalizeNFC('Bài toán hai chuyển động ngược chiều gặp nhau và tính vận tốc mỗi xe'),
      'Option 3': normalizeNFC('Tính diện tích tam giác đều khi biết độ dài cạnh'),
      'Option 4': normalizeNFC('Vẽ đường phân giác góc vuông'),
      'Correct Answer': 2,
      'Time in seconds': 45
    },
    {
      'Question Text': normalizeNFC('Trong phần Vận dụng, câu nói "Kiểm tra lại điều kiện thực tế của ẩn" có ý nghĩa gì?'),
      'Question Type': 'Multiple Choice',
      'Option 1': normalizeNFC('Để loại các nghiệm âm không hợp lý (như số xe, giá tiền, số người)'),
      'Option 2': normalizeNFC('Không bắt buộc vì nghiệm toán học luôn luôn đúng ngoài đời'),
      'Option 3': normalizeNFC('Chỉ nhằm mục đích trang trí bài làm'),
      'Option 4': normalizeNFC('Để tăng độ dài trang giấy khi nộp bài thi'),
      'Correct Answer': 1,
      'Time in seconds': 30
    }
  ];

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(sampleQuestions);

  // Set column widths for readability in Excel
  worksheet['!cols'] = [
    { wch: 45 }, // Question Text
    { wch: 18 }, // Question Type
    { wch: 30 }, // Option 1
    { wch: 30 }, // Option 2
    { wch: 30 }, // Option 3
    { wch: 30 }, // Option 4
    { wch: 16 }, // Correct Answer
    { wch: 16 }  // Time in seconds
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Quizizz Template');

  // Generate buffer and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  const sanitizedTitle = normTitle.replace(/[\\/:*?"<>|]/g, '_').slice(0, 30);
  const fileName = `Quizizz_Blooket_${plan.subject}_${sanitizedTitle}.xlsx`;

  saveAs(blob, normalizeNFC(fileName));
  SoundService.playSuccessChime();
}
