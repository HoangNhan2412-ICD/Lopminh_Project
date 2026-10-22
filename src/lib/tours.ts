import type { TeacherProfile } from "@/lib/types";
import { addressOf, honorificLower } from "@/lib/persona/honorific";
import { capFirst } from "@/lib/text";

/*
  Nội dung tour hướng dẫn từng trang. Danh xưng lấy theo hồ sơ (không viết cứng Thầy/Cô).
  element: bộ chọn CSS theo thuộc tính data-tour; không thấy phần tử (ví dụ trên điện thoại)
  thì driver.js hiện lời nhắn ở giữa màn hình.
*/

export interface TourStep {
  element?: string;
  title: string;
  text: string;
}

export function toursFor(p: TeacherProfile): Record<string, TourStep[]> {
  const h = honorificLower(p);
  const H = capFirst(h);
  return {
    "/": [
      { title: `Chào ${addressOf(p)}`, text: `Em là Bé Bảng. Em dẫn ${h} đi một vòng chừng 1 phút nhé. Bấm “Tiếp” để đi tiếp, “Để sau” nếu ${h} đang bận.` },
      { element: "[data-tour=board]", title: "Tấm bảng hôm nay", text: `Giờ hiện tại, lời nhắn của em và các tiết trong ngày. ${H} bấm vào một tiết để xem lớp đó, bấm “Ở nhà” để xem tổng quan ngày mai.` },
      { element: "[data-tour=chat-shortcut]", title: "Trò chuyện với Bé Bảng", text: `${H} bấm nút này để kể chuyện với em. Nút luôn ở góc dưới bên phải trên các trang làm việc, phía trên thanh điều hướng điện thoại.` },
      { element: "[data-tour=class]", title: "Tình hình lớp", text: `Lớp chủ nhiệm hiện đủ mọi mặt; lớp bộ môn chỉ hiện em vắng, em cần gỡ điểm và em làm tốt cho gọn.` },
      { element: "[data-tour=note]", title: "Ghi nhanh", text: `${H} gõ hoặc bấm “Nói” rồi nói tự nhiên, ví dụ “An nghỉ ốm đến hết tuần”. Em tách thành ghi chú cho từng em, ${h} xem lại rồi mới lưu.` },
      { element: "[data-tour=nav]", title: "Ba nhóm việc", text: `Giám sát & Nhập liệu, Soạn Giảng Số, và Góc Thầy Cô để nghỉ ngơi, học thêm. Mỗi trang đều có nút dấu hỏi ở trên để xem lại hướng dẫn.` },
      { element: "[data-tour=theme]", title: "Sáng, Tối hoặc Tự động", text: "Bấm Màu để chọn giao diện. Tự động chuyển sáng lúc 6 giờ và tối lúc 18 giờ theo giờ Việt Nam." },
      { element: "[data-tour=font]", title: "Chữ to hơn", text: `Chữ nhỏ quá thì ${h} bấm chữ “Aa” to hơn ở đây.` },
      { element: "[data-tour=profile]", title: "Hồ sơ của mình", text: `Bấm vào đây để đổi hồ sơ hoặc xem Hồ sơ thấu hiểu bản thân. Ở đó ${h} chọn để em gọi là Thầy hay Cô, và tả phong cách dạy để em soạn bài cho đúng ý.` },
    ],
    "/soan-bai": [
      { element: "[data-tour=lesson-form]", title: "Soạn bài trong 3 bước", text: `Gõ tên bài, chọn lớp, trả lời 3 câu ngắn về lớp hôm nay. Muốn gì thêm cứ gõ hoặc nói vào ô Mong muốn. Bấm “Soạn bài” rồi ${h} làm việc khác, khoảng 1–2 phút là xong.` },
      { title: "Sau khi soạn xong", text: `${H} xem từng slide, slide nào chưa ưng thì bấm “Làm lại slide này”. Mục Phân hóa để đổi em nào làm phiếu Cơ bản hay Nâng cao. Mục Xuất file để tải PowerPoint và Word 5512.` },
    ],
    "/phong-quiz": [
      { title: "Phòng Quiz", text: `Lấy câu hỏi từ giáo án vừa soạn, hoặc dán nội dung bài để em soạn câu mới. Bấm “Chiếu lên lớp” để chơi ngay không cần điện thoại, hoặc tải file đưa sang Wayground, Kahoot, Quizlet. Bên phải có hướng dẫn từng bước.` },
    ],
    "/hop-thu": [
      { title: "Hộp Thư Công Việc", text: `Em gạt thư quảng cáo đi, đánh dấu thư Ban giám hiệu, phụ huynh, lớp chủ nhiệm, lớp bộ môn và nhặt ra hạn chót. ${H} dán tin Zalo vào ô bên phải là em lọc luôn.` },
    ],
    "/kho-du-lieu": [
      { title: "Kho Dữ Liệu", text: `${H} tải lên sách, kế hoạch tổ, công văn. Em dựa vào đây khi soạn bài và trả lời câu hỏi. Mục Học sinh để nhập danh sách lớp từ Excel. Mục Sang NotebookLM để gói tài liệu đưa sang NotebookLM.` },
    ],
    "/tam-tinh": [
      { title: "Góc Cởi Bỏ Chiếc Áo", text: `Ở đây ${h} không cần là giáo viên. Cứ kể, em nghe. Em ghi nhớ vài điều để lần sau hỏi thăm cho đúng, ${h} xem và xóa được ở cột bên phải.` },
    ],
    "/song-ngu": [
      { title: "Song Ngữ", text: `Bấm loa để nghe câu mẫu, bấm micro để tập nói. Em chỉ khen và chỉ ra một chữ cần đọc lại, không chấm điểm.` },
    ],
    "/ky-nang-so": [
      { title: "Kỹ Năng Số", text: `Mỗi ngày một bài 2 phút. Làm theo số thứ tự, xong thì bấm “Mình làm được rồi”.` },
    ],
    "/ho-so": [
      { title: "Hồ sơ thấu hiểu bản thân", text: `Chọn để em gọi là Thầy hay Cô, sửa phong cách dạy, xem chỉ tiêu năm học và chọn màu riêng của mình.` },
    ],
  };
}
