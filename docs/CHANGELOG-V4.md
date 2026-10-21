# Nhật ký thay đổi V4

## Tiếp quản Codex — Giai đoạn 1 (21/10/2026)

- Lời mời trò chuyện ngay đầu Hôm Nay, danh xưng qua `addressOf()`; nút chat nổi trên các trang làm việc, ẩn ở Tâm Tình và Đăng nhập.
- Điện thoại chỉ hiện biểu tượng, cao hơn thanh điều hướng và safe area; cuối trang có khoảng trống để cuộn nội dung khỏi nút nổi. Máy tính có nhãn chữ. Thêm bước tour.
- 26/26 test, lint và build qua. Playwright: 10 trang × 1280/390px không tràn; nút ≥44px, không đè thanh dưới; bấm một lần vào chat từ 8 trang, đúng hai trang ẩn nút.

## Tiếp quản Codex — Giai đoạn 0 (21/10/2026)

- Đồng bộ nhánh `v4-nang-cap` tại `b390b86`, không sửa code ứng dụng.
- `npm ci`: qua (634 package); `npm run test`: 6 file, 26/26 test qua; `npm run lint`: qua; `npm run build`: qua, 24 trang được prerender, biên dịch 4,5 giây.
- Build trong sandbox bị kẹt; chạy lại ngoài sandbox thành công. Còn cảnh báo lockfile ở thư mục cha và cảnh báo thư viện phụ thuộc cũ, chưa đổi dependency.
- Playwright Chromium trên `npm run dev`: 10 đường dẫn × 2 khổ 1280/390px, không tràn ngang. Công cụ kiểm tra cài trong `/tmp/lopminh-browser-check`, không thêm dependency repo.
- Không có `.env.local`, nên không có tên biến để liệt kê. Toàn bộ kiểm tra ở chế độ demo, chưa gọi Gemini hoặc Supabase thật.
- Người dùng xác nhận chưa có Supabase và hoãn Gmail. Giai đoạn 3 chỉ thử demo; Giai đoạn 5 và 6 chờ thiết lập dịch vụ.

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

## Giai đoạn 4 — Hộp Thư và Kho Dữ Liệu (20/10/2026)

- **Hộp Thư Công Việc** (thay Bộ lọc Zalo): dán tin Zalo/email hoặc dùng hộp thư mẫu → `/api/mail/classify` gắn nhãn BGH khẩn / Chủ nhiệm / Bộ môn / Phụ huynh / Hành chính / Không liên quan, tìm lớp, tóm tắt, hạn chót, việc cần làm. Chưa có Gemini thì dùng bộ lọc từ khóa (có test). Bản tin đầu trang, lọc theo nhãn, tìm không dấu, đánh dấu đã xong, đổi nhãn, nhờ viết nháp trả lời (`/api/mail/reply`, không tự gửi). Hướng dẫn bật Gmail ở `docs/GMAIL.md`.
- **Kho Dữ Liệu**: tải tài liệu theo 5 loại (sách, văn bản chỉ đạo, kế hoạch, chỉ tiêu, khác). Có Gemini thì đưa vào Gemini File Search riêng từng giáo viên (`/api/kho/upload`) và hỏi đáp có ghi nguồn (`/api/kho/ask`); chưa có thì đọc chữ Word/TXT ngay trên máy và tìm theo từ khóa.
- Soạn Bài có ô "Dựa vào Kho Dữ Liệu": gửi kèm đoạn tài liệu liên quan và lấy thêm từ File Search.
- Học sinh: nhập danh sách lớp từ Excel/CSV (có file mẫu), sửa đặc điểm từng em; Soạn Bài và Hôm Nay dùng danh sách mới.
- Sang NotebookLM: chọn giáo án và tài liệu → tải "Gói NotebookLM" (kèm câu lệnh mẫu, không chứa tên/sức khỏe/tâm lý học sinh) + hướng dẫn 5 bước có đọc to. NotebookLM chưa có API công khai cho tài khoản thường nên chưa tạo sổ tự động.

## Giai đoạn 5 — Góc Thầy Cô, tour, bản mẫu HTML (20/10/2026)

- **Tâm Tình**: luật giọng nói mới (câu ngắn, có cảm xúc, nhắc đúng chi tiết, không văn mẫu, có ví dụ tốt/kém), sổ ghi nhớ cập nhật ngầm mỗi 4 lượt bằng model nhanh (`/api/chat/memory`), thầy cô xem và xóa từng dòng. Tin ngắn dùng mức suy nghĩ tối thiểu để chữ hiện nhanh hơn.
- **Song Ngữ**: khẩu lệnh theo 5 tình huống, thuật ngữ theo môn, câu song ngữ lấy từ slide đã soạn; nghe mẫu, tập nói (so khớp từng chữ, chỉ khen và chỉ ra một chữ), chuỗi ngày học.
- **Kỹ Năng Số**: 6 bài 2 phút (chiếu PowerPoint, quét QR, chèn video, chia sẻ Drive, Google Form, Zalo máy tính), gợi ý theo việc vừa làm, đọc to, đánh dấu đã làm được. Nội dung ở `src/content/`.
- **Tour hướng dẫn** (driver.js): nút dấu hỏi trên mọi trang, tự mở tour tổng quan lần đầu, có "Đọc to" và "Để sau", danh xưng theo hồ sơ.
- Bản mẫu HTML cho nhóm sửa: `design/01-lop-minh-hom-nay.html`, `design/06-ho-so.html`.
- Sửa tràn ngang trên điện thoại ở mọi trang.
- `docs/TIET-KIEM-TOKEN.md`: cách tiết kiệm token khi code và khi app gọi Gemini.

**Còn thiếu**: Supabase thật + đăng nhập Google (dữ liệu đang ở trình duyệt), phòng quiz trên điện thoại học sinh, đọc Gmail tự động, ảnh chụp màn hình cho hướng dẫn, kiểm tra slide bằng ảnh (Gemini vision), dark mode. Số đường dây nóng hỗ trợ tâm lý cần kiểm tra lại trước khi phát hành.

## Chuẩn bị đưa lên mạng (20/10/2026)

- Cổng mật khẩu chung `SITE_PASSWORD` (`src/proxy.ts`, trang `/dang-nhap`): bật khi chạy trên mạng để người lạ không dùng ké khóa Gemini. Tắt khi để trống.
- `vercel.json` đặt máy chủ ở Singapore. Giới hạn tải tệp còn 4 MB cho khớp Vercel.
- Hướng dẫn deploy ở `docs/DEPLOY.md`.
