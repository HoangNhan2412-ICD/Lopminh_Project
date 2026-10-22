# Tiết kiệm token

Có hai chỗ tốn token: Claude Code lúc nhóm code, và Gemini lúc thầy cô dùng app.

## 1. Khi code bằng Claude Code

Cách rẻ nhất không cần cài gì:

- Mỗi việc một phiên. Xong một tính năng thì mở phiên mới (hoặc gõ `/clear`); phiên càng dài, mỗi câu hỏi càng phải gửi lại cả lịch sử.
- Chỉ đúng file: "sửa `src/lib/lesson/layout.ts`, bố cục so-sánh" rẻ hơn nhiều so với "sửa slide cho đẹp".
- `CLAUDE.md` ngắn và đúng (file này được đọc ở đầu mọi phiên). Đừng dán cả SPEC vào prompt; bảo Claude đọc mục cần thiết, ví dụ "đọc mục 6 của docs/SPEC-V4.md".
- Dùng `/compact` khi phiên đã dài mà chưa xong việc.

Các repo GitHub thường được nhắc tới (đã được một bài đo thử trên một dự án TypeScript cỡ nhỏ, con số chỉ để tham khảo):

| Repo | Làm gì | Ghi chú |
|---|---|---|
| [drona23/claude-token-efficient](https://github.com/drona23/claude-token-efficient) | Một file CLAUDE.md ngắn với ~11 luật hành vi | Dễ nhất, gộp vài luật vào CLAUDE.md của mình là được |
| [Mibayy/token-savior](https://github.com/Mibayy/token-savior) | MCP server tra code theo tên hàm thay vì đọc cả file | Lợi rõ khi repo lớn dần |
| [rtk-ai/rtk](https://github.com/rtk-ai/rtk) | Lọc bớt output dài của lệnh shell (build, test, git) trước khi đưa cho Claude | Hợp với `npm run build` của Next.js vì log dài |
| [mksglu/context-mode](https://github.com/mksglu/context-mode) | Cất output lớn vào SQLite, chỉ đưa phần tìm được | Hợp khi chạy Playwright, log dài |
| [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | Bắt Claude trả lời cụt hơn | Giảm chữ trả lời, gần như không giảm khi Claude đang tự làm việc |

Khuyên: dùng các thói quen ở trên trước; repo lớn hơn thì thử `token-savior` hoặc `rtk`. Cài MCP/plugin bên thứ ba thì đọc mã nguồn trước, vì chúng chạy trên máy và đọc code của dự án.

Nguồn: [computingforgeeks — reduce Claude Code token usage](https://computingforgeeks.com/reduce-claude-code-token-usage-tools/), [pasqualepillitteri.it — 10 GitHub repos](https://pasqualepillitteri.it/en/news/1181/claude-code-token-10-github-repos-savings).

## 2. Khi app gọi Gemini

Đã làm sẵn trong code (SPEC mục 15):

- Phần cố định của prompt (luật Bé Bảng, luật soạn bài) luôn đứng đầu → Gemini tự cache phần giống nhau giữa các lần gọi và tính rẻ hơn cho phần đó ([Google: implicit caching](https://developers.googleblog.com/en/gemini-2-5-models-now-support-implicit-caching/)).
- Chọn model theo việc (`src/lib/ai/models.ts`): lọc thư, tách ghi chú, sổ ghi nhớ dùng Flash-Lite; chỉ soạn giáo án dùng model nặng.
- Tâm Tình chỉ gửi 8 lượt gần nhất + sổ ghi nhớ ngắn, không gửi cả lịch sử. Tin ngắn thì để mức suy nghĩ tối thiểu.
- Kho tài liệu dùng File Search để chỉ lấy đoạn liên quan, không nhồi cả sách vào prompt.
- Lọc thư gom nhiều thư vào một lần gọi.
- Mọi lần gọi ghi số token vào log server (`[ai] … in= cached= out=`), không ghi nội dung, để xem tính năng nào tốn nhất.

Việc nên làm tiếp: dùng Batch API cho việc không gấp (lọc hộp thư buổi tối), cache kết quả phân loại thư theo hash nội dung khi nối Supabase.
