# Code V3.5 khôi phục một phần

File nén gửi lên (`lopminh-20261020T152207Z-1-001`) là phần 1 trong một lượt tải bị Google Drive chia nhỏ: thư mục `src/` và `.git/objects` chỉ có tên thư mục, không có file. 36/45 file trong `src/` được khôi phục lại từ source map trong `.next/` (nội dung gốc, không phải code đã biên dịch).

Còn thiếu 9 file, cần bản nén phần 2 hoặc bản nén mới chỉ gồm `src/`:

- `src/app/api/gemini/route.ts` (route gọi Gemini, chứa prompt hệ thống phía server)
- `src/app/layout.tsx`, `src/app/globals.css`, `src/app/favicon.ico`
- `src/types/knowledge.ts`, `lessonPlan.ts`, `sanctuary.ts`, `student.ts`, `teacher.ts`

Vì thiếu các file trên nên thư mục này chưa build được. Chỉ dùng để đọc và tham khảo.

Không đưa lên: `.env.local` (có key Gemini thật, cần thu hồi), `node_modules/`, `.next/`.
