import { UpcomingModule } from "@/components/UpcomingModule";

export default function Page() {
  return (
    <UpcomingModule
      title="Kỹ Năng Số"
      intro="Mỗi ngày một bài 2 phút, chữ to, có ảnh khoanh đỏ đúng chỗ cần bấm."
      features={[
        "Chèn video vào PowerPoint, quét mã QR, chia sẻ Google Drive, tạo Google Form.",
        "Gợi ý đúng bài liên quan việc thầy cô vừa làm trong Lớp Mình.",
        "Nút đọc to từng bước và nút “Thử ngay”.",
      ]}
    />
  );
}
