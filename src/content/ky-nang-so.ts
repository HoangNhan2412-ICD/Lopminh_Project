/*
  Bài Kỹ Năng Số 2 phút. Mỗi bài tối đa 5 bước, viết cho người chưa quen máy tính.
  Ảnh chụp màn hình (nếu có) đặt ở public/guides/ky-nang-so/<id>-<bước>.png và thêm vào `images`.
*/

export interface SkillLesson {
  id: string;
  title: string;
  why: string;
  minutes: number;
  /** Liên quan tới việc nào trong Lớp Mình, để gợi ý đúng lúc. */
  related?: "soan-bai" | "quiz" | "hop-thu" | "kho";
  tryUrl?: string;
  steps: string[];
}

export const SKILLS: SkillLesson[] = [
  {
    id: "trinh-chieu",
    title: "Chiếu PowerPoint toàn màn hình và chuyển slide",
    why: "Vừa tải bài giảng về, mở ra chiếu cho cả lớp xem.",
    minutes: 2,
    related: "soan-bai",
    steps: [
      "Bấm đúp vào file PowerPoint vừa tải về để mở.",
      "Nhấn phím F5 trên bàn phím để chiếu từ slide đầu tiên.",
      "Nhấn phím mũi tên phải → (hoặc bấm chuột) để sang slide sau, mũi tên trái ← để quay lại.",
      "Muốn xem lời giảng riêng cho mình: bấm chuột phải, chọn “Hiện chế độ Diễn giả” (Show Presenter View).",
      "Nhấn phím Esc để thoát chế độ chiếu.",
    ],
  },
  {
    id: "quet-qr",
    title: "Quét mã QR bằng điện thoại",
    why: "Học sinh quét mã trên slide để vào phòng quiz; thầy cô thử trước cho quen.",
    minutes: 2,
    related: "quiz",
    steps: [
      "Mở ứng dụng Camera (Máy ảnh) trên điện thoại.",
      "Hướng camera vào mã QR, giữ yên khoảng 2 giây, không cần bấm chụp.",
      "Trên màn hình hiện một đường link màu vàng hoặc trắng: chạm vào đó.",
      "Nếu camera không nhận: mở Zalo, bấm biểu tượng mã QR ở góc trên bên phải và quét.",
    ],
  },
  {
    id: "video-ppt",
    title: "Chèn video vào PowerPoint",
    why: "Thêm một đoạn video ngắn làm phần khởi động.",
    minutes: 2,
    related: "soan-bai",
    steps: [
      "Mở slide muốn chèn video.",
      "Bấm thẻ “Chèn” (Insert) trên thanh trên cùng.",
      "Bấm “Video”, chọn “Video trên thiết bị này” (This Device) nếu video đã có trong máy, hoặc “Video trực tuyến” (Online Video) rồi dán link YouTube.",
      "Kéo góc khung video cho vừa slide.",
      "Bấm vào video, chọn thẻ “Phát lại” (Playback), đặt “Bắt đầu: Tự động” nếu muốn video tự chạy.",
    ],
  },
  {
    id: "chia-se-drive",
    title: "Chia sẻ một tệp trên Google Drive cho tổ chuyên môn",
    why: "Gửi giáo án cho tổ trưởng mà không cần đính kèm qua Zalo.",
    minutes: 2,
    related: "kho",
    tryUrl: "https://drive.google.com",
    steps: [
      "Mở drive.google.com, bấm “Mới” → “Tải tệp lên”, chọn giáo án.",
      "Bấm chuột phải vào tệp vừa tải lên, chọn “Chia sẻ”.",
      "Gõ địa chỉ email của tổ trưởng, chọn quyền “Người xem” hoặc “Người chỉnh sửa”.",
      "Bấm “Gửi”. Tổ trưởng sẽ nhận được thư có link mở tệp.",
    ],
  },
  {
    id: "google-form",
    title: "Tạo bài kiểm tra nhanh bằng Google Form",
    why: "Học sinh làm trên điện thoại, máy tự chấm điểm.",
    minutes: 3,
    related: "quiz",
    tryUrl: "https://forms.google.com",
    steps: [
      "Mở forms.google.com, bấm dấu “+” để tạo biểu mẫu trống.",
      "Bấm biểu tượng bánh răng hoặc thẻ “Cài đặt”, bật “Đặt làm bài kiểm tra”.",
      "Gõ câu hỏi, chọn kiểu “Trắc nghiệm”, gõ 4 phương án.",
      "Bấm “Đáp án”, chọn phương án đúng và số điểm.",
      "Bấm “Gửi”, chọn biểu tượng đường link để chép link; dán vào Phòng Quiz của Lớp Mình để có mã QR.",
    ],
  },
  {
    id: "zalo-may-tinh",
    title: "Dùng Zalo trên máy tính",
    why: "Đọc tin nhóm lớp bằng màn hình to, dán tin vào Hộp Thư Lớp Mình cho nhanh.",
    minutes: 2,
    related: "hop-thu",
    tryUrl: "https://chat.zalo.me",
    steps: [
      "Mở trang chat.zalo.me trên máy tính.",
      "Trên điện thoại, mở Zalo, bấm biểu tượng mã QR ở góc trên bên phải.",
      "Quét mã QR đang hiện trên màn hình máy tính, bấm “Đăng nhập”.",
      "Muốn chép tin: bôi đen đoạn tin, nhấn Ctrl + C, rồi sang Lớp Mình nhấn Ctrl + V.",
    ],
  },
];
