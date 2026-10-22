# Nhật ký thay đổi V4

## Tiếp quản Codex — Giai đoạn 10 (21/10/2026)

- Rà xưng hô, màu và log: chuyển màu linh vật về token, bỏ log lỗi thô SDK ở các API và xuất file. Không đổi thông tin 115/Ngày Mai trong prompt.
- NFC cho JSON đầu vào, dữ liệu lưu, prompt/kết quả AI và ô nhập văn bản còn sót. Ghi chú dùng generateJson chung; giới hạn ngân sách retry theo timeout route. Thêm test Unicode và log riêng tư.
- Sửa nút tự gõ quiz cao 27px. Playwright 11 trang × 1280/390px: không tràn/lỗi JavaScript, vùng bấm hiện diện phần chính >=44px. 96/96 test, lint, build qua; checklist ghi rõ chưa bao phủ mọi dialog/thiết bị.
- Website Vercel / và /tam-tinh hiện HTTP 200, không tái hiện 404 cũ. Ghim Next.js, npm ci/build và .next trong vercel.json để tránh nhầm preset/output. Chưa có quyền dashboard để đối chiếu commit production; hướng dẫn kiểm tra trong DEPLOY.
- Npm audit 9 mục (7 cao, 2 vừa), liên quan dependency lint, image-size/pptxgenjs, uuid/exceljs. Chưa chạy force/downgrade tự động. Checklist docs/KIEM-TRA-TRUOC-PHAT-HANH.md ghi hạng mục cần xử lý và kiểm tra tay.

## Tiếp quản Codex — Giai đoạn 9 (21/10/2026)

- Sáng/Tối/Tự động ở nút Màu cạnh Aa và trong Hồ sơ. Mặc định Tự động, dùng Asia/Ho_Chi_Minh: sáng 06:00–17:59, tối 18:00–05:59; đang mở tự đổi qua mốc giờ. Hằng số tập trung ở lib/theme.ts.
- Script head áp dụng trước khi body vẽ, try/catch khi localStorage bị chặn. Lựa chọn trong lm:theme và trường theme của hồ sơ app_state để đồng bộ tài khoản; bản cache màu riêng trên máy phục vụ lần mở sau. Chưa thử đồng bộ Supabase thật.
- Thêm token tối, chuyển màu 150 ms, tôn trọng reduced-motion; đồng bộ HTML styleguide. Giữ bảng phấn, palette và file slide. Chữ trên nền vàng và avatar dùng token riêng; sửa màu nhãn thành công và ô C để đủ AA.
- Màn hình chiếu quiz có Sáng/Tối riêng, mặc định Sáng. Sửa grid đáp án khi mở bộ quiz ở 390px; sắp lại header điện thoại để nút Màu không làm tràn.
- 92/92 test, lint, build qua. Test bốn mốc giờ ở UTC/New_York, script khi storage lỗi và tương phản token >=4,5:1 cho chữ, nút, nhãn, A–D. Playwright 1280/390px: qua 18h tự đổi, chọn tay còn sau reload, chín trang tối không tràn/lỗi; chiếu mặc định sáng và chọn riêng, DOM slide không đổi theo giao diện app.

## Tiếp quản Codex — Giai đoạn 8, bỏ qua các điểm chờ 5–7 (21/10/2026)

- Giai đoạn 5 chờ Supabase/Realtime; 6 hoãn Gmail theo người dùng; 7 chờ file mẫu chính thức Wayground/Kahoot trong docs/mau-nhap/. Không thêm quyền hoặc đoán cột.
- Thêm script Playwright chụp bằng context mới, chỉ localhost, xác nhận demo không Supabase. Năm ảnh WebP 1200×800: ba nút xuất quiz, ô QR, ô dán tin; khoanh đỏ vùng thao tác, không chụp dữ liệu thật.
- Gắn ảnh có alt tiếng Việt và nút mở lớn vào bước Lớp Mình trong PlatformGuide và Kỹ Năng Số. Các bước trên Wayground/Kahoot/Quizlet, PowerPoint, Camera/Zalo, Google Drive/Form: cần **chụp tay**, chưa có ảnh, không dùng ảnh giả.
- Cài Playwright ở devDependencies để nhóm chạy lại script; không thêm dịch vụ. Hướng dẫn chạy trong docs/ANH-HUONG-DAN.md.
- 88/88 test, lint, build qua. Playwright ở 1280/390px: ảnh trong ba tab nền tảng và hai bài kỹ năng tải thành công, không tràn ngang, không lỗi JavaScript. Đã xem ảnh và sửa nút chat nổi che vùng chụp.

## Tiếp quản Codex — Giai đoạn 4: code/demo, chờ thử dịch vụ thật (21/10/2026)

- Migration 0003 thêm jobs có RLS, mã yêu cầu chống tạo trùng và tối đa một job đang chạy mỗi hồ sơ. POST trả mã trước; Next after() soạn và lưu kết quả, tiến độ theo bước thật; GET chỉ đọc job của chủ tài khoản.
- Soạn Bài theo dõi mỗi 2,5 giây khi đang chạy/mất mạng, mở lại xem được kết quả và lưu vào danh sách. Không có Supabase giữ luồng trực tiếp; bỏ thanh tiến độ giả theo đồng hồ.
- Giới hạn route 270 giây, truy xuất kho 40 giây, ngân sách thử lại Gemini 180 giây. Job quá 5 phút chuyển lỗi và cho tạo lại. after() không phải hàng đợi bền vững: tiến trình bị hủy không tự tiếp tục. Xưởng học liệu vẫn giữ hàng đợi xuất file trong trình duyệt; âm thanh/video đang hoãn.
- 88/88 test, lint, build qua (33 route). Test kiểm tra trả mã trước khi soạn, lưu kết quả, chống trùng, lỗi an toàn và polling phục hồi sau mất mạng giả lập. PostgreSQL 17: RLS hai tài khoản, anonymous bị chặn, unique job và lưu kết quả đều qua; dữ liệu test rollback.
- Playwright demo 1280/390px: soạn bài, tải lại còn dữ liệu, không lỗi JavaScript/tràn ngang. Thời gian bấm soạn tới bản xem trước khung demo: 384 ms / 132 ms trên máy này; không phải độ trễ Gemini. Chưa thử ngắt mạng/đóng tab trên Supabase + Vercel thật, nên chưa đánh dấu giai đoạn xong.

## Tiếp quản Codex — Giai đoạn 3: code và demo, chờ project thật (21/10/2026)

- Thêm client/server `@supabase/ssr`, refresh cookie sau cổng mật khẩu, callback Google, trang Tài khoản trong menu hồ sơ. Khi có cấu hình Supabase, API làm việc yêu cầu phiên hợp lệ; thiếu cấu hình vẫn dùng demo. Không xin Gmail hoặc đổi model.
- Chào lần đầu yêu cầu tự chọn Thầy/Cô, tên gọi, môn/trường/lớp; Có/Không chuyển dữ liệu local. Chỉ đọc dữ liệu để chuyển sau khi chọn Có; giữ nguyên bản trên máy và các hồ sơ được chuyển. Không đoán giới tính từ tên OAuth.
- Migration 0002 thêm `app_state` với RLS theo user_id, trường học lực/nổi bật/ảnh; giao dịch khởi tạo và cập nhật hồ sơ đồng bộ `profiles.gender/call_name`. Giữ nguyên 0001. Dữ liệu hiện lưu snapshot theo khóa, chưa chuẩn hóa mọi thực thể thành bảng riêng.
- Giữ API useLocal/useLessons/useDocs; thêm engine chuyển local hoặc cloud, hàng đợi ghi nối tiếp, báo lỗi và thử lại. Đổi tài khoản hủy cache/state; callback cũ không ghi vào phiên mới. Dữ liệu cloud không ghi đè localStorage. Xóa toàn bộ chat đợi lệnh lưu cũ rồi xóa lịch sử/sổ ghi nhớ trên server, hủy request chat đang chạy.
- Tên kho Gemini riêng có chữ ký gắn tài khoản, chặn tự gán kho người khác. Kho demo cũ/khóa Gemini đổi cần tải lại tài liệu. Kho chung vẫn từ cấu hình server.
- 82/82 test, lint và build qua. Playwright 1280/390px: toàn bộ trang demo mở được, chat còn sau tải lại và xóa thật khỏi local, không lỗi JavaScript/tràn ngang. Migration và kiểm tra RLS chạy thành công trên PostgreSQL 17 Docker: hai user giả không đọc/ghi/xóa chéo, anonymous bị chặn, hồ sơ và xóa hoạt động; dữ liệu test rollback, container đã dừng.
- Chưa thử Supabase/Google thật vì người dùng chưa tạo project. Không đánh dấu giai đoạn hoàn thành. Hạn chế: chưa có hàng đợi offline bền vững, mỗi lần ghi/nhập tối đa 3,5 MB, ghi đồng thời nhiều máy lấy lần ghi sau cùng, không cập nhật trực tiếp giữa hai máy. Cấu hình và kiểm tra tay trong `docs/DEPLOY.md`.


## Tiếp quản Codex — Giai đoạn 2D (21/10/2026)

- Thêm `/xuong-hoc-lieu`, mục điều hướng và đường dẫn từ Xuất file của Soạn Bài. Dùng chung lớp/hồ sơ/mục lục đã đối chiếu, gõ hoặc nói yêu cầu, chọn 8 loại đầu ra, tiến độ và tải riêng, thử lại riêng từng lỗi.
- Tái dùng xuất giáo án Word, slide PowerPoint và quiz; thêm phiếu hai tầng Word, sơ đồ PNG/SVG, infographic A4 PNG, gói nguồn/câu lệnh NotebookLM. Tên file ASCII. Không gửi danh sách lớp/ghi chú học sinh sang luồng tạo học liệu; chặn nguồn có tên trong danh sách hoặc dấu hiệu ghi chú riêng trước khi xuất.
- Đồ thị có schema bậc nhất/bậc hai/sin/cos/mũ/bảng, code tính 801 điểm, không eval. Giáo viên xác nhận đơn vị/công thức/pha/khoảng vẽ. Mẫu A=5 cm, T=2 s chạy không khóa, ghi rõ pha mặc định 0. Bảng số liệu do giáo viên nhập, PowerPoint chứa biểu đồ gốc và workbook chỉnh sửa được.
- Sơ đồ, đồ thị, infographic vào slide qua `layout.ts`; preview và PPTX dùng chung vị trí/kích thước. Biểu đồ PowerPoint gốc có thể khác cách vẽ nhãn so với SVG; không cam kết giống từng pixel.
- 67/67 test, lint, build qua (29 trang). Playwright localhost 1280/390px: 4 loại tạo 7 file, không tràn và không lỗi JavaScript. Kiểm tra thêm mọi loại file; giả lập lỗi ảnh: 3 loại còn lại xong, thử lại riêng sơ đồ thành công. Đọc XML DOCX/PPTX, xác nhận biểu đồ có dữ liệu 2, −3, 7 và workbook nhúng.
- Đã sửa nút chính bị trùng lớp màu khi xem ảnh chụp. Dev server cần dùng localhost; 127.0.0.1 bị chặn tài nguyên sau khi khởi động lại. Còn cảnh báo kiểm tra instant navigation của khung app trong dev như trước.
- Người dùng xác nhận hoãn âm thanh/video. Chưa gọi TTS hoặc bật dịch vụ trả phí. Dự toán và nguồn giá trong `docs/XUONG-HOC-LIEU.md`. Chưa thử Gemini thật; giáo án/phiếu/quiz demo là khung mẫu. Hàng đợi hiện ở trình duyệt, rời trang phải tạo lại; công thức vật lý vẫn cần giáo viên kiểm tra đơn vị. File Wayground/Kahoot còn chờ mẫu ở Giai đoạn 7.


## Tiếp quản Codex — Giai đoạn 2C, khung chờ nguồn (21/10/2026)

- Schema Zod cho văn bản và mục lục: nguồn chính thức HTTPS, ngày, NFC, mã bài không trùng, yêu cầu cần đạt có vị trí trích dẫn; không cho trích nội dung khi chưa đối chiếu.
- 8 đầu mục văn bản theo danh sách nhóm cung cấp, đều chưa xác minh, không tự điền ngày/hiệu lực/nội dung; 5 mục lục rỗng Toán 9, Vật lý 10/11, Ngữ văn 6/7. Chưa khẳng định chính sách dùng chung SGK khi chưa đối chiếu nguồn.
- Kho có Thư viện chung và Tài liệu của tôi, tìm không dấu/lọc; Soạn Bài chọn chương/bài khi có nội dung đã kiểm tra, vẫn gõ tay được. Server xác thực mã bài và môn/lớp; yêu cầu cần đạt lấy từ catalog, không tin bản khách tự gửi.
- Script kiểm tra định dạng và nạp PDF có kiểm tra đường dẫn/SHA256, mặc định chỉ kiểm tra. Chạy thử thấy 0 PDF đã đối chiếu, không upload. Kho chung `GEMINI_SHARED_STORE` được ghép với kho riêng trên server. Hướng dẫn `docs/THU-VIEN.md`.
- 58/58 test, lint và build qua. Playwright 1280/390px: thư viện chờ nguồn, tìm không dấu, tab riêng và nhập bài thủ công hoạt động, không tràn.
- Chưa hoàn thành Giai đoạn 2C: chờ nhóm cung cấp PDF/mục lục chính thức, kiểm tra hiệu lực, nạp store và thử bài SGK thật. Giữ khung luật soạn bài cũ cho demo trong lúc chưa có văn bản đã đối chiếu.

## Tiếp quản Codex — Giai đoạn 2B (21/10/2026)

- `design/02-the-hoc-sinh.html`: thẻ, lọc không dấu, điểm danh, sheet ghi chú nhanh, chi tiết và quy trình bù bài 6 bước. Dùng token CSS, dữ liệu minh họa, không lưu hoặc gửi ảnh.
- Playwright: mẫu 1280/390px không tràn; tìm không dấu và chip ghi chú hoạt động. Đã xem ảnh chụp cả hai khổ.
- Người dùng đã duyệt bố cục, sau đó dựng thẻ React, sheet ghi chú/micro, ảnh minh chứng thu nhỏ ≤1280px và trang chi tiết `/hoc-sinh?id=...`. Thêm học lực/nổi bật, đọc cột Học lực từ Excel, bổ sung demo và phân tầng.
- Engine thuần tự mở bù bài từ ghi chú vắng (nút/chip/giọng nói); một em một quy trình 6 bước/ngày. Gợi ý phụ đạo khi cần hỗ trợ hoặc 3 ghi chú học tập yếu/14 ngày; hỏi thăm khi ốm hai ngày liên tiếp. Có việc đến hạn trên Hôm Nay, ngày hẹn theo tuần học trong thời khóa biểu.
- Chọn giáo án cùng lớp/ngày hoặc tự chọn/gõ tên; chuẩn bị nháp nền theo hồ sơ, có retry, chỉnh tóm tắt/phiếu/quiz, tải Word/in/chiếu quiz, QR từ link phòng đã có. Không có Gemini dùng khung mẫu và câu hỏi từ giáo án nếu có, đánh dấu rõ cần duyệt.
- Nháp phụ huynh dùng mẫu an toàn không nhận ghi chú hoặc tên học sinh, giáo viên tự sửa và chép; không tự gửi. Trạng thái, ngày hẹn và kết quả từng bước lưu `lm:workflows:<profileId>`, có xác nhận hủy khi đánh dấu có mặt lại.
- 49/49 test, lint và build qua. Playwright 1280/390px: điểm danh → 6 bước/5 câu → tải Word → chiếu quiz → xác nhận hủy, không tràn. Ảnh 2000×1500 thành 1280×960, còn sau tải lại, không gọi API upload.
- Chưa thử Gemini thật hoặc đo thời gian AI dưới một phút. Ảnh còn ở localStorage, dung lượng phụ thuộc trình duyệt; chưa đồng bộ đa máy. Nháp phụ huynh hiện dùng mẫu xác định để tránh vô tình trộn ghi chú nhạy cảm.

## Tiếp quản Codex — Giai đoạn 2 (21/10/2026)

- Phân loại lỗi Gemini bằng mã HTTP có cấu trúc; chat báo rõ lỗi khóa/API, model, hạn mức, máy chủ và kết nối. Đọc chunk đầu trước khi trả stream để bắt đúng lỗi khởi tạo; lỗi giữa stream có thông báo tiếng Việt.
- Log lỗi chat, sổ ghi nhớ và bộ sinh JSON chỉ có mã/loại; lỗi ném từ bộ sinh JSON đã loại thông báo thô SDK. Giữ log số token sử dụng, không ghi nội dung.
- `/api/health` chạy tại thời điểm request, không cache, qua cổng mật khẩu; trả trạng thái cấu hình và ping model nhanh tối đa 5 token, timeout 10 giây. Nhãn demo rõ trong chat, hướng dẫn trong `docs/DEPLOY.md`.
- 38/38 test, lint và build qua. Playwright 1280/390px: demo chat, không tràn, health demo; chạy dev với `GEMINI_API_KEY=sai` và mật khẩu thử: health chưa đăng nhập trả 401, sau đăng nhập ping trả 400, chat hiện lỗi khóa sai.
- Còn cảnh báo dev của Next về kiểm tra instant navigation khi đổi trang nhanh; build production qua. Chưa thử khóa Gemini hợp lệ.

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
