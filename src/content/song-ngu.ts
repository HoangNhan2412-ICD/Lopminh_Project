/*
  Nội dung Song Ngữ cho giáo viên không dạy tiếng Anh. Nhóm có thể thêm câu, thêm môn ở đây
  mà không cần sửa giao diện. "say" là cách đọc gần đúng theo âm tiếng Việt, chỉ để nhắc nhẹ.
*/

export interface Phrase {
  en: string;
  vi: string;
  say?: string;
}

export const COMMANDS: { id: string; label: string; phrases: Phrase[] }[] = [
  {
    id: "bat-dau",
    label: "Bắt đầu giờ học",
    phrases: [
      { en: "Good morning, class!", vi: "Chào cả lớp buổi sáng!", say: "gút mo-ninh, clas" },
      { en: "Please sit down.", vi: "Các em ngồi xuống nhé.", say: "pli-dơ xít đao" },
      { en: "Open your books to page twenty.", vi: "Mở sách trang 20.", say: "âu-pần do búc tu pết twen-ti" },
      { en: "Today we will learn about…", vi: "Hôm nay chúng ta học về…", say: "tu-đây uy uyl lơn ơ-bao" },
      { en: "Who is absent today?", vi: "Hôm nay ai vắng?", say: "hu ít áp-xần tu-đây" },
    ],
  },
  {
    id: "lam-viec",
    label: "Làm việc cặp, nhóm",
    phrases: [
      { en: "Work in pairs.", vi: "Làm việc theo cặp.", say: "uơk in pe-ơz" },
      { en: "Work in groups of four.", vi: "Làm nhóm bốn người.", say: "uơk in grúps ơv pho" },
      { en: "You have five minutes.", vi: "Các em có 5 phút.", say: "diu hev phai mí-nits" },
      { en: "Time is up!", vi: "Hết giờ rồi!", say: "thai-m ít ắp" },
      { en: "Present your answer, please.", vi: "Mời nhóm trình bày đáp án.", say: "pri-zent do an-xơ pli-dơ" },
    ],
  },
  {
    id: "hoi-dap",
    label: "Hỏi và kiểm tra",
    phrases: [
      { en: "Any questions?", vi: "Có ai hỏi gì không?", say: "e-ni kuét-chần" },
      { en: "Raise your hand, please.", vi: "Giơ tay lên nhé.", say: "rây-dơ do hen pli-dơ" },
      { en: "Come to the board, please.", vi: "Mời em lên bảng.", say: "cam tu dơ bo-đ pli-dơ" },
      { en: "Do you understand?", vi: "Các em hiểu chưa?", say: "đu diu ăn-đơ-xten" },
      { en: "Try again.", vi: "Thử lại nhé.", say: "trai ơ-ghen" },
    ],
  },
  {
    id: "khen",
    label: "Khen ngợi, động viên",
    phrases: [
      { en: "Well done!", vi: "Làm tốt lắm!", say: "uel đăn" },
      { en: "Excellent work!", vi: "Bài làm xuất sắc!", say: "éc-xơ-lần uơk" },
      { en: "Good try, almost there.", vi: "Cố gắng tốt, gần đúng rồi.", say: "gút trai, on-mốt de-ơ" },
      { en: "Let's give them a big hand!", vi: "Cả lớp vỗ tay cho bạn nào!", say: "lét ghiv dem ơ bích hen" },
    ],
  },
  {
    id: "ket-thuc",
    label: "Kết thúc giờ học",
    phrases: [
      { en: "Let's review today's lesson.", vi: "Cùng ôn lại bài hôm nay.", say: "lét ri-viu tu-đây-z lét-xần" },
      { en: "Your homework is exercise three.", vi: "Bài về nhà là bài tập 3.", say: "do hôm-uơk ít éc-xơ-xai-z thri" },
      { en: "See you next time!", vi: "Hẹn gặp lại tiết sau!", say: "xi diu nếch-x thai-m" },
    ],
  },
];

export const TERMS: Record<string, Phrase[]> = {
  "Toán": [
    { en: "equation", vi: "phương trình" },
    { en: "square root", vi: "căn bậc hai" },
    { en: "triangle", vi: "tam giác" },
    { en: "angle", vi: "góc" },
    { en: "fraction", vi: "phân số" },
    { en: "perimeter", vi: "chu vi" },
    { en: "area", vi: "diện tích" },
    { en: "graph", vi: "đồ thị" },
  ],
  "Vật lý": [
    { en: "velocity", vi: "vận tốc" },
    { en: "acceleration", vi: "gia tốc" },
    { en: "force", vi: "lực" },
    { en: "energy", vi: "năng lượng" },
    { en: "electric current", vi: "dòng điện" },
    { en: "voltage", vi: "hiệu điện thế" },
    { en: "experiment", vi: "thí nghiệm" },
    { en: "measure", vi: "đo" },
  ],
  "Hóa học": [
    { en: "atom", vi: "nguyên tử" },
    { en: "molecule", vi: "phân tử" },
    { en: "chemical reaction", vi: "phản ứng hóa học" },
    { en: "acid", vi: "axit" },
    { en: "solution", vi: "dung dịch" },
    { en: "element", vi: "nguyên tố" },
  ],
  "Sinh học": [
    { en: "cell", vi: "tế bào" },
    { en: "photosynthesis", vi: "quang hợp" },
    { en: "organism", vi: "sinh vật" },
    { en: "gene", vi: "gen" },
    { en: "ecosystem", vi: "hệ sinh thái" },
  ],
  "Ngữ văn": [
    { en: "poem", vi: "bài thơ" },
    { en: "character", vi: "nhân vật" },
    { en: "theme", vi: "chủ đề" },
    { en: "author", vi: "tác giả" },
    { en: "paragraph", vi: "đoạn văn" },
  ],
  "Lịch sử": [
    { en: "dynasty", vi: "triều đại" },
    { en: "revolution", vi: "cách mạng" },
    { en: "independence", vi: "độc lập" },
    { en: "timeline", vi: "dòng thời gian" },
  ],
  "Địa lý": [
    { en: "climate", vi: "khí hậu" },
    { en: "population", vi: "dân số" },
    { en: "river delta", vi: "đồng bằng châu thổ" },
    { en: "map", vi: "bản đồ" },
  ],
};
