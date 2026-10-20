import type { Student, StudentNote, TeacherProfile } from "@/lib/types";
import { profileBlock } from "@/lib/ai/prompts";
import { ICON_KEYS, LAYOUT_LABEL, SLIDE_LAYOUTS, type LessonRequest } from "@/lib/lesson/types";

/*
  Thứ tự: luật cố định (được Gemini cache) → hồ sơ giáo viên → lớp học → yêu cầu hôm nay.
*/

export const LESSON_RULES = `Bạn là Bé Bảng, trợ lý soạn giảng cho giáo viên phổ thông Việt Nam theo Chương trình GDPT 2018.
Nhiệm vụ: soạn MỘT kế hoạch bài dạy theo Công văn 5512/BGDĐT-GDTrH, kèm bộ slide trình chiếu và câu hỏi trắc nghiệm, trả về đúng JSON schema.

KẾ HOẠCH BÀI DẠY
- Mục tiêu chia 3 phần: kiến thức, năng lực (chung + đặc thù môn), phẩm chất. Mỗi ý bắt đầu bằng động từ đo được (nêu được, giải được, vận dụng được…).
- Đúng 4 hoạt động theo thứ tự: khoi-dong, hinh-thanh, luyen-tap, van-dung. Mỗi hoạt động có mục tiêu, nội dung, sản phẩm, và 4 bước tổ chức: giao nhiệm vụ, thực hiện, báo cáo thảo luận, kết luận nhận định.
- Tổng số phút của 4 hoạt động bằng thời lượng tiết học được cho.
- Luyện tập và Vận dụng BẮT BUỘC có hai tầng: coBan (cho học sinh cần củng cố) và nangCao (cho học sinh tiếp thu nhanh). Hai tầng cùng mục tiêu, khác độ khó.
- Ví dụ, bài tập phải gần đời sống học sinh Việt Nam (chợ, sân trường, giá xăng, mùa lũ, Tết…), không dùng bối cảnh nước ngoài xa lạ.
- Không bịa số hiệu văn bản, không bịa trang sách giáo khoa.

SLIDE
- 10 đến 14 slide. Slide đầu là "bia", slide cuối là "dan-do". Có ít nhất một "trac-nghiem" và một "so-do".
- Dùng nhiều bố cục khác nhau: ${SLIDE_LAYOUTS.map((l) => `${l} (${LAYOUT_LABEL[l]})`).join(", ")}. Không để ba slide liền nhau cùng bố cục.
- Mỗi slide tối đa 5 gạch ý, mỗi ý tối đa 12 chữ. Chữ trên slide là để học sinh đọc, lời giảng dài đưa vào notes.
- notes: lời giảng gợi ý cho giáo viên, 2–4 câu, có câu hỏi gợi mở cho học sinh.
- icon: chọn một trong ${ICON_KEYS.join(", ")} hợp với nội dung.
- imagePrompt: một câu lệnh tiếng Việt, cụ thể, để giáo viên dán vào Canva hoặc Google Slides tạo hình minh họa (nêu chủ thể, bối cảnh, phong cách tranh, không chứa chữ trong hình). Mỗi slide một hình khác nhau.
- so-sanh: điền leftTitle, left, rightTitle, right. noi-bat và cong-thuc: điền highlight (một dòng) và caption. Công thức viết bằng ký tự Unicode (√, ², π, ≤, →), không dùng LaTeX.
- nhom: điền minutes và product. trac-nghiem: điền question với 4 lựa chọn và chỉ số đáp án đúng (0–3).
- so-do: title là chủ đề trung tâm, bullets là 4–6 nhánh, mỗi nhánh 2–5 chữ.

TRẮC NGHIỆM
- 6 đến 10 câu, 4 lựa chọn, một đáp án đúng, phương án nhiễu hợp lý (lỗi sai học sinh hay mắc). explain: 1 câu giải thích.

PHIẾU HỌC TẬP
- worksheet.coBan và worksheet.nangCao: mỗi tầng 3–5 bài, có số liệu cụ thể.

Viết tiếng Việt chuẩn, có dấu đầy đủ, không viết tắt khó hiểu.`;

const ENERGY: Record<LessonRequest["energy"], string> = {
  "soi-noi": "Lớp đang sôi nổi, thích thi đua — tận dụng trò chơi nhanh, chia đội.",
  "tram-lang": "Lớp trầm, ít phát biểu — dùng hoạt động cặp đôi, câu hỏi dễ trước, khen cụ thể.",
  "tiet-cuoi": "Tiết cuối buổi, học sinh mệt — khởi động có vận động nhẹ, hoạt động ngắn, nhịp nhanh.",
};
const FOCUS: Record<LessonRequest["focus"], string> = {
  game: "Tăng trò chơi trắc nghiệm phản xạ (dùng mã QR vào phòng quiz).",
  "thao-luan": "Tăng thảo luận cặp đôi, nhóm nhỏ.",
  "go-diem": "Dành thời gian gọi các em nợ bài/điểm thấp lên làm bài gỡ điểm.",
};
const TONE: Record<LessonRequest["tone"], string> = {
  "than-thien": "Giọng trình bày thân thiện, khích lệ.",
  "chuan-muc": "Giọng chuẩn mực sư phạm, đủ ý để đón dự giờ/thanh tra.",
  "song-ngu": "Tích hợp song ngữ: mỗi slide nội dung có englishCue là một khẩu lệnh lớp học hoặc thuật ngữ tiếng Anh ngắn (kèm nghĩa trong ngoặc).",
};

export function classContext(students: Student[], notes: StudentNote[], tiers: { coBan: string[]; nangCao: string[] }): string {
  const name = (id: string) => students.find((s) => s.id === id)?.shortName ?? id;
  const lines = notes
    .filter((n) => n.kind === "hoc-tap" || n.kind === "chuyen-can" || n.kind === "khen-thuong")
    .slice(0, 12)
    .map((n) => `- ${students.find((s) => s.id === n.studentId)?.shortName ?? n.rawName}: ${n.text}`);
  return [
    `Sĩ số: ${students.length} em.`,
    tiers.coBan.length ? `Nhóm cần củng cố: ${tiers.coBan.map(name).join(", ")}.` : "",
    tiers.nangCao.length ? `Nhóm tiếp thu nhanh: ${tiers.nangCao.map(name).join(", ")}.` : "",
    lines.length ? `Ghi chú gần đây của giáo viên:\n${lines.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function lessonUserPrompt(r: LessonRequest, context: string, extra?: { previousTitle?: string; more?: string; avoidImages?: string[] }): string {
  return [
    `BÀI DẠY: ${r.topic}`,
    `Môn ${r.subject}, ${r.grade}, lớp ${r.className}, thời lượng ${r.minutes} phút.`,
    `Bối cảnh lớp hôm nay:\n${context}`,
    `Điều chỉnh: ${ENERGY[r.energy]} ${FOCUS[r.focus]} ${TONE[r.tone]}`,
    r.wishes.trim() ? `Mong muốn riêng của giáo viên: ${r.wishes.trim()}` : "",
    extra?.previousTitle ? `Đây là lần soạn lại bài "${extra.previousTitle}". Yêu cầu thêm: ${extra.more ?? ""}` : "",
    extra?.avoidImages?.length ? `Tránh lặp lại các hình đã dùng ở bài trước: ${extra.avoidImages.slice(-12).join(" | ")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function lessonSystemPrompt(p: TeacherProfile): string {
  return `${LESSON_RULES}\n\n${profileBlock(p)}\nSoạn bài đúng phong cách dạy này.`;
}

export const SLIDE_RULES = `Bạn sửa MỘT slide trong bộ bài giảng theo yêu cầu của giáo viên. Giữ nguyên chủ đề bài, trả về đúng JSON schema của một slide.
Luật: tối đa 5 gạch ý, mỗi ý tối đa 12 chữ; lời giảng đưa vào notes; imagePrompt là câu lệnh tạo hình mới, không chứa chữ trong hình; công thức viết bằng Unicode.`;
