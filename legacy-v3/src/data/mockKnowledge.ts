import { KnowledgeChunk } from '@/types/knowledge';

export const initialKnowledgeBase: KnowledgeChunk[] = [
  {
    id: 'kn-01',
    source: 'CV_5512',
    documentTitle: 'Công văn 5512/BGDĐT-GDTrH về Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường',
    chapterOrSection: 'Phụ lục 4: Khung Kế hoạch bài dạy (Giáo án chuẩn)',
    subject: 'Chung (Toàn cấp THCS & THPT)',
    gradeLevel: 'Khối 6-12',
    tags: ['CV 5512', 'Khung bài dạy', '4 hoạt động', 'Chuẩn Bộ GD'],
    textSnippet: `Mỗi bài học được tổ chức thành 4 hoạt động học tập cơ bản:
1. Hoạt động 1: Xác định vấn đề / nhiệm vụ học tập / Mở đầu / Khởi động.
2. Hoạt động 2: Hình thành kiến thức mới / giải quyết vấn đề / thực thi nhiệm vụ đặt ra từ HĐ 1.
3. Hoạt động 3: Luyện tập (củng cố, khắc sâu kiến thức vừa hình thành).
4. Hoạt động 4: Vận dụng (vận dụng kiến thức vào giải quyết tình huống thực tiễn).
Trong mỗi hoạt động phải nêu rõ 4 yếu tố cốt lõi:
a) Mục tiêu: Học sinh thực hiện được hành động/sản phẩm gì.
b) Nội dung: Nhiệm vụ học tập cụ thể giao cho học sinh.
c) Sản phẩm: Lời giải, câu trả lời, sản phẩm thực tế của học sinh.
d) Tổ chức thực hiện: Gồm 4 bước: Chuyển giao nhiệm vụ -> Học sinh thực hiện -> Báo cáo, thảo luận -> Kết luận, nhận định.`
  },
  {
    id: 'kn-02',
    source: 'SGK_KNTT',
    documentTitle: 'Sách giáo khoa Toán 9 - Tập 1 (Bộ Kết nối tri thức với cuộc sống)',
    chapterOrSection: 'Chương 1: Phương trình và hệ hai phương trình bậc nhất hai ẩn',
    subject: 'Toán học',
    gradeLevel: 'Khớp 9',
    tags: ['Toán 9', 'KNTT', 'Hệ phương trình', 'Ứng dụng thực tế'],
    textSnippet: `Bài 2: Giải hệ hai phương trình bậc nhất hai ẩn bằng phương pháp thế và cộng đại số.
- Yêu cầu cần đạt: Học sinh nắm vững quy tắc thế, cộng đại số để đưa hệ hai phương trình về phương trình bậc nhất một ẩn; giải quyết được các bài toán thực tiễn liên quan đến tính toán giá tiền, vận tốc, năng suất làm chung làm riêng.`
  },
  {
    id: 'kn-03',
    source: 'SGK_CTST',
    documentTitle: 'Sách giáo khoa Khoa học Tự nhiên 9 (Bộ Chân trời sáng tạo)',
    chapterOrSection: 'Chủ đề: Năng lượng và sự biến đổi hóa học',
    subject: 'KHTN / Hóa học',
    gradeLevel: 'Khối 9',
    tags: ['KHTN 9', 'CTST', 'Thí nghiệm', 'Phản ứng hóa học'],
    textSnippet: `Bài học khám phá tính chất của Kim loại và Phi kim.
- Định hướng dạy học: Tăng cường hoạt động trải nghiệm, quan sát thí nghiệm trực quan hoặc mô phỏng số; học sinh tự rút ra quy luật từ chuỗi hiện tượng thực nghiệm thay vì chỉ đọc chép lý thuyết thuần túy.`
  },
  {
    id: 'kn-04',
    source: 'SGK_CANHDIEU',
    documentTitle: 'Sách giáo khoa Toán 9 (Bộ Cánh Diều)',
    chapterOrSection: 'Chương 3: Căn bậc hai và Căn bậc ba',
    subject: 'Toán học',
    gradeLevel: 'Khối 9',
    tags: ['Cánh Diều', 'Toán 9', 'Căn thức', 'Phân hóa năng lực'],
    textSnippet: `Thiết kế bài học theo hướng phân hóa:
- Mức độ Nhận biết & Thông hiểu: Thực hiện các phép biến đổi đơn giản đưa thừa số ra ngoài/vào trong dấu căn, trục căn thức ở mẫu dạng đơn giản.
- Mức độ Vận dụng: Ứng dụng giải các bài toán thực tế về độ dài đường chéo, vận tốc rơi tự do h = 1/2*g*t^2, bài toán quang học.`
  },
  {
    id: 'kn-05',
    source: 'TT_22',
    documentTitle: 'Thông tư 22/2021/TT-BGDĐT về Đánh giá học sinh THCS và THPT',
    chapterOrSection: 'Điều 5 & Điều 6: Đánh giá bằng nhận xét và điểm số',
    subject: 'Chung',
    gradeLevel: 'Khối 6-12',
    tags: ['Thông tư 22', 'Đánh giá vì sự tiến bộ', 'Khích lệ học sinh'],
    textSnippet: `Đánh giá vì sự tiến bộ của người học: Coi trọng việc nhận xét quá trình học tập, sự cố gắng vượt bậc của học sinh hơn là chỉ căn cứ vào điểm số đơn lẻ. Giáo viên cần ghi nhận kịp thời các tiến bộ nhỏ, điều chỉnh biện pháp sư phạm kịp thời đối với học sinh gặp khó khăn.`
  }
];
