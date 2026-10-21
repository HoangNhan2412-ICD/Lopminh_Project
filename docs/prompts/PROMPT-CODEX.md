# Prompt cho Codex CLI — làm nốt Lớp Mình V4

Cách dùng: mở Codex ở thư mục gốc repo (đã `git checkout v4-nang-cap`, đã có `.env.local`), dán **Prompt chính** ở dưới. Codex sẽ làm lần lượt từng giai đoạn trong file này, mỗi giai đoạn một commit, và dừng ở những chỗ ghi **DỪNG** để chờ bạn.

Muốn Codex chỉ làm một giai đoạn thì thêm vào cuối prompt: `Lần này chỉ làm Giai đoạn N.`

---

## Prompt chính

```
Bạn là lập trình viên tiếp quản dự án Lớp Mình (web trợ lý AI cho giáo viên phổ thông Việt Nam), nhánh v4-nang-cap.

ĐỌC TRƯỚC, theo thứ tự, chưa sửa gì:
1. CLAUDE.md — luật của dự án. Tuy tên file là của Claude Code nhưng mọi luật trong đó áp dụng y nguyên cho bạn (xưng hô qua getHonorific(), không commit khóa, NFC, chỉ dùng token màu, dữ liệu nhạy cảm, quy trình git).
2. AGENTS.md — đây là Next.js 16, khác Next.js bạn biết. Trước khi dùng API nào của Next (proxy, after, route handler, cache), đọc hướng dẫn trong node_modules/next/dist/docs/.
3. docs/CHANGELOG-V4.md — những gì đã xong.
4. docs/prompts/PROMPT-CODEX.md — danh sách giai đoạn cần làm, tiêu chí xong, chỗ phải dừng.
5. Mục liên quan trong docs/SPEC-V4.md khi bắt đầu từng giai đoạn (đừng đọc cả file một lúc).

CÁCH LÀM:
- Làm từng giai đoạn theo thứ tự trong PROMPT-CODEX.md. Đầu mỗi giai đoạn: viết kế hoạch 5–10 dòng (file nào sửa, package nào thêm, vì sao), rồi làm luôn, trừ khi giai đoạn đó ghi DỪNG.
- Chế độ demo phải luôn chạy: thiếu biến môi trường Supabase/Gemini/Google thì app vẫn mở được, dùng dữ liệu trong trình duyệt như hiện tại. Không được làm hỏng điều này.
- Xong mỗi giai đoạn: npm run test, npm run lint, npm run build đều phải qua. Mở npm run dev và thử bằng Playwright ở khổ 1280px và 390px (không tràn ngang). Ghi docs/CHANGELOG-V4.md. Đánh dấu [x] giai đoạn đó trong PROMPT-CODEX.md. Commit tiếng Việt dạng feat(pham-vi): mô tả, push lên origin v4-nang-cap.
- Báo mình 3–5 dòng sau mỗi giai đoạn: đã làm gì, thử thế nào, còn gì chưa xong.

KHÔNG ĐƯỢC:
- Push lên main, push --force, sửa lịch sử git.
- Commit .env*, khóa, token. Không in khóa ra log hay ra màn hình. Thấy khóa thật trong code thì dừng và báo.
- Viết cứng "Thầy"/"Cô" kèm tên trong UI hoặc prompt. Để model đoán giới tính từ tên.
- Ghi sức khỏe, tâm lý, nội dung chat, nội dung thư vào log.
- Thêm dịch vụ tốn tiền, đổi model Gemini mặc định, hay xin quyền Google mới mà chưa hỏi mình.
- Dùng thư viện không chính thức đăng nhập hộ (NotebookLM, Quizizz, Zalo) bằng cookie.
- Đoán khi thiếu thông tin. Gặp chỗ cần tài khoản, khóa, hay quyết định sản phẩm thì DỪNG và hỏi.

Bắt đầu bằng Giai đoạn 0.
```

---

## Các giai đoạn

### [ ] Giai đoạn 0 — Kiểm tra nền

- `npm ci`, rồi `npm run test`, `npm run lint`, `npm run build`. Ghi lại kết quả.
- Liệt kê biến môi trường đang có trong `.env.local` (chỉ tên biến, không in giá trị).
- Không sửa code ở giai đoạn này. Báo kết quả rồi làm tiếp Giai đoạn 1.

### [ ] Giai đoạn 1 — Nút "Trò chuyện với Bé Bảng" dễ thấy

Vấn đề: chat nằm ở Góc Thầy Cô → Tâm Tình (`/tam-tinh`), người thử không tìm ra.

- Trang Hôm Nay (`src/components/today/TodayView.tsx` / `TodayBoard.tsx`): thêm một lời mời trò chuyện ngắn có nút dẫn tới `/tam-tinh`. Chữ dùng danh xưng qua `getHonorific()` / `addressOf()`.
- Nút nổi góc dưới phải trên mọi trang trừ `/tam-tinh` và `/dang-nhap`, biểu tượng lucide (ví dụ `MessageCircleHeart`), có nhãn chữ trên máy tính, chỉ biểu tượng trên điện thoại. Trên điện thoại đặt cao hơn thanh điều hướng dưới, không che nội dung.
- Vùng bấm ≥ 44×44px, có `aria-label`, chỉ dùng token màu trong `src/app/globals.css`.
- Thêm bước tương ứng vào tour (`src/lib/tours.ts`, thuộc tính `data-tour`).

Xong khi: từ mọi trang bấm một lần là vào chat; không che nút Gửi hay thanh dưới ở 390px.

### [ ] Giai đoạn 2 — Chat báo lỗi rõ ràng và trang kiểm tra sức khỏe

Vấn đề: trên Vercel, khi chat không chạy thì không biết vì thiếu khóa, khóa sai, hết hạn mức hay sai tên model.

- `src/app/api/chat/route.ts` (và `src/lib/ai/json.ts`): phân loại lỗi Gemini theo mã HTTP: 400/401/403 khóa sai hoặc chưa bật API; 404 tên model không tồn tại; 429 hết hạn mức; 5xx Google quá tải. Trả về cho người dùng câu tiếng Việt dễ hiểu theo từng loại. Log server chỉ ghi mã lỗi và loại, không ghi nội dung tin nhắn.
- Thêm `GET /api/health`: trả `{ ai: true|false, models: {...}, supabase: true|false, gate: true|false }` và kết quả một lời gọi Gemini rất ngắn (`MODELS.fast`, prompt "ping", tối đa 5 token) dạng `ok` / mã lỗi. Không bao giờ trả khóa. Route này phải đi qua cổng mật khẩu như các API khác (`src/proxy.ts`).
- Khi trả lời ở chế độ demo, giao diện chat hiện một dòng nhỏ "Đang chạy thử, chưa nối Gemini" thay vì chỉ có ghi chú ở cuối câu.
- Thêm phần "Kiểm tra" vào `docs/DEPLOY.md`: mở `/api/health` để biết thiếu gì.

Xong khi: có test cho hàm phân loại lỗi; với khóa giả `GEMINI_API_KEY=sai` thì chat hiện đúng câu "khóa sai".

### [ ] Giai đoạn 2B — Thẻ học sinh trực quan + quy trình riêng cho từng em

Vấn đề: ghi chú học sinh hiện là danh sách chữ (`src/components/today/ClassBoard.tsx`), khó nhìn. Và khi biết một em vắng, thầy cô phải tự nhớ soạn bù, kiểm tra bù, báo phụ huynh.

Làm bản HTML trước: `design/02-the-hoc-sinh.html` (theo quy ước thư mục `design/` trong CLAUDE.md), gửi mình xem, rồi mới dựng React.

**A. Thẻ học sinh**

- Lưới thẻ `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, mỗi em một thẻ:
  - Đầu thẻ: ô chữ viết tắt tên (màu lấy từ token theo id, không hex), số thứ tự, họ tên, nhãn học lực, nhãn lớp.
  - Nút có mặt/vắng ở góc phải: bấm một lần là đổi, viền thẻ đổi màu theo trạng thái (vắng = màu cảnh báo).
  - Một dòng nổi bật nếu có: thành tích (màu thành công) hoặc "Cần hỗ trợ: …" (màu chú ý).
  - Các nhãn đặc điểm (`traits`), tối đa 3, còn lại gom "+2".
  - Dòng "Gợi ý khi dạy: Tầng 1 (Cốt lõi)" hoặc "Tầng 2 (Nâng cao)" lấy từ `suggestTiers()` ở `src/lib/lesson/build.ts`.
  - Chân thẻ: một nút chính "Ghi chú", một nút phụ biểu tượng máy ảnh. Nếu em đang có quy trình thì hiện nhãn tiến độ, ví dụ "Bù bài 2/5".
- Thanh lọc phía trên: ô tìm không dấu (tên, đặc điểm, ghi chú) + chip có số đếm: Tất cả, Vắng/Ốm, Cần hỗ trợ, Tầng nâng cao, Đang có việc cần làm.
- Bấm "Ghi chú" mở bảng nhỏ (trên điện thoại là sheet từ dưới lên): chip ghi nhanh một chạm ("Vắng có phép", "Vắng không phép", "Ốm", "Chưa làm bài", "Phát biểu tốt", "Mất tập trung", "Tiến bộ"), ô gõ, nút micro (`useSpeechToText`). Lưu thành `StudentNote` như hiện tại, map chip sang `NoteKind`.
- Nút máy ảnh: chụp/chọn ảnh vở, bài làm làm minh chứng, gắn vào ghi chú, lưu cục bộ (thu nhỏ ≤ 1280px). Không gửi ảnh đi đâu ở giai đoạn này.
- Bấm vào tên mở trang chi tiết của em: dòng thời gian ghi chú, các quy trình đã và đang chạy, ảnh minh chứng.
- Thêm vào `Student` (`src/lib/types.ts`) các trường tùy chọn `hocLuc?: "gioi" | "kha" | "trung-binh" | "yeu"` và `noiBat?: { loai: "thanh-tich" | "can-ho-tro"; text: string }`. Nhập danh sách lớp từ Excel (`src/lib/kho/roster.ts`) đọc thêm cột "Học lực". Dữ liệu demo bổ sung cho đủ.
- Không đưa chữ kỹ thuật lên giao diện (không "Tier", "Impact Engine", "Recharts"…). Ghi chú sức khỏe, tâm lý hiện biểu tượng khóa và không bao giờ đưa vào tin nhắn phụ huynh trừ khi thầy cô tự gõ.

**B. Quy trình cho từng em**

Khi có sự kiện về một em, app tự mở một quy trình gồm các bước, chuẩn bị sẵn bản nháp, thầy cô chỉ duyệt và bấm. Không có gì tự gửi đi.

- Quy trình "Bù bài khi vắng", mở khi em bị đánh dấu vắng (bằng nút trên thẻ, chip ghi nhanh, hoặc ghi chú giọng nói có `absentToday`):
  1. Tóm tắt bài em nghỉ: lấy giáo án đã soạn cho lớp đó ngày đó (`useLessons`). Không có thì hỏi thầy cô chọn bài hoặc gõ tên bài.
  2. Phiếu bù bài theo tầng phù hợp của em: Gemini soạn từ giáo án (dùng `generateJson()`), xem trước, tải Word, in được.
  3. Kiểm tra bù 5 câu: tạo bộ câu hỏi như Phòng Quiz, chiếu được hoặc in, có mã QR.
  4. Hẹn ngày bù: mặc định 3 ngày học sau, thầy cô sửa được; đến hạn thì hiện ở trang Hôm Nay.
  5. Nhắn phụ huynh: viết nháp (dùng lại cách của `/api/mail/reply`), có nút chép, không tự gửi.
  6. Ghi kết quả bù (điểm hoặc nhận xét) và đóng quy trình.
- Quy trình "Phụ đạo" khi em có `noiBat.loai = "can-ho-tro"` hoặc ghi chú học tập yếu lặp lại 3 lần trong 2 tuần: gợi ý kế hoạch 2 tuần (3 buổi, mỗi buổi mục tiêu + bài tập ngắn), theo dõi từng buổi.
- Quy trình "Hỏi thăm khi ốm nhiều ngày" (vắng vì ốm từ 2 ngày): nhắc giảm bài, nháp tin hỏi thăm phụ huynh. Không ghi chẩn đoán.
- Trên trang Hôm Nay thêm mục "Việc cho từng em hôm nay": các bước đến hạn, mỗi dòng một nút làm tiếp.
- Mở quy trình là tạo bản nháp ngay nếu có Gemini (chạy nền, không chặn giao diện); không có khóa thì tạo khung bước với nội dung mẫu. Một em vắng nhiều tiết trong ngày chỉ mở một quy trình.
- Dữ liệu: kiểu `StudentWorkflow` { id, studentId, classId, loai, noteId, lessonId?, steps: { key, label, status: "cho" | "dang-lam" | "xong" | "bo-qua", due?, ketQua?, artifact? }[], createdAt, closedAt? }, lưu `lm:workflows:<profileId>` qua `useLocal`. Mẫu quy trình để trong `src/lib/workflows/templates.ts`, logic mở/đóng là hàm thuần trong `src/lib/workflows/engine.ts` để test được. Giai đoạn 3 chuyển sang bảng Supabase.
- Test: đánh dấu vắng → đúng 1 quy trình 6 bước; vắng 2 tiết cùng ngày → vẫn 1; đánh dấu có mặt lại trong ngày → hỏi có hủy quy trình không; ghi chú yếu 3 lần → gợi ý phụ đạo; tin nhắn phụ huynh không chứa ghi chú sức khỏe, tâm lý.

Xong khi: Cô Mai Hoa (dữ liệu demo) bấm vắng cho một em ở thẻ, trong một phút thấy phiếu bù, 5 câu kiểm tra và nháp tin phụ huynh sẵn để duyệt; ở 390px thẻ không tràn, mọi nút ≥ 44px.

### [ ] Giai đoạn 3 — Supabase thật + đăng nhập Google

**DỪNG trước khi code**: hỏi mình đã tạo project Supabase và bật Google provider chưa. Cần `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong `.env.local` (mình tự điền, bạn không hỏi giá trị). Chưa có thì vẫn làm được phần code, nhưng chỉ thử ở chế độ demo, và nói rõ chưa thử với Supabase thật.

- Client/server bằng `@supabase/ssr` (đã có trong package.json). Đăng nhập Google; trang chào lần đầu hỏi "Bé Bảng nên gọi mình là Thầy hay Cô ạ?" và tên gọi, ghi vào `profiles.gender`, `profiles.call_name`.
- Migration mới `supabase/migrations/0002_...sql` cho các dữ liệu đang nằm trong localStorage mà 0001 chưa có. Các khóa hiện có: `lm:profiles`, `lm:current`, `lm:notes:<pid>`, `lm:rosters:<pid>`, `lm:lessons:<pid>`, `lm:quiz:<pid>`, `lm:quizurl:<lessonId>`, `lm:mail:<pid>`, `lm:docs:<pid>`, `lm:filestore:<pid>`, `lm:chat:<pid>`, `lm:chatmem:<pid>`, `lm:load:<pid>:<date>`, `lm:kynang:<pid>`, `lm:songngu-days:<pid>`. Mọi bảng có `user_id` và RLS `auth.uid() = user_id`. Không sửa migration 0001 đã có, chỉ thêm migration mới.
- Giữ nguyên giao diện hàm của `useLocal` / `src/lib/store/app-store.tsx` / `useLessons` / `useDocs`: thêm lớp lưu trữ chọn localStorage hoặc Supabase tùy có biến môi trường và có phiên đăng nhập. Component không phải sửa nhiều.
- Lần đầu đăng nhập mà trình duyệt còn dữ liệu demo: hỏi "Chuyển dữ liệu trên máy này vào tài khoản?", có/không. Không tự xóa dữ liệu cục bộ.
- Đổi tài khoản thì xóa sạch state chat và cache theo `profileId` (luật xưng hô số 2). Giữ test đổi hồ sơ 10 vòng, thêm test cho lớp lưu trữ.
- Chat và sổ ghi nhớ là dữ liệu nhạy cảm: lưu được (RLS chỉ chủ tài khoản đọc), nhưng có nút "Xóa toàn bộ trò chuyện" xóa thật trên server.
- Cổng `SITE_PASSWORD` giữ nguyên, chạy trước bước đăng nhập. Ghi cách tắt khi đã có đăng nhập Google vào `docs/DEPLOY.md`.

Xong khi: không có biến Supabase thì app y như cũ; có thì đăng nhập, dữ liệu theo tài khoản, mở máy khác thấy cùng dữ liệu.

### [ ] Giai đoạn 4 — Soạn giáo án chạy nền (luật số 6)

Vấn đề: `/api/lesson/generate` là một request kéo tới 3 phút; mạng chập chờn là mất.

- Bảng `jobs` (id, user_id, kind, status `cho|dang-chay|xong|loi`, progress 0–100, step, result jsonb, error, created_at) trong migration mới, có RLS.
- `POST /api/jobs/lesson`: tạo job, trả `jobId` ngay, phần soạn chạy sau khi trả lời. Đọc `node_modules/next/dist/docs/` về `after()` trong Next 16 và giới hạn thời gian trên Vercel trước khi chọn cách làm. `GET /api/jobs/[id]` trả trạng thái. Client hỏi lại mỗi 2–3 giây hoặc dùng Supabase Realtime.
- `LessonStudio.tsx`: thanh tiến độ theo `step` thật; đóng tab mở lại vẫn thấy job đang chạy hoặc kết quả.
- Không có Supabase: giữ đường cũ (gọi thẳng), không lỗi.
- Xuất PPTX/DOCX đang chạy trên trình duyệt (`ExportPanel.tsx`), giữ nguyên, chỉ thêm chỉ báo tiến độ nếu chưa có.

Xong khi: tắt mạng giữa chừng rồi bật lại, giáo án vẫn hiện khi job xong.

### [ ] Giai đoạn 5 — Phòng quiz trên điện thoại học sinh

**DỪNG nếu chưa có Supabase** (cần Realtime).

- Giáo viên bấm "Mở phòng" trong Phòng Quiz → tạo phòng mã 6 số + mã QR (dùng `qrcode.react`) dẫn tới `/choi/<ma>`.
- `/choi/<ma>`: học sinh không cần đăng nhập, chỉ nhập biệt danh. Trang này và `/api` của nó phải đi qua được cổng `SITE_PASSWORD` (học sinh không có mật khẩu): cho phép riêng đường `/choi/*` trong `src/proxy.ts`, giới hạn tốc độ gửi.
- Màn hình học sinh: 4 ô A-B-C-D màu `--quiz-a..d`, chữ to, bấm một lần. Màn hình chiếu của giáo viên (`QuizPlayer.tsx`): số em đã trả lời, biểu đồ đáp án, bảng xếp hạng.
- Supabase Realtime (broadcast/presence) cho câu hiện tại và đếm người; bảng `quiz_rooms`, `quiz_answers` có RLS phù hợp (giáo viên sở hữu phòng; học sinh chỉ ghi câu trả lời của mình). Không lưu tên thật hay thông tin cá nhân của học sinh; xóa phòng sau 24 giờ.

Xong khi: một máy tính chiếu + 3 tab điện thoại giả lập chơi trọn một bộ 5 câu, điểm đúng.

### [ ] Giai đoạn 6 — Đọc Gmail (chỉ đọc)

**DỪNG trước khi code**: hỏi mình đã làm bước 1–3 trong `docs/GMAIL.md` chưa. Đây là quyền "restricted", chưa xác minh thì tối đa 100 tài khoản thử.

- Làm theo bước 4–5 của `docs/GMAIL.md`. Nút "Kết nối Gmail" trong Hộp Thư, xin quyền riêng khi bấm (không xin lúc đăng nhập).
- Lấy thư 3 ngày gần nhất, gom nhiều thư vào một lần gọi `/api/mail/classify`. Cache kết quả theo hash nội dung để không phân loại lại.
- Ô "Dán tin" cho Zalo giữ nguyên.

Xong khi: có test cho phần ghép thư Gmail thành `RawMail[]` (dùng dữ liệu giả); không có quyền Gmail thì Hộp Thư vẫn như cũ.

### [ ] Giai đoạn 7 — Đối chiếu file nhập Wayground và Kahoot

**DỪNG**: nhờ mình tải file mẫu chính thức của Wayground (Quizizz) và Kahoot, đặt vào `docs/mau-nhap/`. Không tự đoán cột.

- So cột, dòng tiêu đề, dòng bắt đầu dữ liệu, giới hạn thời gian và số đáp án với `src/lib/quiz/export.ts`. Sửa cho khớp.
- Thêm test đọc file mẫu và so tiêu đề với file mình xuất.

### [ ] Giai đoạn 8 — Ảnh minh họa cho hướng dẫn

- Script Playwright (`scripts/chup-huong-dan.ts`) chạy app ở chế độ demo, chụp các bước trong `PlatformGuide.tsx` (phần của Lớp Mình) và `src/content/ky-nang-so.ts` vào `public/guides/` (WebP, rộng ≤ 1200px).
- Gắn ảnh vào từng bước, có `alt` tiếng Việt. Bước nằm trên trang của nền tảng khác (Wayground, Kahoot, Quizlet) thì không chụp, ghi rõ "chụp tay" trong CHANGELOG.

### [ ] Giai đoạn 9 — Giao diện Sáng / Tối / Tự động theo giờ Việt Nam

Ba lựa chọn: **Sáng**, **Tối**, **Tự động**. Mặc định là Tự động.

- **Tự động theo giờ Việt Nam (GMT+7), không theo cài đặt máy**: từ 06:00 đến trước 18:00 là Sáng, từ 18:00 đến trước 06:00 là Tối. Hai mốc giờ để thành hằng số ở một chỗ (ví dụ `src/lib/theme.ts`) để dễ chỉnh. Tính giờ bằng múi `Asia/Ho_Chi_Minh` (dùng lại `vnNow()` / `useVnClock` ở `src/lib/time.ts`, `src/lib/hooks.ts`), nên máy để múi giờ khác vẫn đúng giờ Việt Nam.
- Đang mở app mà qua mốc 18:00 hoặc 06:00 thì tự đổi, không cần tải lại trang. Chuyển màu êm (transition ngắn), tôn trọng `prefers-reduced-motion`.
- Không nháy màn hình sai màu lúc mở trang: đặt một đoạn script nhỏ trong `<head>` (`src/app/layout.tsx`) đọc `lm:theme` và giờ Việt Nam rồi gắn `data-theme="light|dark"` lên `<html>` trước khi vẽ. Bọc đọc localStorage trong try/catch; lỗi thì coi như Tự động.
- Lưu lựa chọn trong `lm:theme` (`auto` | `light` | `dark`). Khi có Supabase (Giai đoạn 3) thì lưu thêm vào hồ sơ để đổi máy vẫn giữ.
- Nút chọn: ở header cạnh nút "Aa", và trong trang Hồ sơ. Ba lựa chọn có chữ rõ ("Sáng", "Tối", "Tự động theo giờ"), không chỉ biểu tượng. Khi đang Tự động, hiện dòng nhỏ kiểu "Đang tối vì đã sau 18 giờ". Vùng bấm ≥ 44×44px.
- Bộ token tối trong `src/app/globals.css` dưới `:root[data-theme="dark"]`. Không thêm mã màu hex vào component. Kiểm tra tương phản WCAG AA cho chữ thường, chữ trên nút, nhãn màu của Hộp Thư, ô A-B-C-D của quiz.
- Giữ nguyên: bảng phấn (`.chalkboard`) vẫn là bảng xanh; khung xem trước slide (`SlideCanvas`) và file PowerPoint/Word xuất ra không đổi theo giao diện app, vì chúng theo theme slide riêng. Màn hình "Chiếu lên lớp" có nút chọn riêng, mặc định Sáng vì máy chiếu trong lớp thường sáng.
- Thêm bước vào tour giới thiệu nút này. Test: hàm chọn giao diện theo giờ (05:59 → tối, 06:00 → sáng, 17:59 → sáng, 18:00 → tối) chạy đúng dù múi giờ máy là UTC hay America/New_York.
- Cập nhật `design/_tokens.css` và `design/00-styleguide.html` có cả bản tối.

### [ ] Giai đoạn 10 — Rà soát trước khi cho thầy cô dùng thử

- Tìm chuỗi viết cứng "Thầy "/"Cô " kèm tên trong `src/` (trừ test và `honorific.ts`). Sửa qua `getHonorific()`.
- Tìm mã màu hex trong `src/components/`. Chuyển sang token.
- Vùng bấm < 44px, chữ < 18px ở nội dung chính, trang tràn ngang ở 390px. Sửa.
- Mọi input người dùng và output AI qua `nfc()`.
- Thông tin đường dây nóng trong `src/lib/ai/prompts.ts` (`SANCTUARY_RULES`): KHÔNG tự sửa số. Liệt kê các số/đường dây đang dùng trong báo cáo để mình kiểm tra với nguồn chính thức.
- Viết `docs/KIEM-TRA-TRUOC-PHAT-HANH.md`: danh sách điều đã kiểm tra, điều cần người kiểm tra tay.

---

## Việc không giao cho Codex

Các việc này cần tài khoản của bạn: thu hồi khóa Gemini cũ; tạo project Supabase; bật Google OAuth và Gmail API trên Google Cloud; cài biến môi trường và Deployment Protection trên Vercel; tải file mẫu Wayground/Kahoot.
