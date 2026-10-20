import { UpcomingModule } from "@/components/UpcomingModule";

export default function Page() {
  return (
    <UpcomingModule
      title="Kho Dữ Liệu"
      intro="Nơi để sách, văn bản, kế hoạch và hồ sơ học sinh — để Bé Bảng hiểu đúng bối cảnh trước khi gợi ý."
      features={[
        "Tải lên SGK, phân phối chương trình, giáo án cũ, đề kiểm tra.",
        "Lưu công văn, thông tư, kế hoạch tổ chuyên môn và lịch sự kiện năm học.",
        "Nhập danh sách lớp từ Excel hoặc ảnh chụp, ghi tính cách và năng lực từng em.",
        "Soạn bài có trích dẫn đúng đoạn tài liệu của chính mình.",
        "Xuất gói tài liệu kèm hướng dẫn để mở trong NotebookLM.",
      ]}
    />
  );
}
