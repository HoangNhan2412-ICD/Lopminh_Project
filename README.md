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
src/components/     giao diện, chia theo trang (today/, sanctuary/, profile/, shell/)
src/lib/persona/    xưng hô Thầy/Cô và lời chào của Bé Bảng
src/lib/ai/         gọi Gemini (chỉ chạy ở server), prompt, tên model
src/lib/demo/       dữ liệu mẫu
design/             HTML mẫu cho cả nhóm sửa
supabase/           migration SQL
legacy-v3/          code V3.5 cũ (khôi phục một phần, chỉ để tham khảo)
```
