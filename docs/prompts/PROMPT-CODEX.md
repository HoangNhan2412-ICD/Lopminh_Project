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

Thứ tự: 0, 1, 2, 2B, 2C, 2D, 3, 4, 5, 6, 7, 8, 9, 10, và luôn kết thúc bằng Giai đoạn 11 (báo cáo tóm tắt, hạn chế, nâng cấp). Giai đoạn nào DỪNG chờ mình thì ghi lại lý do rồi chuyển sang giai đoạn kế tiếp làm được, đừng đứng im.

Bắt đầu bằng Giai đoạn 0.
```

---

## Các giai đoạn

### [x] Giai đoạn 0 — Kiểm tra nền

- `npm ci`, rồi `npm run test`, `npm run lint`, `npm run build`. Ghi lại kết quả.
- Liệt kê biến môi trường đang có trong `.env.local` (chỉ tên biến, không in giá trị).
- Không sửa code ở giai đoạn này. Báo kết quả rồi làm tiếp Giai đoạn 1.

### [x] Giai đoạn 1 — Nút "Trò chuyện với Bé Bảng" dễ thấy

Vấn đề: chat nằm ở Góc Thầy Cô → Tâm Tình (`/tam-tinh`), người thử không tìm ra.

- Trang Hôm Nay (`src/components/today/TodayView.tsx` / `TodayBoard.tsx`): thêm một lời mời trò chuyện ngắn có nút dẫn tới `/tam-tinh`. Chữ dùng danh xưng qua `getHonorific()` / `addressOf()`.
- Nút nổi góc dưới phải trên mọi trang trừ `/tam-tinh` và `/dang-nhap`, biểu tượng lucide (ví dụ `MessageCircleHeart`), có nhãn chữ trên máy tính, chỉ biểu tượng trên điện thoại. Trên điện thoại đặt cao hơn thanh điều hướng dưới, không che nội dung.
- Vùng bấm ≥ 44×44px, có `aria-label`, chỉ dùng token màu trong `src/app/globals.css`.
- Thêm bước tương ứng vào tour (`src/lib/tours.ts`, thuộc tính `data-tour`).

Xong khi: từ mọi trang bấm một lần là vào chat; không che nút Gửi hay thanh dưới ở 390px.

### [x] Giai đoạn 2 — Chat báo lỗi rõ ràng và trang kiểm tra sức khỏe

Vấn đề: trên Vercel, khi chat không chạy thì không biết vì thiếu khóa, khóa sai, hết hạn mức hay sai tên model.

- `src/app/api/chat/route.ts` (và `src/lib/ai/json.ts`): phân loại lỗi Gemini theo mã HTTP: 400/401/403 khóa sai hoặc chưa bật API; 404 tên model không tồn tại; 429 hết hạn mức; 5xx Google quá tải. Trả về cho người dùng câu tiếng Việt dễ hiểu theo từng loại. Log server chỉ ghi mã lỗi và loại, không ghi nội dung tin nhắn.
- Thêm `GET /api/health`: trả `{ ai: true|false, models: {...}, supabase: true|false, gate: true|false }` và kết quả một lời gọi Gemini rất ngắn (`MODELS.fast`, prompt "ping", tối đa 5 token) dạng `ok` / mã lỗi. Không bao giờ trả khóa. Route này phải đi qua cổng mật khẩu như các API khác (`src/proxy.ts`).
- Khi trả lời ở chế độ demo, giao diện chat hiện một dòng nhỏ "Đang chạy thử, chưa nối Gemini" thay vì chỉ có ghi chú ở cuối câu.
- Thêm phần "Kiểm tra" vào `docs/DEPLOY.md`: mở `/api/health` để biết thiếu gì.

Xong khi: có test cho hàm phân loại lỗi; với khóa giả `GEMINI_API_KEY=sai` thì chat hiện đúng câu "khóa sai".

### [x] Giai đoạn 2B — Thẻ học sinh trực quan + quy trình riêng cho từng em

Tiến độ 21/10/2026: người dùng đã duyệt HTML; đã dựng React, engine, nháp học liệu, Word/in/chiếu quiz và ảnh cục bộ. 49 test, lint, build và luồng demo Playwright 1280/390px qua. Chưa đo tiêu chí dưới một phút với Gemini thật (chưa có khóa); QR nhận link phòng do giáo viên dán, phòng điện thoại riêng chờ Giai đoạn 5.

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

### [ ] Giai đoạn 2C — Thư viện dựng sẵn: văn bản chỉ đạo + mục lục SGK Kết nối tri thức

Tiến độ 21/10/2026: đã có schema, 5 tệp mục lục rỗng cho các môn/lớp demo, danh sách văn bản chờ đối chiếu, tab thư viện, bộ chọn bài, script kiểm tra/nạp và nối kho chung. 58 test, lint, build, Playwright 1280/390px qua. DỪNG phần nội dung: chờ PDF gốc, mục lục thật, yêu cầu cần đạt và kiểm tra hiệu lực từ nhóm; chưa chạy upload hoặc kiểm thử bài SGK thật.

Mục tiêu: mở Kho Dữ Liệu là đã có sẵn văn bản soạn giáo án và mục lục SGK, thầy cô không phải tự tải. Soạn Bài chọn được bài trong SGK.

Bối cảnh đã kiểm tra (10/2026):
- Từ năm học 2026–2027 cả nước dùng một bộ SGK: **Kết nối tri thức với cuộc sống** (NXB Giáo dục Việt Nam), lớp 1–12, theo Quyết định 3588/QĐ-BGDĐT ngày 26/12/2025. Không cần làm các bộ khác.
- Công văn 5512/BGDĐT-GDTrH (18/12/2020) vẫn còn hiệu lực; Thông tư 15/2026/TT-BGDĐT (Điều lệ trường, hiệu lực 10/5/2026) chỉ bắt buộc giáo viên bộ môn một loại hồ sơ là kế hoạch bài dạy.
- SGK có bản quyền của NXB. Bản đọc miễn phí chính thức ở taphuan.nxbgd.vn. Văn bản quy phạm pháp luật và văn bản hành chính thì không thuộc đối tượng bảo hộ quyền tác giả, nên được đưa nguyên văn vào app.

**DỪNG trước khi nạp nội dung**: nhờ mình (hoặc nhóm) tải bản PDF gốc của từng văn bản từ nguồn chính thức (vbpl.vn, moet.gov.vn, chinhphu.vn) vào `kho-mac-dinh/van-ban/`. Không tự viết lại nội dung văn bản từ trí nhớ, không lấy từ trang tổng hợp không chính thức.

**A. Văn bản chỉ đạo** (`kho-mac-dinh/van-ban/` + `src/content/thu-vien/van-ban.ts`)

Danh sách cần có (nhóm kiểm tra lại số hiệu, ngày, còn hiệu lực hay không trên vbpl.vn trước khi nạp):
- Công văn 5512/BGDĐT-GDTrH (18/12/2020): đủ Phụ lục I–IV, nhấn Phụ lục IV (khung kế hoạch bài dạy, 4 hoạt động, mỗi hoạt động có mục tiêu / nội dung / sản phẩm / tổ chức thực hiện 4 bước).
- Thông tư 32/2018/TT-BGDĐT (Chương trình giáo dục phổ thông 2018) và các thông tư sửa đổi (ví dụ 13/2022/TT-BGDĐT): đây là nguồn của "yêu cầu cần đạt" từng môn, từng lớp.
- Thông tư 22/2021/TT-BGDĐT (đánh giá học sinh THCS, THPT) và Thông tư 27/2020/TT-BGDĐT (đánh giá học sinh tiểu học).
- Công văn 2345/BGDĐT-GDTH (kế hoạch giáo dục cấp tiểu học).
- Quyết định 3588/QĐ-BGDĐT (bộ SGK thống nhất), Thông tư 15/2026/TT-BGDĐT (Điều lệ trường).
- Công văn hướng dẫn nhiệm vụ năm học 2026–2027 của Bộ (giáo dục trung học, giáo dục tiểu học).

Mỗi văn bản một mục: số hiệu, tên, ngày ban hành, ngày hiệu lực, tình trạng, đường dẫn bản gốc, tóm tắt các phần dùng cho soạn bài (trích đúng điều/mục, ghi rõ trích từ đâu), thẻ (`#CV5512`, `#Khung bài dạy`…). Có trường `daKiemTra` và ngày kiểm tra; chưa kiểm tra thì giao diện hiện "Chưa đối chiếu bản gốc".

**B. Mục lục SGK Kết nối tri thức** (`src/content/thu-vien/sgk/<mon>-<lop>.json`)

- Chỉ lưu mục lục (tập, chương/chủ đề, tên bài, số tiết gợi ý) và **yêu cầu cần đạt lấy từ Chương trình GDPT 2018** (Thông tư 32/2018). Không chép nội dung trang sách, bài tập, hình ảnh của SGK vào app hay vào Gemini File Search.
- Mỗi bài có đường dẫn "Đọc sách" tới bản điện tử chính thức trên taphuan.nxbgd.vn (mở tab mới).
- Làm trước các môn, lớp của 3 hồ sơ demo; các môn khác để file trống theo cùng định dạng kèm hướng dẫn `docs/THU-VIEN.md` cho nhóm nhập dần. Không tự đoán tên bài: nhóm nhập từ mục lục sách thật, Codex viết schema zod, script kiểm tra định dạng và test.

**C. Giao diện Kho Dữ Liệu**

- Hai tab: **Thư viện chung** (dựng sẵn, chỉ đọc, giống nhau cho mọi thầy cô) và **Tài liệu của tôi** (như hiện tại, riêng từng người).
- Thẻ tài liệu như ảnh mẫu bạn mình gửi: tiêu đề, nhãn phần (ví dụ "Phụ lục IV: Khung kế hoạch bài dạy" hoặc "Chương 1: …"), tóm tắt có viền bên trái, thẻ `#…`, nút "Mở bản gốc" / "Đọc sách". Lọc theo loại (Văn bản / SGK), môn, lớp; tìm không dấu.
- Thầy cô tự tải SGK hay tài liệu của mình vào "Tài liệu của tôi" thì vẫn được (kho riêng, chỉ họ thấy), ghi chú nhắc dùng tài liệu mình có quyền dùng.

**D. Nối vào Soạn Bài**

- Thêm ô chọn "Bài trong SGK Kết nối tri thức": môn, lớp lấy theo lớp đang chọn → chương → bài. Chọn xong tự điền "Tên bài dạy" và gửi kèm yêu cầu cần đạt + số tiết vào prompt soạn bài (`src/lib/lesson/prompt.ts`). Gõ tay tên bài vẫn được như cũ.
- Phần luật soạn theo Phụ lục IV trong prompt đặt ở đầu (để Gemini tự cache) và lấy chữ từ văn bản đã nạp, không viết lại một bản khác.
- Có Gemini: tạo một File Search store chung cho văn bản (script `scripts/nap-thu-vien.ts`, chạy một lần, tên store đặt trong biến môi trường `GEMINI_SHARED_STORE`), dùng cùng store riêng của thầy cô khi soạn bài và khi hỏi đáp. Không có khóa thì tìm theo từ khóa trong dữ liệu dựng sẵn.

Xong khi: Cô Mai Hoa mở Kho thấy ngay các văn bản và mục lục môn mình; ở Soạn Bài chọn "Toán 9 → Chương 1 → Bài 2" là tên bài và yêu cầu cần đạt hiện sẵn, giáo án sinh ra bám đúng yêu cầu đó; test kiểm tra mọi file mục lục đúng schema.

### [x] Giai đoạn 2D — Xưởng học liệu: thầy cô nói cần gì, chọn loại file, app xuất ra

> Đã xong phần xuất file/demo và kiểm tra ngày 21/10/2026. Người dùng duyệt tạm hoãn âm thanh/video; chưa bật TTS. Chưa thử Gemini thật. Chi tiết: `docs/XUONG-HOC-LIEU.md`.

Ý tưởng: thầy cô gõ hoặc nói một yêu cầu, ví dụ "làm đồ thị cho bài 11 Vật lý 11", rồi tick những thứ muốn nhận: slide, giáo án Word, sơ đồ tư duy, đồ thị, phiếu học tập, quiz, video ngắn… App tự làm và trả về từng file.

Bối cảnh đã kiểm tra (10/2026): NotebookLM tạo được Video Overview, Slide Deck (PDF/PPTX), Infographic (PNG), Mind Map (PNG), Audio Overview, nhưng **không có API cho tài khoản thường**. API NotebookLM Enterprise trên Google Cloud đang ở bản Preview, chỉ tạo notebook, thêm nguồn, tạo Audio Overview, và không tải file về qua API. Vì vậy app tự tạo các loại file bằng Gemini + code của mình; riêng những thứ chỉ NotebookLM làm đẹp (Video Overview) thì app chuẩn bị gói nguồn + câu lệnh và hướng dẫn thầy cô bấm.

**A. Ô chọn bài trong Soạn Bài** (dùng chung dữ liệu với Giai đoạn 2C)

- Bộ môn, Khối lớp, Bộ SGK, Chương, Bài. Môn và khối tự điền theo lớp đang chọn và hồ sơ; Bộ SGK mặc định "Kết nối tri thức với cuộc sống (bộ dùng chung từ 2026–2027)", có thêm lựa chọn "Tài liệu khác / tự gõ".
- Chọn bài xong thì tên bài, yêu cầu cần đạt, số tiết tự điền. Gõ tay vẫn được.

**B. Chọn thứ cần xuất** (thay cho hàng 4 nút nhiều màu kiểu bản cũ)

- Một lưới ô tick có biểu tượng + chữ, mỗi ô ghi rõ ra file gì:
  - Giáo án 5512 (.docx) — đã có.
  - Slide bài giảng (.pptx) — đã có.
  - Sơ đồ tư duy (.png + .svg, và một slide trong bộ .pptx).
  - Đồ thị / biểu đồ (.png + .svg, và chèn vào slide; trong PowerPoint dùng biểu đồ gốc sửa được bằng `addChart` của pptxgenjs khi là dữ liệu bảng).
  - Phiếu học tập 2 tầng (.docx).
  - Bộ câu hỏi (Wayground .xlsx, Kahoot .xlsx, Quizlet) — đã có ở Phòng Quiz, nối sang đây.
  - Infographic một trang (.png, khổ A4 dọc).
  - Âm thanh tóm tắt bài 2–3 phút (.wav/.mp3) bằng giọng đọc Gemini.
  - Video bài giảng ngắn (thử nghiệm): ghép slide + giọng đọc thành video ngay trên trình duyệt.
  - Gói NotebookLM (nguồn + câu lệnh riêng cho Video Overview / Slide Deck / Infographic) — đã có ở Kho, nối sang đây.
- Một nút chính duy nhất: "Bé Bảng làm giúp". Các file làm lần lượt, mỗi file một dòng tiến độ, xong file nào tải được file đó, lỗi file nào thì chỉ file đó báo lỗi và có nút làm lại.
- Có ô gợi ý nhanh theo môn (Vật lý: "đồ thị dao động", "bảng số liệu thí nghiệm"; Toán: "đồ thị hàm số"…).

**C. Quy tắc cho từng loại**

- Đồ thị: Gemini chỉ trả về **mô tả có cấu trúc** (zod schema: loại đồ thị, công thức thuộc một họ cho phép như tuyến tính, bậc hai, sin/cos, mũ, hoặc bảng số liệu; tham số; tên trục; đơn vị; khoảng vẽ). **Số liệu và điểm vẽ do code tính**, không để AI tự bịa tọa độ. Không dùng `eval`. Kiểm tra đơn vị và khoảng vẽ hợp lý; sai thì báo thầy cô sửa tham số.
- Sơ đồ tư duy, đồ thị, infographic khi vào slide phải đi qua `src/lib/lesson/layout.ts` (thêm kiểu phần tử mới nếu cần) để bản xem trước và file .pptx giống nhau; thêm test không tràn khổ.
- Giọng đọc: chọn model TTS hiện hành trong `src/lib/ai/models.ts` (thêm vai `tts`, đọc từ biến môi trường, kiểm tra tên model trên ai.google.dev). Ước tính số token/chi phí và **DỪNG hỏi mình trước khi bật** âm thanh và video, vì hai loại này tốn hơn chữ.
- Video: làm trên trình duyệt (canvas + `MediaRecorder` hoặc WebCodecs), không chạy ffmpeg trên Vercel. Ghi rõ "thử nghiệm" trên giao diện; trình duyệt không hỗ trợ thì ẩn ô này.
- Việc lâu (âm thanh, video, cả bộ nhiều file) chạy như job của Giai đoạn 4 khi đã có; trước đó thì chạy ở trình duyệt, không chặn giao diện.
- Mọi file ghi tên theo mẫu `Lop11_VatLy_Bai11_Slide.pptx` (không dấu, không khoảng trắng).
- Không đưa tên thật, sức khỏe, tâm lý học sinh vào nội dung gửi sang NotebookLM hay vào file chia sẻ được.

Xong khi: với yêu cầu "đồ thị li độ theo thời gian của dao động điều hòa, A = 5 cm, T = 2 s" app xuất được .png, .svg và một slide có đồ thị đúng (có test tính điểm); tick 4 loại file thì nhận đủ 4 file, một file lỗi không làm hỏng ba file kia.

### [ ] Giai đoạn 3 — Supabase thật + đăng nhập Google

> Code, demo và PostgreSQL/RLS cục bộ đã kiểm tra ngày 21/10/2026. Chờ project Supabase + Google provider để kiểm tra OAuth, cookie và đồng bộ hai máy thật; chưa đánh dấu xong.

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

> Code, 88 test, demo và PostgreSQL cục bộ đã qua; chờ Supabase/Vercel thật để thử mất mạng và đóng tab. after() có giới hạn thời gian, chưa có worker tự phục hồi.

Vấn đề: `/api/lesson/generate` là một request kéo tới 3 phút; mạng chập chờn là mất.

- Bảng `jobs` (id, user_id, kind, status `cho|dang-chay|xong|loi`, progress 0–100, step, result jsonb, error, created_at) trong migration mới, có RLS.
- `POST /api/jobs/lesson`: tạo job, trả `jobId` ngay, phần soạn chạy sau khi trả lời. Đọc `node_modules/next/dist/docs/` về `after()` trong Next 16 và giới hạn thời gian trên Vercel trước khi chọn cách làm. `GET /api/jobs/[id]` trả trạng thái. Client hỏi lại mỗi 2–3 giây hoặc dùng Supabase Realtime.
- `LessonStudio.tsx`: thanh tiến độ theo `step` thật; đóng tab mở lại vẫn thấy job đang chạy hoặc kết quả.
- Không có Supabase: giữ đường cũ (gọi thẳng), không lỗi.
- Xuất PPTX/DOCX đang chạy trên trình duyệt (`ExportPanel.tsx`), giữ nguyên, chỉ thêm chỉ báo tiến độ nếu chưa có.

Xong khi: tắt mạng giữa chừng rồi bật lại, giáo án vẫn hiện khi job xong.

### [ ] Giai đoạn 5 — Phòng quiz trên điện thoại học sinh

> Tạm dừng: người dùng chưa có Supabase, chưa có Realtime để thử phòng thật.

**DỪNG nếu chưa có Supabase** (cần Realtime).

- Giáo viên bấm "Mở phòng" trong Phòng Quiz → tạo phòng mã 6 số + mã QR (dùng `qrcode.react`) dẫn tới `/choi/<ma>`.
- `/choi/<ma>`: học sinh không cần đăng nhập, chỉ nhập biệt danh. Trang này và `/api` của nó phải đi qua được cổng `SITE_PASSWORD` (học sinh không có mật khẩu): cho phép riêng đường `/choi/*` trong `src/proxy.ts`, giới hạn tốc độ gửi.
- Màn hình học sinh: 4 ô A-B-C-D màu `--quiz-a..d`, chữ to, bấm một lần. Màn hình chiếu của giáo viên (`QuizPlayer.tsx`): số em đã trả lời, biểu đồ đáp án, bảng xếp hạng.
- Supabase Realtime (broadcast/presence) cho câu hiện tại và đếm người; bảng `quiz_rooms`, `quiz_answers` có RLS phù hợp (giáo viên sở hữu phòng; học sinh chỉ ghi câu trả lời của mình). Không lưu tên thật hay thông tin cá nhân của học sinh; xóa phòng sau 24 giờ.

Xong khi: một máy tính chiếu + 3 tab điện thoại giả lập chơi trọn một bộ 5 câu, điểm đúng.

### [ ] Giai đoạn 6 — Đọc Gmail (chỉ đọc)

> Tạm hoãn theo xác nhận của người dùng; chưa xin quyền Gmail.

**DỪNG trước khi code**: hỏi mình đã làm bước 1–3 trong `docs/GMAIL.md` chưa. Đây là quyền "restricted", chưa xác minh thì tối đa 100 tài khoản thử.

- Làm theo bước 4–5 của `docs/GMAIL.md`. Nút "Kết nối Gmail" trong Hộp Thư, xin quyền riêng khi bấm (không xin lúc đăng nhập).
- Lấy thư 3 ngày gần nhất, gom nhiều thư vào một lần gọi `/api/mail/classify`. Cache kết quả theo hash nội dung để không phân loại lại.
- Ô "Dán tin" cho Zalo giữ nguyên.

Xong khi: có test cho phần ghép thư Gmail thành `RawMail[]` (dùng dữ liệu giả); không có quyền Gmail thì Hộp Thư vẫn như cũ.

### [ ] Giai đoạn 7 — Đối chiếu file nhập Wayground và Kahoot

> Tạm dừng: chưa có file mẫu chính thức trong docs/mau-nhap/. Đã nhắc nhóm cung cấp; chưa đoán hoặc sửa cột.

**DỪNG**: nhờ mình tải file mẫu chính thức của Wayground (Quizizz) và Kahoot, đặt vào `docs/mau-nhap/`. Không tự đoán cột.

- So cột, dòng tiêu đề, dòng bắt đầu dữ liệu, giới hạn thời gian và số đáp án với `src/lib/quiz/export.ts`. Sửa cho khớp.
- Thêm test đọc file mẫu và so tiêu đề với file mình xuất.

### [x] Giai đoạn 8 — Ảnh minh họa cho hướng dẫn

- Script Playwright (`scripts/chup-huong-dan.ts`) chạy app ở chế độ demo, chụp các bước trong `PlatformGuide.tsx` (phần của Lớp Mình) và `src/content/ky-nang-so.ts` vào `public/guides/` (WebP, rộng ≤ 1200px).
- Gắn ảnh vào từng bước, có `alt` tiếng Việt. Bước nằm trên trang của nền tảng khác (Wayground, Kahoot, Quizlet) thì không chụp, ghi rõ "chụp tay" trong CHANGELOG.

### [x] Giai đoạn 9 — Giao diện Sáng / Tối / Tự động theo giờ Việt Nam

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

### [x] Giai đoạn 10 — Rà soát trước khi cho thầy cô dùng thử

- Tìm chuỗi viết cứng "Thầy "/"Cô " kèm tên trong `src/` (trừ test và `honorific.ts`). Sửa qua `getHonorific()`.
- Tìm mã màu hex trong `src/components/`. Chuyển sang token.
- Vùng bấm < 44px, chữ < 18px ở nội dung chính, trang tràn ngang ở 390px. Sửa.
- Mọi input người dùng và output AI qua `nfc()`.
- Thông tin đường dây nóng trong `src/lib/ai/prompts.ts` (`SANCTUARY_RULES`): KHÔNG tự sửa số. Liệt kê các số/đường dây đang dùng trong báo cáo để mình kiểm tra với nguồn chính thức.
- Viết `docs/KIEM-TRA-TRUOC-PHAT-HANH.md`: danh sách điều đã kiểm tra, điều cần người kiểm tra tay.

---

### [ ] Giai đoạn 11 — Báo cáo cuối: tóm tắt, hạn chế, nâng cấp

Làm sau cùng, kể cả khi có giai đoạn còn dừng chờ mình.

- Viết `docs/BAO-CAO-V4.md` bằng tiếng Việt, câu ngắn, không văn mẫu, gồm ba phần:
  1. **Tóm tắt**: app làm được gì, theo từng trang (Hôm Nay, Soạn Bài, Xưởng học liệu, Phòng Quiz, Hộp Thư, Kho Dữ Liệu, Tâm Tình, Song Ngữ, Kỹ Năng Số, Hồ sơ); giai đoạn nào xong, giai đoạn nào còn dừng và đang chờ gì.
  2. **Hạn chế**: những gì chưa làm được hoặc làm được một phần, lỗi đã biết, chỗ phụ thuộc dịch vụ ngoài (Gemini, Supabase, Google, NotebookLM), chi phí ước tính mỗi tháng cho 10 / 100 giáo viên, rủi ro bảo mật và dữ liệu nhạy cảm, chỗ chưa được người thật kiểm tra (văn bản, mục lục SGK, số đường dây nóng, file nhập Kahoot/Wayground).
  3. **Nâng cấp**: đề xuất tiếp theo, xếp theo thứ tự nên làm, mỗi mục ghi lợi ích cho thầy cô, công sức ước tính (nhỏ / vừa / lớn), và điều kiện cần có.
- Kèm số liệu thật: số test, kết quả `npm run test` / `lint` / `build`, kích thước bundle trang lớn nhất, thời gian soạn một giáo án mẫu.
- Commit `docs(bao-cao): báo cáo V4 — tóm tắt, hạn chế, nâng cấp`, push, rồi in nội dung báo cáo ra màn hình cho mình đọc.

## Việc không giao cho Codex

Các việc này cần tài khoản của bạn: thu hồi khóa Gemini cũ; tạo project Supabase; bật Google OAuth và Gmail API trên Google Cloud; cài biến môi trường và Deployment Protection trên Vercel; tải file mẫu Wayground/Kahoot; tải bản PDF gốc các văn bản (5512, Thông tư 32/2018…) và nhập mục lục SGK Kết nối tri thức cho các môn còn lại.
