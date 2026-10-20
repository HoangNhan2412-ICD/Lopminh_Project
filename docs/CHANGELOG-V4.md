# Nhật ký thay đổi V4

## Giai đoạn 1 — Bộ khung chạy được (20/10/2026)

**Đã có**
- Next.js 16 (App Router, TypeScript strict, Tailwind 4), font Be Vietnam Pro tự host (không cần mạng khi chạy).
- Bộ token màu/chữ trong `src/app/globals.css`, bản sao cho HTML mẫu ở `design/_tokens.css`, trang xem chuẩn chung `design/00-styleguide.html`.
- Điều hướng theo 3 trụ cột (Giám sát & Nhập liệu · Soạn Giảng Số · Góc Thầy Cô); trên điện thoại là thanh dưới 4 nút + hàng mục con.
- Nút "Aa" ba mức cỡ chữ, nhớ theo trình duyệt.
- **Chế độ demo**: chưa có khóa Gemini/Supabase vẫn chạy, với 3 hồ sơ Cô Mai Hoa, Thầy Đức Nam, Cô Thu Phương, mỗi người có lớp chủ nhiệm, lớp bộ môn, thời khóa biểu, học sinh, ghi chú riêng.
- **Xưng hô**: `src/lib/persona/honorific.ts` là nơi duy nhất quyết định Thầy/Cô. Đổi hồ sơ là dựng lại toàn bộ trang theo `key={profile.id}`. `fixAddress()` sửa lại nếu AI lỡ gọi sai. Có test đổi hồ sơ 10 vòng.
- **Lớp Mình Hôm Nay**: đồng hồ GMT+7, dải tiết trong ngày (bấm để xem lớp), chế độ Ở nhà; lời chào Bé Bảng dựng từ dữ liệu thật; bảng lớp chủ nhiệm (đủ mọi mặt) và lớp bộ môn (vắng / cần gỡ điểm / làm tốt).
- **Ghi nhanh: gõ tay + giọng nói** chung một luồng → `/api/notes/parse` (Gemini structured output, có bộ tách dự phòng khi chưa có khóa) → bảng xác nhận sửa được từng dòng → lưu.
- **Góc Tâm Tình**: chat stream chữ hiện dần (`/api/chat`, mức suy nghĩ thấp cho nhanh), chỉ gửi 8 lượt gần nhất, lịch sử tách theo hồ sơ, nút đọc to, chọn mức tải tâm lý.
- **Hồ sơ Thấu hiểu Bản thân**: ảnh bìa theo màu riêng, phong cách dạy, chọn danh xưng + tên gọi (đổi là cả app đổi), vòng KPI, tâm trạng hôm nay, sở thích, 5 màu riêng.
- Các mục còn lại có trang giới thiệu tính năng sắp làm.
- `supabase/migrations/0001_khoi_tao.sql`: bảng profiles, classes, students, student_notes, timetable có RLS (chưa nối vào app).

**Chưa làm** (theo thứ tự SPEC mục 14): nối Supabase + đăng nhập Google, job nền xuất file, Soạn Bài, Phòng Quiz, Kho Dữ Liệu, Hộp Thư, Song Ngữ, Kỹ Năng Số, tour hướng dẫn.
