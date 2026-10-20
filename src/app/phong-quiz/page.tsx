import { UpcomingModule } from "@/components/UpcomingModule";

export default function Page() {
  return (
    <UpcomingModule
      title="Phòng Quiz"
      intro="Tạo câu hỏi từ bài giảng, mở phòng thi đua có mã QR cho học sinh quét bằng điện thoại."
      features={[
        "Sinh câu hỏi trắc nghiệm từ giáo án vừa soạn.",
        "Phòng quiz riêng của Lớp Mình: học sinh quét QR, không cần đăng nhập.",
        "Bảng xếp hạng trực tiếp, kết quả tự cập nhật vào hồ sơ học sinh.",
        "Xuất file nhập sẵn cho Wayground (Quizizz), Kahoot, Quizlet.",
        "Hướng dẫn từng bước có ảnh cho từng nền tảng.",
      ]}
    />
  );
}
