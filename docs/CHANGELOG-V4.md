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

## Giai đoạn 2 — Soạn Bài và xuất file (20/10/2026)

- Giao diện: đầu trang Hôm Nay là một tấm bảng phấn (đồng hồ, lời Bé Bảng, dải tiết); bìa Hồ sơ ghi câu phong cách dạy; sửa lỗi tên bị bìa che; sửa được phong cách dạy ngay trên Hồ sơ.
- **Soạn Bài**: nhập tên bài, lớp, số phút, mong muốn (gõ hoặc nói), 3 câu chẩn đoán → `/api/lesson/generate` (Gemini structured output theo schema zod, thử lại khi quá tải, có giáo án khung khi chưa có khóa) → làm sạch (tách slide dài, đủ bìa/dặn dò/mã QR).
- Một bộ dàn trang duy nhất (`src/lib/lesson/layout.ts`, 13 kiểu slide) vẽ cả bản xem trước trên web lẫn file PowerPoint, nên file tải về giống hệt bản xem.
- Sửa từng slide: sửa tay, đổi kiểu, kéo lên xuống, hoặc "Làm lại slide này" với yêu cầu thêm (`/api/lesson/slide`). "Soạn lại cả bộ" với yêu cầu thêm.
- Phân hóa hai tầng: xếp học sinh theo ghi chú thật, bấm để chuyển tầng.
- Xuất PowerPoint 16:9 (biểu tượng vẽ thành ảnh nét, mã QR từ link quiz, lời giảng + câu lệnh tạo hình trong ghi chú) và Word theo Phụ lục IV CV 5512 (bảng 4 bước, phân hóa theo tên, phiếu hai tầng, đáp án trắc nghiệm).
- 3 theme slide: Bảng xanh, Giấy kem, Tươi sáng.
- Test: mọi kiểu slide × mọi theme không tràn khổ; giáo án qua bước làm sạch đúng cấu trúc 5512.

## Giai đoạn 3 — Phòng Quiz (20/10/2026)

- Lấy câu hỏi có sẵn từ giáo án vừa soạn, hoặc dán nội dung bài để Bé Bảng soạn câu mới (`/api/quiz/generate`, chọn số câu và mức độ), hoặc tự gõ. Sửa từng câu, đáp án đúng, thời gian.
- **Chiếu lên lớp** không cần điện thoại: ô A-B-C-D bốn màu, đồng hồ đếm ngược, hiện đáp án và giải thích, bảng điểm 4 tổ. Phím tắt Space / → / Esc.
- Xuất file nhập Wayground (Quizizz) và Kahoot (.xlsx theo mẫu nhập của từng nền tảng), chép sẵn cho Quizlet (Tab giữa câu và đáp án).
- Dán link phòng bất kỳ → mã QR lớn, tải ảnh PNG. Hướng dẫn từng bước cho Wayground, Kahoot, Quizlet, có nút đọc to.
- Phòng quiz trực tiếp trên điện thoại học sinh sẽ làm khi nối Supabase Realtime.
