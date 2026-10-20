import { UpcomingModule } from "@/components/UpcomingModule";

export default function Page() {
  return (
    <UpcomingModule
      title="Song Ngữ"
      intro="Tiếng Anh vừa đủ để dạy song ngữ mức cơ bản, học 5 phút mỗi ngày, không ai chấm điểm."
      features={[
        "Thuật ngữ tiếng Anh của đúng bài sắp dạy, có phiên âm và nghe mẫu.",
        "Khẩu lệnh lớp học theo tình huống, luyện nói và được sửa nhẹ nhàng.",
        "Tự gắn khẩu lệnh song ngữ vào slide khi thầy cô bật tùy chọn.",
      ]}
    />
  );
}
