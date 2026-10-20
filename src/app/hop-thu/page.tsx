import { UpcomingModule } from "@/components/UpcomingModule";

export default function Page() {
  return (
    <UpcomingModule
      title="Hộp Thư Công Việc"
      intro="Gom email trường và tin nhắn Zalo dán vào, lọc bỏ thư rác, chỉ giữ lại việc thật sự cần làm."
      features={[
        "Kết nối Gmail chỉ để đọc, không tự xóa hay trả lời thư nào.",
        "Tự gắn nhãn: BGH khẩn, Chủ nhiệm, Bộ môn, Phụ huynh, Hành chính.",
        "Bản tin tóm tắt đầu ngày và tự đưa hạn nộp vào lịch nhắc.",
        "Ô dán nhanh tin nhắn Zalo, tìm kiếm không cần gõ dấu.",
        "Soạn nháp thư trả lời để duyệt trước khi gửi.",
      ]}
    />
  );
}
