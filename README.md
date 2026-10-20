# Lớp Mình (lopminhedu.vn)

Trợ lý AI "Bé Bảng" cho giáo viên phổ thông Việt Nam: theo dõi lớp, soạn bài số, và một góc riêng để thầy cô nghỉ ngơi, học thêm.

Đang làm bản V4 trên nhánh `v4-nang-cap`. Đặc tả đầy đủ: [`docs/SPEC-V4.md`](docs/SPEC-V4.md). Đã làm tới đâu: [`docs/CHANGELOG-V4.md`](docs/CHANGELOG-V4.md).

## Chạy thử

Cần Node.js 20 trở lên.

```bash
npm install
npm run dev
```

Mở http://localhost:3000. Chưa cần khóa gì cả: app chạy **chế độ demo** với 3 hồ sơ giáo viên mẫu, đổi qua lại ở nút góc phải trên.

Muốn Bé Bảng trả lời thật bằng Gemini:

```bash
cp .env.example .env.local
# mở .env.local, điền GEMINI_API_KEY (lấy ở https://aistudio.google.com/apikey)
npm run dev
```

## Có gì trong bản V4

| Trang | Làm được gì |
|---|---|
| Lớp Mình Hôm Nay | Tấm bảng: giờ, lời Bé Bảng, các tiết. Lớp chủ nhiệm/bộ môn. Ghi nhanh bằng gõ tay hoặc giọng nói, Bé Bảng tách thành ghi chú từng em. |
| Hộp Thư Công Việc | Lọc tin Zalo/email: BGH khẩn, chủ nhiệm, bộ môn, phụ huynh, hành chính, rác. Bắt hạn chót, viết nháp trả lời. |
| Kho Dữ Liệu | Tài liệu (Gemini File Search, hỏi đáp có nguồn), danh sách lớp từ Excel, gói sang NotebookLM. |
| Soạn Bài | Giáo án 5512 + 12–14 slide có hình (13 kiểu), phân hóa hai tầng theo tên học sinh, sửa/làm lại từng slide, tải PowerPoint và Word. |
| Phòng Quiz | Câu hỏi từ giáo án hoặc nội dung dán vào, chiếu lên lớp thi theo tổ, xuất Wayground/Kahoot/Quizlet, mã QR, hướng dẫn từng bước. |
| Tâm Tình | Trò chuyện stream, có sổ ghi nhớ xem/xóa được. |
| Song Ngữ, Kỹ Năng Số | Khẩu lệnh lớp học, thuật ngữ theo môn, tập nói; bài kỹ năng số 2 phút. |
| Hồ sơ | Danh xưng Thầy/Cô, phong cách dạy, chỉ tiêu, tâm trạng, màu riêng. |

Mọi trang có nút dấu hỏi để xem hướng dẫn từng bước (có đọc to).

## Lệnh

```bash
npm run build      # phải qua trước khi commit
npm run lint
npm run test       # vitest
npm run typecheck
```

## Sửa giao diện không cần chạy code

Thư mục `design/` có các file HTML mở thẳng bằng trình duyệt. Sửa xong commit lên, rồi nhờ Claude Code chuyển thay đổi sang React (xem `docs/prompts/PROMPT-CLAUDE-CODE.md`).

## Thư mục

```
src/app/            các trang (mỗi thư mục là một đường dẫn) + api/
src/components/     giao diện, chia theo trang (today/, lesson/, quiz/, mail/, kho/, growth/, sanctuary/, profile/, shell/)
src/lib/lesson/     mô hình giáo án, dàn trang slide (dùng chung cho xem trước và PowerPoint), xuất PPTX/DOCX
src/lib/quiz/       xuất file Wayground/Kahoot/Quizlet
src/lib/mail/       phân loại thư (Gemini + bộ lọc từ khóa)
src/lib/kho/        kho tài liệu, nhập danh sách lớp
src/content/        nội dung Song Ngữ, Kỹ Năng Số (sửa ở đây, không cần đụng giao diện)
src/lib/persona/    xưng hô Thầy/Cô và lời chào của Bé Bảng
src/lib/ai/         gọi Gemini (chỉ chạy ở server), prompt, tên model
src/lib/demo/       dữ liệu mẫu
design/             HTML mẫu cho cả nhóm sửa
supabase/           migration SQL
legacy-v3/          code V3.5 cũ (khôi phục một phần, chỉ để tham khảo)
```
