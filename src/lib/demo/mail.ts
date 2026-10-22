import type { RawMail } from "@/lib/mail/classify";

/** Hộp thư mẫu cho chế độ demo, mỗi hồ sơ một bộ. Danh xưng trong thư mẫu khớp đúng giới tính hồ sơ. */
export function demoMails(profileId: string, today: string): RawMail[] {
  const at = (h: number, m = 0) => `${today}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+07:00`;
  const [y, mo, d] = today.split("-").map(Number);
  const plus = (n: number) => {
    const dt = new Date(Date.UTC(y, mo - 1, d + n));
    return `${dt.getUTCDate()}/${dt.getUTCMonth() + 1}`;
  };

  const common: RawMail[] = [
    {
      id: "m-spam-1",
      from: "Siêu thị Điện máy <khuyenmai@dienmay.vn>",
      subject: "Flash sale 50% máy lọc không khí, chỉ hôm nay",
      body: "Ưu đãi giảm giá cực sốc dành riêng cho khách hàng thân thiết. Đăng ký ngay để nhận voucher 500.000đ.",
      receivedAt: at(6, 40),
      source: "email",
    },
    {
      id: "m-spam-2",
      from: "Ngân hàng số <no-reply@vayvon.vn>",
      subject: "Vay vốn tiêu dùng lãi suất 0%",
      body: "Quý khách được duyệt hạn mức vay 100 triệu. Bấm vào đây để nhận quà tặng.",
      receivedAt: at(7, 5),
      source: "email",
    },
    {
      id: "m-hc-1",
      from: "Kế toán trường",
      subject: "Thông báo kê khai bảo hiểm y tế năm học mới",
      body: "Kính gửi quý thầy cô, đề nghị kê khai thông tin bảo hiểm y tế theo biểu mẫu đính kèm, nộp về phòng kế toán trong tháng này.",
      receivedAt: at(9, 15),
      source: "email",
    },
  ];

  const byProfile: Record<string, RawMail[]> = {
    "gv-mai-hoa": [
      {
        id: "m-bgh-1",
        from: "Ban Giám hiệu THCS Chu Văn An",
        subject: "KHẨN: nộp đề kiểm tra giữa kỳ môn Toán",
        body: `Đề nghị các thầy cô tổ Tự nhiên nộp đề kiểm tra giữa kỳ I kèm ma trận và đáp án trước 16h ngày ${plus(2)}. Bản mềm gửi qua email tổ trưởng.`,
        receivedAt: at(7, 30),
        source: "email",
      },
      {
        id: "m-ph-1",
        from: "Mẹ em Hoàng Minh An (9A)",
        subject: "Xin phép cho cháu An nghỉ học",
        body: "Dạ em chào cô ạ. Cháu An đêm qua sốt cao, gia đình xin phép cô cho cháu nghỉ học đến hết tuần. Em cảm ơn cô.",
        receivedAt: at(6, 55),
        source: "zalo",
      },
      {
        id: "m-bm-1",
        from: "Em Nguyễn Gia Bảo (9C)",
        subject: "Xin làm lại bài kiểm tra 15 phút",
        body: "Em chào cô, em vắng buổi kiểm tra 15 phút chương 1 lớp 9C, cô cho em xin làm bù vào tuần sau được không ạ.",
        receivedAt: at(10, 20),
        source: "email",
      },
    ],
    "gv-duc-nam": [
      {
        id: "m-bgh-1",
        from: "Ban Giám hiệu THPT Nguyễn Thị Minh Khai",
        subject: "Lịch dự giờ tổ Vật lý – Công nghệ",
        body: `Thông báo: tổ chuyên môn dự giờ tiết 3 lớp 11A2 ngày ${plus(1)}. Đề nghị thầy chuẩn bị giáo án và nộp trước cho tổ trưởng.`,
        receivedAt: at(7, 45),
        source: "email",
      },
      {
        id: "m-ph-1",
        from: "Bố em Trâm (11A1)",
        subject: "Trao đổi về tình hình học tập của cháu",
        body: "Chào thầy, dạo này cháu Trâm ở nhà ít nói, gia đình muốn gặp thầy trao đổi thêm. Thầy cho gia đình xin một buổi hẹn ạ.",
        receivedAt: at(8, 10),
        source: "zalo",
      },
      {
        id: "m-bm-1",
        from: "Lớp trưởng 10A1",
        subject: "Hỏi bài tập về nhà chương Động học",
        body: "Thầy ơi, bài 5 trong phiếu bài tập lớp 10A1 cả lớp chưa hiểu đề, thầy giải thích giúp tụi em ạ.",
        receivedAt: at(19, 30),
        source: "email",
      },
    ],
    "gv-thu-phuong": [
      {
        id: "m-bgh-1",
        from: "Phòng GD&ĐT",
        subject: "Hỏa tốc: báo cáo số liệu học sinh tham gia hội thi kể chuyện",
        body: `Đề nghị các trường gửi danh sách học sinh dự thi trước ngày ${plus(3)}.`,
        receivedAt: at(8, 0),
        source: "email",
      },
      {
        id: "m-ph-1",
        from: "Mẹ em Khiêm (7B)",
        subject: "Về việc cháu làm vỡ bình hoa",
        body: "Dạ chào cô, gia đình đã nghe cháu kể chuyện làm vỡ bình hoa của lớp, gia đình xin đền và mong cô bỏ qua cho cháu ạ.",
        receivedAt: at(12, 15),
        source: "zalo",
      },
    ],
  };

  return [...(byProfile[profileId] ?? []), ...common];
}
