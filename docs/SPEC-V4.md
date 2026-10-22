# Lớp Mình V4 — Đặc tả chi tiết

Tài liệu này dùng được cho bất kỳ AI lập trình nào (Claude Code, Antigravity, Cursor, Gemini…). Đọc hết trước khi code. V4 là bản dựng mới hoàn toàn; code V3.5 trong `legacy-v3/` chỉ để tham khảo nội dung.

Mốc model Gemini ghi bên dưới là tại thời điểm viết (10/2026). Trước khi code, mở https://ai.google.dev/gemini-api/docs/models và https://ai.google.dev/gemini-api/docs/changelog để xác nhận tên model còn dùng được.

---

## 0. Người dùng và tinh thần sản phẩm

Giáo viên phổ thông Việt Nam, nhiều người 40–60 tuổi. Một người thường vừa chủ nhiệm 1 lớp vừa dạy bộ môn 3–6 lớp. Họ bận, mỏi mắt, sợ bấm nhầm, ghét bị AI nói giọng văn mẫu.

Ba câu kiểm tra cho mọi màn hình:
- Nhìn 3 giây có biết bấm vào đâu không?
- Có chỗ nào màu mè mà không mang thông tin không? (có thì bỏ)
- Bé Bảng nói câu này, một người trợ giảng thật có nói vậy không?

### Ba trụ cột (từ yêu cầu gốc) và cách xếp điều hướng

Web có ba trụ cột. Thanh điều hướng chia đúng ba nhóm này, mỗi nhóm có nhãn nhóm:

1. **Giám sát & Nhập liệu**
   - *Lớp Mình Hôm Nay* — tình hình lớp chủ nhiệm và lớp bộ môn trong ngày (mục 4).
   - *Hộp Thư Công Việc* — lọc email và tin dán từ Zalo (mục 8).
   - *Kho Dữ Liệu* — tài liệu giảng dạy, văn bản, kế hoạch tổ, sự kiện năm học, KPI, và hồ sơ học sinh (mục 7, 7b).
2. **Soạn Giảng Số**
   - *Soạn Bài* — giáo án 5512, slide, sơ đồ tư duy, phiếu học tập (mục 5).
   - *Phòng Quiz* — tạo quiz, mã QR, xuất sang Wayground/Quizlet/Kahoot (mục 6).
3. **Góc Thầy Cô** (học tập tự thân, không áp lực)
   - *Tâm Tình* — Góc Cởi Bỏ Chiếc Áo (mục 9).
   - *Song Ngữ* — tiếng Anh cho giáo viên không dạy ngoại ngữ (mục 9b).
   - *Kỹ Năng Số* — bài học 2 phút mỗi ngày (mục 9c).

Hồ sơ Thấu hiểu Bản thân (mục 10) mở từ avatar ở cuối thanh điều hướng. Trên điện thoại, thanh dưới chỉ có 3 nút trụ cột + nút Bé Bảng ở giữa; bấm trụ cột mới hiện các mục con.

---

## 1. Design System — để theme không lộn xộn

### 1.1 Màu (token duy nhất được phép dùng)

| Token | Giá trị gợi ý | Dùng cho |
|---|---|---|
| `--bg` | `#FAF7F0` (kem) | nền trang |
| `--surface` | `#FFFFFF` | thẻ, khung |
| `--surface-muted` | `#F2EEE4` | nền phụ, vùng nhóm |
| `--ink` | `#1F2A24` | chữ chính |
| `--ink-muted` | `#5B665F` | chữ phụ (vẫn đạt AA trên nền kem) |
| `--primary` | `#1E3A2F` (xanh bảng đen) | nút chính, thanh điều hướng |
| `--primary-fg` | `#FFFFFF` | chữ trên nút chính |
| `--accent` | `#E8B04A` (vàng phấn) | điểm nhấn hiếm hoi: badge mới, tiến độ |
| `--border` | `#E3DDD0` | viền |
| `--urgent` | `#B42318` | chỉ cho nhãn KHẨN |
| `--homeroom` | `#B7791F` | chỉ cho nhãn Chủ nhiệm |
| `--subject` | `#2B6CB0` | chỉ cho nhãn Bộ môn |
| `--success` | `#2F7D4F` | trạng thái xong |

Quy tắc: một màn hình chỉ có một màu `--primary` cho hành động chính. Ba màu nhãn (urgent/homeroom/subject) chỉ xuất hiện trên nhãn và viền trái của thẻ tin, không tô nền cả khối. Có dark mode nhưng làm sau cùng, dùng cùng tên token.

### 1.2 Chữ
- Be Vietnam Pro qua `next/font/google`, các weight 400/500/600/700.
- Cỡ nền 18px. Thang: 14 (ghi chú) / 16 / 18 (thân) / 22 / 28 / 36.
- Có nút "Aa" trên header cho thầy cô tự tăng cỡ chữ 3 mức (lưu vào hồ sơ).
- Chuẩn hóa NFC cho mọi chuỗi.

### 1.3 Bố cục
- Lưới 12 cột, nội dung tối đa 1200px, khoảng cách theo bội số 4px (4/8/12/16/24/32/48).
- Bo góc: 12px cho thẻ, 999px cho chip/nhãn. Đổ bóng rất nhẹ, một mức duy nhất.
- Điều hướng: thanh bên trái (desktop) / thanh dưới (mobile), chia theo 3 trụ cột ở mục 0, icon + chữ, không chỉ icon.
- Mỗi thẻ: tiêu đề, nội dung, tối đa 1 nút chính + 1 nút phụ dạng chữ. Hành động hiếm dùng đưa vào menu "…".
- Trạng thái rỗng, đang tải, lỗi phải có thiết kế riêng, lời nhắn bằng giọng Bé Bảng.
- Animation: chỉ dùng để chỉ hướng (trượt panel, hiện toast). Tôn trọng `prefers-reduced-motion`.

### 1.4 Thư viện giao diện
shadcn/ui (Radix) làm nền component; lucide-react cho icon; `motion` (framer-motion) cho chuyển động; sonner cho toast; vaul cho drawer trên mobile; cmdk cho ô lệnh nhanh (Ctrl+K: "soạn bài", "xem lớp 11A2"…).

Trước khi code React, dựng `design/_tokens.css` và `design/00-styleguide.html` (một trang HTML tĩnh hiển thị toàn bộ màu, chữ, nút, thẻ, nhãn, ô nhập) để cả nhóm nhìn chung một chuẩn.

---

## 2. Kiến trúc và thư viện

| Nhu cầu | Chọn | Ghi chú |
|---|---|---|
| Khung app | Next.js App Router, TypeScript strict | Server Actions + Route Handlers |
| Dữ liệu, đăng nhập | Supabase (`@supabase/ssr`) | Google OAuth, RLS mọi bảng |
| Gọi AI | `@google/genai` | gom vào `lib/ai/` |
| Form, kiểm tra dữ liệu | react-hook-form + zod | zod cũng dùng để ép output JSON của Gemini |
| Fetch/cache phía client | @tanstack/react-query | invalidate theo `profileId` |
| State nhẹ | zustand | không dùng cho dữ liệu server |
| Soạn thảo giáo án trên web | Tiptap | sửa trực tiếp trước khi xuất |
| Word | `docx` | mẫu 5512 |
| PowerPoint | `pptxgenjs` | xem mục 5 |
| Ảnh xem trước slide | LibreOffice headless (`soffice --convert-to pdf`) + `pdftoppm` trong worker | để AI tự kiểm tra slide |
| Sơ đồ tư duy | markmap-lib + markmap-view, xuất qua html-to-image | |
| Công thức | KaTeX + react-markdown + remark-math/rehype-katex | |
| QR | `qrcode` (server) / `qrcode.react` (client) | |
| Excel quiz | `exceljs` | |
| Biểu đồ | recharts | |
| Tour hướng dẫn | driver.js | xem mục 11 |
| Tìm kiếm không dấu | fuse.js + hàm bỏ dấu riêng | |
| Job chạy nền | bảng `jobs` trên Supabase + worker (Route Handler gọi lặp hoặc Inngest/Trigger.dev nếu deploy cho phép) | có % tiến độ, hủy được |
| Test | vitest + @testing-library/react; Playwright cho 3–5 luồng chính | |

Model Gemini (gom trong `lib/ai/models.ts`, đọc từ env):
- `MODEL_FAST` — phân loại, bóc tách JSON, lọc email: dòng Flash-Lite mới nhất (hiện là `gemini-3.5-flash-lite`).
- `MODEL_DEFAULT` — chat, Co-Pilot, tâm tình: Flash mới nhất (hiện là `gemini-3.8-flash`).
- `MODEL_HEAVY` — lập dàn ý giáo án, slide nhiều bước: model mạnh nhất có trong gói (hiện có `gemini-4-argon`; nếu gói free không dùng được thì rơi về `MODEL_DEFAULT`).
- `MODEL_LIVE` — trò chuyện giọng nói thời gian thực: dòng Live (hiện là `gemini-3.8-live`).
- `MODEL_TTS` — đọc tiếng Việt tự nhiên: dòng TTS (hiện là `gemini-3.8-flash-tts`), giữ Web Speech API làm phương án dự phòng.

Mọi lời gọi có: timeout, retry có backoff khi gặp 429/503, log thời gian phản hồi (không log nội dung nhạy cảm), và structured output bằng JSON schema khi cần dữ liệu có cấu trúc.

---

## 3. Xưng hô Thầy/Cô — sửa lỗi nhầm khi đổi tài khoản

### Lỗi hiện tại
Đang ở hồ sơ "Cô Hoa", chuyển sang một hồ sơ thầy thì Bé Bảng gọi "Thầy Hoa". Nguyên nhân khả dĩ (phải kiểm tra trong code): tên và danh xưng được lưu ở hai nơi khác nhau và chỉ một nơi cập nhật; lịch sử chat cũ vẫn được gửi lên Gemini nên model bắt chước cách gọi cũ; hoặc system prompt được cache theo phiên chứ không theo hồ sơ.

### Cách làm đúng
1. Bảng `profiles` có `gender` (`'nam' | 'nu'`), `display_name` (tên gọi, ví dụ "Mai Hoa"), và tùy chọn `honorific_override` (cho người muốn được gọi khác, ví dụ "Cô giáo").
2. Một hàm duy nhất:
   ```ts
   // lib/persona/honorific.ts
   export function getHonorific(p: Pick<Profile,'gender'|'honorific_override'>): 'Thầy'|'Cô'|string
   export function addressOf(p: Profile): string // "Cô Mai Hoa"
   ```
3. System prompt của Bé Bảng được dựng mỗi request từ hồ sơ hiện tại, có dòng bắt buộc: `Người dùng là ${addressOf(p)}. Luôn gọi đúng "${addressOf(p)}". Không bao giờ dùng danh xưng khác.`
4. Khi đổi tài khoản hoặc đổi hồ sơ mẫu: xóa lịch sử chat trong bộ nhớ, `queryClient.clear()` hoặc invalidate theo key có `profileId`, remount cây component bằng `key={profileId}`.
5. Lớp bảo vệ sau cùng: hàm `fixAddress(text, profile)` chạy trên output của model, thay các cụm "Thầy <tên>"/"Cô <tên>" sai giới về đúng danh xưng (chỉ khi tên trùng với tên người dùng, không đụng tên học sinh hay người khác).
6. Trang Hồ sơ cho chọn giới tính rõ ràng ngay lần đăng nhập đầu tiên (màn hình chào: "Bé Bảng nên gọi mình là Thầy hay Cô ạ?").
7. Test bắt buộc: chuyển Cô Hoa → Thầy Tiến → Cô Phương liên tục 10 lần, kiểm tra header, lời chào, banner 18:00, câu trả lời chat, nội dung tour, file xuất; không chỗ nào sai danh xưng.

---

## 4. Tab "Lớp Mình Hôm Nay" — thêm nhập tay

Giữ nhập giọng nói, thêm ô nhập tay ngang hàng (không giấu đi):
- Một ô văn bản lớn: "Gõ nhanh tình hình lớp, ví dụ: An nghỉ ốm đến thứ 6; Tâm cần giảng lại căn bậc hai".
- Gõ nhiều dòng được, mỗi dòng có thể là một học sinh. Bấm "Ghi lại" (hoặc Ctrl+Enter).
- Gemini (`MODEL_FAST`) bóc tách thành các thẻ theo dõi, nhưng trước khi lưu hiện bảng xác nhận: tên học sinh (gợi ý từ danh sách lớp, khớp mờ không dấu), loại (chuyên cần / sức khỏe / tâm lý / học tập / khen thưởng), thời hạn, ghi chú. Thầy cô sửa được từng ô rồi mới bấm "Lưu".
- Có thêm form nhập có cấu trúc cho ai thích bấm chọn: chọn học sinh → chọn loại → chọn mẫu câu.
- Giọng nói và nhập tay đi chung một luồng xử lý (`parseClassNotes(text, classId)`), chỉ khác nguồn văn bản.
- Đồng bộ chéo GVCN → GVBM giữ như cũ (Supabase Realtime), toast qua sonner.

---

## 5. Soạn bài & xuất file — chậm cũng được, nhưng phải đẹp và đúng

Mục tiêu: file PowerPoint không còn là slide toàn chữ. Thầy cô sẵn sàng chờ 1–3 phút nếu kết quả dùng được ngay trên lớp.

### 5.1 Luồng
1. **Nhập yêu cầu**: chủ đề/bài, lớp, số tiết, mong muốn tự do (gõ hoặc nói), tài liệu nguồn (chọn từ Kho tri thức, mục 7), 3 câu chẩn đoán ngữ cảnh như cũ.
2. **Dàn ý** (`MODEL_HEAVY`): trả về JSON gồm mục tiêu, 4 hoạt động 5512, danh sách slide dự kiến. Hiện cho thầy cô duyệt/sửa/kéo thả thứ tự trước khi làm tiếp. Bước này nhanh.
3. **Tạo nội dung từng slide** (job nền): mỗi slide là một object có `layout`, `title`, `body`, `notes` (lời giảng cho giáo viên), `visual` (mô tả hình cần), `quiz?`.
4. **Hình ảnh**: với mỗi `visual`, lần lượt thử: sơ đồ/biểu đồ tự vẽ (SVG → PNG) nếu là kiến thức có cấu trúc; ảnh từ kho ảnh miễn phí có API (Pexels/Unsplash, ghi nguồn trong notes); hoặc model sinh ảnh của Gemini nếu gói cho phép. Không chèn ảnh có chữ sai chính tả.
5. **Dựng PPTX** bằng pptxgenjs theo bộ layout cố định (mục 5.2).
6. **Tự kiểm tra**: worker chuyển PPTX → PNG (LibreOffice + pdftoppm), gửi ảnh từng slide cho Gemini (vision) chấm theo checklist: chữ tràn khung, chữ quá nhỏ (<20pt), quá 6 dòng, ảnh vỡ, tương phản kém, sai chính tả tiếng Việt. Slide lỗi thì sửa và dựng lại, tối đa 2 vòng.
7. **Xem trước trên web**: hiện ảnh các slide. Mỗi slide có nút "Làm lại slide này" kèm ô "Muốn thêm gì?" (ví dụ "thêm ví dụ đời sống", "đổi sang dạng so sánh"). Có nút "Làm lại cả bộ với yêu cầu thêm".
8. **Tải về**: PPTX, DOCX 5512, PDF, mindmap PNG/SVG, gói quiz (mục 6). Lưu bản vào Supabase Storage, có lịch sử phiên bản.

### 5.2 Bộ layout slide (tối thiểu 10)
Bìa; Mục tiêu bài học; Khởi động (câu hỏi lớn + hình); Nội dung hai cột chữ–hình; Sơ đồ quy trình/timeline; So sánh hai bên; Con số lớn/định nghĩa nổi bật; Công thức (KaTeX render ra ảnh); Hoạt động nhóm (nhiệm vụ + thời gian + sản phẩm); Trắc nghiệm 4 màu A-B-C-D; Mã QR vào phòng quiz; Tổng kết/sơ đồ tư duy; Dặn dò.
Mỗi layout là một hàm `renderX(slide, theme)` riêng, có ảnh chụp mẫu trong `design/slides/`. Theme slide lấy từ token màu ở mục 1, có 3 biến thể (Bảng xanh, Giấy kem, Tươi sáng cho tiểu học).

Luật nội dung slide: tối đa 6 dòng, tối đa ~40 chữ phần thân, chữ thân ≥ 24pt, mỗi slide nội dung phải có một yếu tố hình (ảnh, sơ đồ, icon lớn, biểu đồ), lời giảng chi tiết đưa vào notes.

### 5.3 Word 5512
Giữ chuẩn hiện có (Times New Roman 13–14pt, lề hành chính, bảng 4 hoạt động × 4 bước), thêm: phần phân hóa theo lớp và theo học sinh cụ thể lấy từ dữ liệu Tab 1, phụ lục phiếu học tập, đáp án.

### 5.3b Phân hóa hai tầng và gợi ý hình ảnh
- Mỗi giáo án luôn có **hai tầng nhiệm vụ** trong hoạt động Luyện tập và Vận dụng: tầng Cơ bản và tầng Nâng cao. Học sinh được xếp tầng dựa trên dữ liệu thật trong Kho Dữ Liệu và ghi chú Tab 1 (ví dụ Tâm cần củng cố căn bậc hai → Cơ bản + phiếu ôn; Bình tiến bộ → Nâng cao). Thầy cô kéo thả để đổi tầng trước khi xuất.
- Mỗi slide có thêm ô "Gợi ý tạo hình" — một câu lệnh chi tiết, có thể dán vào Canva Magic Media, Google Slides "Help me visualize" hoặc model sinh ảnh, để thầy cô tự tạo hình nếu muốn. Lưu lịch sử gợi ý theo bài để các ngày sau không lặp lại hình cũ.

### 5.4 Công cụ ngoài (tùy chọn, làm sau)
Viết lớp adapter `ExportProvider` để sau này cắm thêm: Google Slides API (tạo thẳng trong Drive của thầy cô), hoặc dịch vụ tạo slide khác có API chính thức. Không dùng thư viện không chính thức đăng nhập hộ bằng cookie.

---

## 6. Quiz và mã QR

Vì Wayground (tên mới của Quizizz) và Quizlet không có API công khai để tạo quiz tự động, làm theo ba tầng:

1. **Phòng quiz riêng của Lớp Mình (tự động 100%)**: AI sinh câu hỏi từ bài giảng → tạo phòng → hiện mã QR + mã 6 số trên slide. Học sinh quét QR, nhập tên, trả lời trên điện thoại; giáo viên xem bảng xếp hạng trực tiếp (Supabase Realtime). Không cần học sinh đăng nhập. Kết quả lưu vào lớp, tự cập nhật "học sinh cần cải thiện" ở Tab 1.
2. **File nhập sẵn cho nền tảng quen thuộc**: xuất file đúng mẫu nhập câu hỏi của Wayground (Excel), Kahoot (Excel), Quizlet (văn bản thuật ngữ–định nghĩa để dán vào ô Import). Trước khi code, tải mẫu chính thức hiện hành của từng nền tảng để khớp cột, không đoán.
3. **Google Forms dạng bài kiểm tra** qua Google Forms API (tạo trong Drive của thầy cô, có chấm điểm tự động) — cần xin thêm quyền OAuth, làm sau cùng.

**Hướng dẫn từng bước cho thầy cô**: với mỗi nền tảng ở tầng 2, sinh kèm một trang hướng dẫn (HTML trong app + bản PDF tải về) chữ to, mỗi bước một ảnh chụp màn hình có khoanh đỏ chỗ bấm, đánh số 1-2-3. Ảnh chụp do nhóm tự chụp, lưu ở `public/guides/`. Cuối hướng dẫn là bước "dán link quiz vào đây" để Lớp Mình tự tạo QR cho link đó.

---

## 7. Kho tri thức (thay cho "đẩy dữ liệu lên NotebookLM")

Thực tế: NotebookLM bản thường không có API công khai; chỉ NotebookLM Enterprise (trên Google Cloud) có API tạo notebook và thêm nguồn. Vì vậy:

1. **Lõi tự làm**: mỗi giáo viên có một kho tài liệu riêng (SGK, phân phối chương trình, giáo án cũ, đề kiểm tra, ghi chú). Tải lên Supabase Storage, đồng thời đưa vào Gemini File Search (mỗi giáo viên một `fileSearchStore`) để tìm kiếm có trích dẫn. Khi soạn bài, AI dựa vào kho này và ghi rõ đoạn nào lấy từ tài liệu nào.
2. **Cá nhân hóa giáo án**: kết hợp kho tri thức + phong cách giảng dạy trong Hồ sơ (mục 10) + tình hình lớp (Tab 1) để soạn giáo án riêng cho từng lớp.
3. **Cầu nối NotebookLM**: nút "Mở trong NotebookLM" xuất một gói gồm các tài liệu đã chọn + một file hướng dẫn và các câu lệnh mẫu để thầy cô tự tạo notebook (podcast, flashcard, video tóm tắt). Có hướng dẫn từng bước bằng hình như mục 6.
4. **Adapter NotebookLM Enterprise** (để sẵn, tắt mặc định qua feature flag): nếu trường có Google Cloud và giấy phép, tạo notebook và thêm nguồn tự động qua API chính thức.

Loại tài liệu trong Kho Dữ Liệu (mỗi loại một nhãn, AI dùng khác nhau):
- *Sách & chương trình*: SGK (bộ sách đang dùng), phân phối chương trình, giáo án cũ.
- *Văn bản chỉ đạo*: công văn, thông tư chuyên ngành (5512, 2345…). AI chỉ trích dẫn, không tự bịa số hiệu văn bản.
- *Kế hoạch*: kế hoạch tổ chuyên môn, kế hoạch năm học, lịch sự kiện của trường. Sự kiện có ngày được đổ vào lịch và Thời khóa biểu.
- *Chỉ tiêu*: KPI thi đua của năm, hiện ở Hồ sơ (mục 10).

## 7b. Hồ sơ học sinh

- Nhập danh sách lớp bằng file Excel/CSV (có file mẫu tải về), dán từ bảng tính, hoặc chụp ảnh danh sách (Gemini đọc ảnh, thầy cô duyệt lại).
- Mỗi học sinh có: thông tin cơ bản, năng lực từng môn (theo điểm và nhận xét), tính cách/cách học (do thầy cô ghi, dạng chip: "hướng nội", "thích vận động", "cần khích lệ"…), dòng thời gian ghi chú.
- Dữ liệu thay đổi theo thời gian thực từ Tab 1, kết quả quiz, điểm nhập vào. AI dùng dữ liệu này để xếp tầng phân hóa (5.3b) và đề xuất cách hỗ trợ từng em.
- Dữ liệu học sinh là dữ liệu trẻ vị thành niên: chỉ giáo viên của lớp thấy, GVBM chỉ thấy phần học tập, không thấy phần tâm lý/gia đình do GVCN ghi trừ khi GVCN bật chia sẻ.

---

## 8. Bộ lọc Email công việc (thay Bộ lọc Zalo)

- Kết nối Gmail qua OAuth riêng (nút "Kết nối hộp thư", không gộp vào bước đăng nhập), quyền chỉ đọc. Chỉ quét thư trong N ngày gần nhất.
- Lưu ý pháp lý/kỹ thuật: quyền đọc Gmail thuộc nhóm hạn chế của Google; khi chưa được Google xác minh thì chỉ dùng được với tối đa 100 tài khoản thử nghiệm khai báo trước. Ghi rõ trong README.
- Gemini (`MODEL_FAST`) phân loại mỗi thư: BGH/KHẨN, Chủ nhiệm (lớp nào), Bộ môn (lớp nào), Phụ huynh, Hành chính, Quảng cáo/không liên quan. Trích ra: hạn chót, việc cần làm, người gửi.
- Màn hình: dòng thời gian gộp như cũ, ba nhãn màu, bản tin tóm tắt đầu trang, tìm kiếm không dấu. Hạn chót tự đổ vào lịch/nhắc việc.
- Không xóa, không trả lời, không đánh dấu gì trên hộp thư thật trừ khi thầy cô bấm. Có nút "Soạn trả lời" để AI viết nháp, thầy cô duyệt rồi mới gửi.
- Giữ ô "Dán tin nhắn Zalo" cho tin Zalo (Zalo không cho đọc tin nhắn cá nhân qua API), chung một bộ phân loại. Sau này có thể thêm Outlook qua Microsoft Graph.

---

## 9. Góc Cởi Bỏ Chiếc Áo — tâm tình nhanh và có hồn

### Tốc độ
- Trả lời dạng stream (chữ hiện dần ngay từ token đầu), dùng `MODEL_DEFAULT`, mức suy nghĩ thấp cho chat thường.
- Mục tiêu: chữ đầu tiên hiện dưới 1,5 giây.
- Có chế độ nói chuyện bằng giọng qua `MODEL_LIVE` (nói và nghe liên tục, ngắt lời được).

### Tính cách
Bé Bảng ở đây như một người em/người bạn đồng nghiệp tinh ý, không phải chuyên gia giảng bài:
- Câu ngắn, tự nhiên, có cảm xúc thật ("Nghe mà thương Cô quá", "Ôi, vụ đó mệt thật"). Không mở đầu bằng "Tôi hiểu cảm giác của bạn". Không liệt kê gạch đầu dòng lời khuyên.
- Hỏi lại một câu cụ thể thay vì khuyên ngay. Phản chiếu đúng chi tiết thầy cô vừa kể.
- Kiến thức tâm lý (lắng nghe thấu cảm, các giai đoạn đời người…) dùng ngầm trong cách hỏi và cách phản hồi; không trích tên học giả trừ khi thầy cô hỏi.
- Nhớ những gì thầy cô đã chia sẻ trong các lần trước (tóm tắt lưu theo tài khoản, thầy cô xem và xóa được), nhắc lại khi phù hợp, không nhắc chuyện nhạy cảm khi thầy cô không mở lời.
- Thầy cô hỏi thẳng "em là người hay máy" thì trả lời thật là trợ lý AI, rồi tiếp tục trò chuyện bình thường.

### An toàn
- Nếu có dấu hiệu khủng hoảng hoặc ý nghĩ làm hại bản thân: dừng mọi giọng đùa, nói chuyện nghiêm túc và ấm áp, đưa thông tin hỗ trợ tại Việt Nam (đường dây nóng sức khỏe tâm thần, cấp cứu 115). Kiểm tra lại số điện thoại đường dây hỗ trợ trước khi phát hành.
- Không chẩn đoán bệnh, không thay thế bác sĩ.

### Mẫu system prompt (rút gọn)
```
Bạn là Bé Bảng, trợ lý của ${addressOf(p)}. Ở Góc Cởi Bỏ Chiếc Áo, bạn là người bạn nhỏ tuổi hơn, tinh ý, nói chuyện như người Việt thật ngoài đời.
- Gọi đúng "${addressOf(p)}", xưng "em" hoặc "Bé Bảng".
- Câu ngắn. Mỗi lượt tối đa 3–4 câu trừ khi được hỏi kỹ.
- Phản hồi cảm xúc trước, hỏi một câu cụ thể sau. Không liệt kê, không văn mẫu.
- Bối cảnh hôm nay: ${todayContext}  (tiết đã dạy, mức tải tâm lý thầy cô vừa chọn)
- Điều đã biết về ${addressOf(p)}: ${memorySummary}
```

Minigame theo sở thích, banner 18:00, cơ chế khen theo hành động thật: giữ như V3.5.

Sau phần lắng nghe, nếu thầy cô muốn, Bé Bảng đưa ra biện pháp cho cả hai phía: việc thầy cô có thể làm cho bản thân, và việc có thể làm với học sinh/phụ huynh liên quan (lấy dữ liệu từ hồ sơ học sinh ở mục 7b). Hỏi "Cô có muốn em gợi ý vài cách không?" trước khi gợi ý.

## 9b. Song Ngữ — tiếng Anh cho giáo viên không dạy ngoại ngữ

Dành cho thầy cô Toán, Lý, Hóa, Sinh, Sử, Địa đang phải dạy song ngữ mức cơ bản.
- **Bài nhỏ 5 phút theo môn**: 5–8 thuật ngữ của bài sắp dạy (lấy từ giáo án vừa soạn), mỗi từ có phiên âm, nghe phát âm, câu ví dụ trong lớp.
- **Khẩu lệnh lớp học**: bộ câu ngắn ("Open your books to page 20", "Work in pairs") theo tình huống, nghe mẫu và luyện nói; Gemini chấm phát âm nhẹ nhàng, chỉ khen và chỉ ra một điểm sửa mỗi lần.
- **Gắn vào giáo án**: khi bật "Tích hợp khẩu lệnh song ngữ" ở bước chẩn đoán (mục 5), slide tự có câu khẩu lệnh tiếng Anh nhỏ ở góc, kèm thuật ngữ song ngữ.
- Không bảng xếp hạng, không điểm số công khai. Có chuỗi ngày học (streak) nhưng không trách khi mất chuỗi.

## 9c. Kỹ Năng Số — bài học 2 phút mỗi ngày

- Mỗi ngày gợi ý một bài: chèn video vào PowerPoint, quét mã QR, chia sẻ Google Drive, tạo Google Form, dùng Zalo trên máy tính, sao lưu điện thoại…
- Mỗi bài: tối đa 5 bước, mỗi bước một ảnh chụp màn hình khoanh đỏ chỗ bấm, chữ to, có nút đọc to. Có nút "Thử ngay" mở đúng công cụ.
- Ưu tiên bài liên quan việc thầy cô vừa gặp (vừa xuất file PPT → gợi ý "chiếu slide toàn màn hình").
- Nội dung bài lưu trong `content/ky-nang-so/*.md` để nhóm tự thêm bài không cần sửa code.

---

## 10. Hồ sơ Thấu hiểu Bản thân — đẹp và có "chất" riêng

Trang này là "căn phòng" của thầy cô, không phải form điền thông tin.

- **Ảnh bìa + avatar**: chọn ảnh bìa từ bộ ảnh nhẹ nhàng (bảng phấn, sân trường, kệ sách, cây xanh) hoặc tải lên. Avatar tròn lớn, tên, danh xưng, trường, tổ, thâm niên ("24 năm đứng lớp").
- **Thẻ "Phong cách của Cô"**: AI tóm tắt phong cách giảng dạy thành một câu và 3 chip (ví dụ "Bao dung", "Chậm mà chắc", "Dạy bằng hình ảnh"). Phong cách này ảnh hưởng thật đến giáo án được soạn (mục 5, 7) — ghi rõ "Bé Bảng sẽ soạn bài theo phong cách này".
- **Màu chủ đạo cá nhân**: chọn 1 trong 5 accent hài hòa với theme (không cho chọn màu tự do để tránh rối), áp dụng cho avatar ring, tiến độ, chip.
- **KPI năm học**: vòng tiến độ tròn cho từng chỉ tiêu, bấm vào xem chi tiết học sinh còn thiếu.
- **Hôm nay Cô thấy thế nào?**: 4 thẻ trạng thái (Thư thái / Ổn định / Căng thẳng / Quá tải) với minh họa nhỏ, chọn một chạm; lịch sử 30 ngày dạng dải màu nhỏ.
- **Sở thích & điều Bé Bảng nên biết**: chip sở thích; mục sức khỏe ở phần riêng tư, mặc định ẩn, có ghi chú "chỉ Cô thấy".
- **Dấu mốc**: dòng thời gian nhỏ những việc đã làm cùng Bé Bảng (giáo án đã soạn, quiz đã tổ chức).
- Có bản mẫu `design/06-ho-so.html` để nhóm chỉnh giao diện trước khi dựng React.

---

## 11. Tour hướng dẫn chi tiết

- driver.js, một tour cho mỗi tab và một tour tổng quan khi đăng nhập lần đầu.
- Mỗi bước: làm mờ xung quanh, khoanh chỗ cần bấm, lời Bé Bảng 1–2 câu, có nút "Đọc to" (TTS tiếng Việt), "Tiếp", "Quay lại", "Để sau".
- Một số bước yêu cầu thầy cô bấm thật (ví dụ "Cô thử bấm vào đây nhé") rồi mới đi tiếp.
- Nút "?" cố định góc màn hình để mở lại tour của trang đang xem. Lưu tiến độ tour theo tài khoản.
- Nội dung tour viết trong một file cấu hình (`lib/tours/*.ts`), dùng `addressOf()` cho danh xưng.

---

## 12. Thời khóa biểu & đồng hồ
Giữ SmartTimetableBar như V3.5 (GMT+7, tua tiết, chế độ Ở nhà). Thêm: thầy cô tự nhập/nhập từ ảnh chụp TKB (Gemini đọc ảnh → bảng để duyệt).

---

## 13. Dữ liệu (gợi ý bảng)

`profiles` (gender, display_name, honorific_override, school, team, years, teaching_style, accent, font_scale) · `classes` (role: homeroom|subject) · `students` · `student_notes` (source: voice|text|form|sync) · `timetable` · `lesson_plans` + `lesson_versions` · `exports` · `jobs` (type, status, progress, error) · `quiz_rooms` + `quiz_answers` · `knowledge_docs` · `mail_items` · `chat_memory` · `wellbeing_log` · `tour_progress`.
Mọi bảng có `user_id` và chính sách RLS; bảng quiz cho phép học sinh ẩn danh ghi câu trả lời vào đúng phòng đang mở, không đọc được phòng khác.

---

## 14. Thứ tự làm và tiêu chí xong

Làm theo thứ tự, mỗi mục xong thì commit + push lên `v4-nang-cap`:

1. Dọn nền: bỏ key thật khỏi code, `.env.example`, chuyển sang `@google/genai`, `lib/ai/models.ts`, Design System + `design/00-styleguide.html`.
2. Sửa xưng hô (mục 3) + test.
3. Nhập tay ở Tab 1 (mục 4).
4. Job nền + pipeline xuất file mới (mục 5).
5. Quiz & QR + hướng dẫn (mục 6).
6. Kho tri thức (mục 7).
7. Bộ lọc Email (mục 8).
8. Góc tâm tình mới (mục 9).
9. Hồ sơ mới (mục 10).
10. Tour (mục 11).
11. Kiểm tra trợ năng (axe), dark mode, hiệu năng.

Một mục chỉ được coi là xong khi: build và lint qua; có test cho logic chính; tự chạy thử trên trình duyệt (nếu có công cụ) ở khổ desktop và điện thoại; ghi vào `docs/CHANGELOG-V4.md`; có ảnh chụp hoặc mô tả ngắn để nhóm kiểm tra.

Song Ngữ (9b) và Kỹ Năng Số (9c) làm sau mục 8 trong danh sách trên.

---

## 15. Tiết kiệm token khi gọi Gemini (chi phí chạy app)

Gói free của Gemini có giới hạn số yêu cầu mỗi phút/ngày, nên tiết kiệm token cũng là để app không bị chặn giữa giờ dạy.

1. **Đặt phần cố định lên đầu prompt.** Gemini tự cache phần đầu giống nhau giữa các lần gọi (implicit caching) và tính rẻ hơn cho phần đó. Thứ tự prompt luôn là: luật Bé Bảng (cố định) → hồ sơ giáo viên (ít đổi) → dữ liệu lớp → câu hỏi (đổi mỗi lần). Với tài liệu dài dùng lặp lại (SGK một chương), dùng explicit context caching.
2. **Chọn model theo việc**: phân loại email, bóc tách ghi chú dùng `MODEL_FAST`; chỉ bước dàn ý giáo án dùng `MODEL_HEAVY`.
3. **Không gửi cả lịch sử chat.** Giữ 6–8 lượt gần nhất + một bản tóm tắt các lượt cũ (cập nhật mỗi 10 lượt bằng `MODEL_FAST`).
4. **Không gửi cả kho tài liệu.** Dùng File Search để chỉ lấy đoạn liên quan.
5. **Structured output** (JSON schema) thay vì bảo model "trả lời dạng JSON" rồi gọi lại khi lỗi.
6. **Cache kết quả**: cùng một ghi chú/email đã phân loại thì không gọi lại (lưu theo hash nội dung). Giáo án đã sinh thì chỉ sinh lại phần thầy cô yêu cầu sửa.
7. **Batch API** cho việc không gấp (phân loại hộp thư buổi tối, tạo bài Song Ngữ cho tuần sau) — rẻ hơn gọi thường.
8. Ghi số token mỗi lần gọi vào bảng `ai_usage` (không ghi nội dung) để xem tính năng nào tốn nhất.
