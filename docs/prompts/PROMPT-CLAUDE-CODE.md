# Prompt dán vào Claude Code

Mở Claude Code ngay trong thư mục chứa code Lớp Mình trên máy (thư mục có `package.json`, `app/`…), rồi dán nguyên khối dưới đây. Đừng dán API key vào prompt.

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
