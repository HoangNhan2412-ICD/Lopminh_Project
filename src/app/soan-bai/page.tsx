import { UpcomingModule } from "@/components/UpcomingModule";

export default function Page() {
  return (
    <UpcomingModule
      title="Soạn Bài"
      intro="Soạn giáo án theo Công văn 5512 dựa trên tình hình thật của từng lớp, xuất ra file dùng được ngay trên lớp."
      features={[
        "Duyệt dàn ý trước, rồi Bé Bảng mới làm chi tiết.",
        "Hai tầng nhiệm vụ Cơ bản và Nâng cao, xếp học sinh theo dữ liệu thật.",
        "Slide có hình, sơ đồ, trò chơi trắc nghiệm, không còn toàn chữ.",
        "Làm lại từng slide với yêu cầu thêm của thầy cô.",
        "Tải Word 5512, PowerPoint, PDF và sơ đồ tư duy.",
      ]}
    />
  );
}
