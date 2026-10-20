# Prompt dán vào Claude Code

Có hai trường hợp. Hiện tại code V3.5 chưa có trên GitHub, nên dùng **Trường hợp 1**. Đừng dán API key vào prompt.

---

## Làm tiếp V4 (dùng từ bây giờ)

V4 đã có đủ các trang trên nhánh `v4-nang-cap`. Mở Claude Code ở repo này (bản web hoặc trên máy), dán:

```
Làm tiếp Lớp Mình V4 trên nhánh v4-nang-cap. Đọc CLAUDE.md, rồi docs/CHANGELOG-V4.md để biết đã xong gì, và mục cần làm trong docs/SPEC-V4.md.
Việc lần này: <ghi một việc cụ thể, ví dụ: nối Supabase thật cho hồ sơ, lớp, học sinh, ghi chú theo migration trong supabase/; giữ chế độ demo khi chưa có biến môi trường>.
Lập kế hoạch ngắn cho mình duyệt trước. Code xong thì chạy npm run test, npm run lint, npm run build, thử trên trình duyệt ở khổ máy tính và điện thoại, ghi CHANGELOG, commit tiếng Việt và push lên v4-nang-cap.
```

Các việc còn lại, mỗi lần làm một việc: nối Supabase + đăng nhập Google; phòng quiz trực tiếp trên điện thoại học sinh (Supabase Realtime); đọc Gmail (docs/GMAIL.md); ảnh chụp màn hình cho các bước hướng dẫn trong `public/guides/`; dark mode.

---

## Trường hợp 1 — Dựng V4 mới từ đầu (đã làm xong, giữ lại để tham khảo)

Chạy được cả trên Claude Code bản web (máy ảo đám mây) lẫn trên máy.

```
Dự án Lớp Mình: repo https://github.com/HoangNhan2412-ICD/Lopminh_Project, nhánh v4-nang-cap. Repo chưa có code, chỉ có CLAUDE.md và docs/SPEC-V4.md. Mình muốn dựng V4 mới từ đầu theo đúng spec.

Đọc kỹ CLAUDE.md và docs/SPEC-V4.md trước. Sau đó lập kế hoạch cho GIAI ĐOẠN 1 dưới đây, gửi mình xem (cấu trúc thư mục, danh sách package, schema ban đầu), mình duyệt rồi mới code.

GIAI ĐOẠN 1 — Bộ khung chạy được:
1. Khởi tạo Next.js (App Router, TypeScript strict, Tailwind, ESLint), cài shadcn/ui, lucide-react, sonner, zod, @tanstack/react-query, zustand, vitest. Font Be Vietnam Pro qua next/font. .gitignore chặn .env*, tạo .env.example với giá trị giả.
2. Design System theo mục 1 của spec: token trong app/globals.css, cấu hình Tailwind dùng token. Đồng thời tạo design/_tokens.css và design/00-styleguide.html (trang HTML tĩnh, mở bằng trình duyệt là xem được toàn bộ màu, chữ, nút, thẻ, nhãn, ô nhập).
3. Khung giao diện: thanh điều hướng 6 mục (Lớp Mình Hôm Nay, Soạn Bài, Hộp Thư Công Việc, Kho Tri Thức, Góc Cởi Bỏ Chiếc Áo, Hồ Sơ), header có tên + danh xưng, nút "Aa" tăng cỡ chữ, SmartTimetableBar (đồng hồ GMT+7, dải tiết, chế độ Ở nhà).
4. CHẾ ĐỘ DEMO: khi chưa có biến môi trường Supabase/Gemini, app vẫn chạy với dữ liệu mẫu trong lib/demo/ gồm 3 hồ sơ Cô Nguyễn Thị Mai Hoa (nữ), Thầy Trần Văn Tiến (nam), Cô Lê Thu Phương (nữ), mỗi người có lớp chủ nhiệm, lớp bộ môn, học sinh mẫu (An, Bình, Chi, Tâm…). Có nút đổi hồ sơ trên header. Như vậy bạn trong nhóm clone về là chạy npm run dev xem được ngay.
5. Xưng hô theo mục 3 của spec: lib/persona/honorific.ts với getHonorific(), addressOf(), fixAddress(); đổi hồ sơ thì remount theo key={profileId} và xóa state chat. Viết test vitest: đổi Hoa → Tiến → Phương 10 vòng, mọi chỗ hiển thị đều đúng danh xưng.
6. Supabase: client/server bằng @supabase/ssr, đăng nhập Google, migration SQL cho bảng profiles, classes, students, student_notes, timetable (có RLS). Màn hình chào lần đầu hỏi "Bé Bảng nên gọi mình là Thầy hay Cô ạ?".
7. lib/ai/: client @google/genai chỉ chạy ở server, lib/ai/models.ts đọc tên model từ env. Kiểm tra tài liệu Gemini mới nhất trước khi đặt giá trị mặc định.

Mỗi bước nhỏ ở trên xong (build + lint + test qua) thì commit tiếng Việt và push lên v4-nang-cap, ghi docs/CHANGELOG-V4.md. Xong giai đoạn 1 thì báo mình cách chạy thử và dừng lại chờ.

Các giai đoạn sau làm theo mục 14 của spec, từ mục 3 trở đi (nhập tay Tab 1, xuất file, quiz, kho tri thức, email, tâm tình, hồ sơ, tour). Mỗi màn hình lớn làm bản HTML trong design/ trước rồi mới dựng React.

Nguyên tắc: làm chắc hơn làm nhanh; kiểm tra tài liệu chính thức thay vì dựa trí nhớ; không dùng thư viện không chính thức đăng nhập hộ bằng cookie; chỗ nào tốn tiền, cần quyền Google đặc biệt hoặc spec chưa rõ thì hỏi mình. Mình là lập trình viên, cứ nói chuyện bình thường, không cần gọi Thầy/Cô.
```

---

## Trường hợp 2 — Khi tìm lại được code V3.5

Mở Claude Code trong thư mục chứa code cũ (thư mục có `package.json`, `app/`…), rồi dán khối dưới đây. Nếu V4 đã dựng xong một phần, nên để code cũ vào thư mục `legacy-v3/` làm tài liệu tham khảo thay vì gộp đè.

---

```
Mình đang làm dự án Lớp Mình (web trợ lý AI cho giáo viên, Next.js + Supabase + Gemini). Code hiện tại nằm trong thư mục này. Repo GitHub: https://github.com/HoangNhan2412-ICD/Lopminh_Project. Trên GitHub đã có nhánh `v4-nang-cap` chứa CLAUDE.md và docs/SPEC-V4.md.

BƯỚC 0 — Nối code với nhánh, chưa sửa gì:
1. Kiểm tra thư mục này đã là git repo chưa, remote là gì, có thay đổi chưa commit không. Báo lại cho mình trước khi làm tiếp.
2. Đưa code hiện tại lên nhánh `v4-nang-cap` một cách an toàn:
   - Nếu chưa có git: git init, thêm remote origin trỏ tới repo trên, fetch, checkout nhánh v4-nang-cap từ origin (nếu đụng file trùng tên như README.md thì giữ bản của mình và gộp nội dung), rồi commit toàn bộ code hiện tại với message "chore: đưa code V3.5 lên làm mốc".
   - Nếu đã có git với lịch sử riêng: fetch origin rồi merge origin/v4-nang-cap với --allow-unrelated-histories vào một nhánh local tên v4-nang-cap.
   - Tuyệt đối không push lên main, không push --force.
3. TRƯỚC KHI COMMIT: quét toàn bộ code tìm API key, token, mật khẩu (đặc biệt chuỗi bắt đầu bằng "AQ." hoặc "AIza", và mọi file .env). Nếu có, chuyển sang biến môi trường, thêm .env* vào .gitignore, tạo .env.example với giá trị giả, và nhắc mình thu hồi key cũ. Chỉ push khi chắc chắn không còn bí mật nào.
4. Push nhánh v4-nang-cap lên origin.

BƯỚC 1 — Đọc kỹ CLAUDE.md và docs/SPEC-V4.md. Sau đó đọc code hiện có và viết cho mình một bản đối chiếu ngắn: mục nào trong spec code đã có, mục nào thiếu, chỗ nào code đang làm khác spec, và nguyên nhân gốc của lỗi xưng hô (đang ở Cô Hoa đổi sang thầy thì bị gọi "Thầy Hoa"). Chờ mình trả lời rồi mới code.

BƯỚC 2 trở đi — Làm lần lượt theo mục 14 của SPEC-V4.md. Với mỗi mục:
- Lập kế hoạch ngắn (file nào sửa, thư viện nào thêm, vì sao).
- Code, viết test cho logic chính, chạy npm run build, npm run lint, npm run test.
- Nếu là giao diện mới hoặc thay đổi lớn: làm trước một file HTML tĩnh trong design/ (Tailwind CDN + design/_tokens.css, dữ liệu mẫu, comment "SỬA Ở ĐÂY") để bạn mình mở bằng trình duyệt sửa được, rồi mới dựng component React.
- Ghi vào docs/CHANGELOG-V4.md.
- Commit (message tiếng Việt, dạng feat(pham-vi): mô tả) và push lên v4-nang-cap ngay, đừng gom nhiều tính năng vào một commit.
- Báo mình 3–5 dòng: đã làm gì, cách thử, còn gì chưa xong.

Nguyên tắc:
- Không cần làm nhanh, cần làm chắc. Tính năng xuất file được phép chạy 1–3 phút nhưng kết quả phải dùng được ngay trên lớp.
- Trước khi chọn model Gemini hay thư viện, kiểm tra tài liệu chính thức mới nhất; đừng dựa vào trí nhớ.
- Không dùng thư viện không chính thức kiểu đăng nhập hộ NotebookLM/Quizizz bằng cookie.
- Chỗ nào spec không rõ hoặc phải đánh đổi lớn (tốn tiền, cần quyền Google đặc biệt, phá dữ liệu cũ) thì hỏi mình, đừng tự quyết.
- Dữ liệu cũ trong Supabase phải giữ nguyên; thay đổi schema thì viết migration.
```

---

## Prompt ngắn cho các lần sau

Khi mở phiên Claude Code mới để làm tiếp:

```
Làm tiếp dự án theo CLAUDE.md và docs/SPEC-V4.md. Xem docs/CHANGELOG-V4.md để biết đã xong tới đâu, rồi làm mục tiếp theo trong mục 14. Xong mục nào commit và push lên v4-nang-cap mục đó.
```

Khi bạn trong nhóm đã sửa một file trong `design/`:

```
Bạn mình vừa sửa design/<tên-file>.html (xem git diff). Chuyển các thay đổi giao diện đó sang component React tương ứng, giữ đúng token màu và chữ, không copy nguyên HTML. Chạy build, commit, push lên v4-nang-cap.
```

Khi muốn sửa một lỗi cụ thể:

```
Lỗi: <mô tả, kèm ảnh chụp nếu có>. Tìm nguyên nhân gốc trước, nói cho mình biết, rồi sửa, thêm test để lỗi không quay lại, commit và push lên v4-nang-cap.
```
