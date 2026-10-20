# Lớp Mình (lopminhedu.vn) — ghi chú dự án cho Claude Code

File này được Claude Code tự đọc ở đầu mỗi phiên. Đây là luật chơi của dự án; đặc tả đầy đủ nằm ở `docs/SPEC-V4.md`.

## Dự án là gì

Web trợ lý AI cho giáo viên phổ thông Việt Nam (K-12). Người dùng chính là thầy cô 40–60 tuổi, không rành công nghệ. Mọi quyết định giao diện phải trả lời được câu hỏi: "Cô Mai Hoa 52 tuổi, mắt kém, đang vội giữa hai tiết, có bấm đúng được không?"

Trợ lý trong app tên **Bé Bảng**: xưng "Bé Bảng", gọi giáo viên dùng app là "Thầy/Cô + tên".

Lưu ý cho Claude Code: người đang làm việc với bạn là **lập trình viên của dự án (Nhân và nhóm)**, không phải giáo viên. Nói chuyện với họ bình thường, xưng "mình", gọi "bạn". Cách xưng hô Thầy/Cô chỉ áp dụng cho chữ hiển thị trong app.

## Tình trạng code

Code V3.5 cũ không có trên GitHub. V4 được dựng mới trên nhánh `v4-nang-cap` theo `docs/SPEC-V4.md`. Nếu sau này code cũ được đưa lên (thư mục `legacy-v3/`), chỉ dùng để tham khảo nội dung và mẫu file xuất, không bê nguyên cấu trúc.

## Stack

- Next.js (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui (Radix). Icon: lucide-react.
- Supabase: Auth (Google OAuth), Postgres có RLS (`auth.uid() = user_id` trên mọi bảng chứa dữ liệu giáo viên), Storage, Realtime.
- AI: Gemini qua SDK mới `@google/genai` (không dùng `@google/generative-ai` cũ). Tên model không được hard-code rải rác: để hết trong `lib/ai/models.ts`, đọc từ biến môi trường, và kiểm tra danh sách model hiện hành trên ai.google.dev trước khi chọn.
- Mọi lời gọi Gemini chạy ở server (Route Handler / Server Action). API key không bao giờ xuống client.

## Luật cứng

1. **Bí mật.** Không commit `.env*`, key, token. Chỉ commit `.env.example` với giá trị giả. Nếu thấy key thật trong code hoặc tài liệu, dừng lại và báo cho người dùng để thu hồi key.
2. **Xưng hô.** Danh xưng "Thầy"/"Cô" lấy từ trường `gender` trong hồ sơ, qua đúng một hàm `getHonorific()` ở `lib/persona/honorific.ts`. Không chuỗi nào trong UI hay prompt được tự viết cứng "Thầy"/"Cô" kèm tên. Không bao giờ để model tự đoán giới tính từ tên. Đổi tài khoản/hồ sơ thì reset toàn bộ state chat và cache theo `profileId`.
3. **Tiếng Việt.** Font Be Vietnam Pro (qua `next/font/google`). Chuẩn hóa mọi chuỗi về NFC (`str.normalize('NFC')`) ở cả input người dùng lẫn output của AI. Không dùng font serif.
4. **Giao diện không lộn xộn.** Chỉ dùng token trong `app/globals.css` / `tailwind.config` (xem `docs/SPEC-V4.md` mục Design System). Không mã màu hex rải trong component. Mỗi thẻ (card) có tối đa một nút hành động chính. Cỡ chữ nền 18px, vùng bấm tối thiểu 44×44px, tương phản đạt WCAG AA.
5. **Dữ liệu nhạy cảm.** Sức khỏe, tâm lý của giáo viên và học sinh: chỉ chủ tài khoản thấy, không đưa vào log, không gửi cho dịch vụ bên thứ ba ngoài Gemini, không tự nhắc lại khi người dùng không hỏi.
6. **Việc lâu thì chạy nền.** Xuất file (PPTX, DOCX, quiz, mindmap) chạy như job có tiến độ (bảng `jobs` + Realtime hoặc polling), không bắt người dùng ngồi chờ một request 60 giây.

## Quy trình git

- Nhánh làm việc: `v4-nang-cap`. Không push thẳng lên `main`, không `push --force` lên nhánh dùng chung.
- Mỗi tính năng xong (chạy được, `npm run build` và `npm run lint` qua, test liên quan qua) thì commit và push ngay lên `v4-nang-cap`. Commit message tiếng Việt, ngắn, dạng `feat(xung-ho): đồng bộ Thầy/Cô theo hồ sơ`.
- Ghi lại thay đổi vào `docs/CHANGELOG-V4.md` sau mỗi tính năng.

## Bản mẫu HTML cho người cùng sửa

Thư mục `design/` chứa các file HTML tự đứng một mình (mở thẳng bằng trình duyệt, không cần `npm`). Dùng khi cần bạn trong nhóm sửa giao diện mà không chạy Next.js. Quy ước:
- Mỗi màn hình một file: `design/01-lop-minh-hom-nay.html`, `design/02-soan-bai.html`…
- Dùng Tailwind CDN + cùng bộ token màu/chữ với app (copy từ `design/_tokens.css`).
- Dữ liệu mẫu viết thẳng trong file, có comment `<!-- SỬA Ở ĐÂY -->` chỉ chỗ nên chỉnh.
- Khi bạn trong nhóm sửa xong HTML, Claude Code chuyển phần thay đổi sang component React tương ứng, không copy nguyên khối HTML vào app.

## Lệnh thường dùng

```
npm run dev      # chạy local
npm run build    # phải qua trước khi commit
npm run lint
npm run test     # vitest
```
