# Đưa Lớp Mình lên mạng (Vercel)

Vercel là nơi chạy Next.js dễ nhất, gói Hobby miễn phí đủ để chạy thử với nhóm nhỏ.

## Các bước

1. Vào vercel.com, đăng nhập bằng tài khoản GitHub.
2. **Add New… → Project**, chọn repo `Lopminh_Project`, bấm **Import**.
3. Ở màn hình cấu hình:
   - Framework: Next.js (Vercel tự nhận).
   - Mở **Environment Variables**, thêm:
     - `GEMINI_API_KEY` = khóa Gemini mới (lấy ở aistudio.google.com/apikey).
     - `SITE_PASSWORD` = một mật khẩu chung để gửi cho thầy cô dùng thử. Bắt buộc nên có: không có thì ai biết link cũng dùng được khóa Gemini của nhóm.
4. Bấm **Deploy**. Khoảng 2 phút sau có link dạng `lopminh-xxx.vercel.app`.
5. Vercel mặc định build nhánh `main`. Vì đang làm trên `v4-nang-cap`, vào **Settings → Git → Production Branch**, đổi thành `v4-nang-cap` rồi bấm **Redeploy** (hoặc gộp `v4-nang-cap` vào `main` khi nhóm đã duyệt).

Từ đó mỗi lần push lên nhánh này, Vercel tự build lại.

## Đã cấu hình sẵn trong code

- `vercel.json` đặt máy chủ ở Singapore (`sin1`) cho gần Việt Nam.
- Soạn bài chạy tối đa 180 giây, dưới giới hạn 300 giây của gói Hobby.
- Tải tài liệu lên Kho tối đa 4 MB mỗi tệp (Vercel giới hạn 4,5 MB mỗi request). Tệp lớn hơn chỉ lưu chữ trên máy.
- Có `SITE_PASSWORD` thì mọi trang và mọi API đều phải nhập mật khẩu trước (cookie nhớ 30 ngày).

## Kiểm tra

- Sau khi nhập mật khẩu, mở `/api/health`. `ai`, `supabase`, `gate` chỉ cho biết đã có cấu hình hay chưa; `models` cho biết model đang dùng. Không có giá trị khóa trong kết quả.
- `ping: "ok"` nghĩa là lời gọi Gemini bằng model nhanh thành công; `"not-configured"` là đang demo. 400/401/403: khóa sai hoặc API chưa bật; 404: model không tồn tại; 429: hết hạn mức; 5xx: lỗi dịch vụ hoặc kết nối.
- Mỗi lần mở health có một lời gọi `ping`, tối đa 5 token đầu ra, timeout 10 giây. Không tự gọi liên tục. `supabase: true` chưa khẳng định kết nối hoặc RLS hoạt động.
- Nếu chưa nhập mật khẩu khi `SITE_PASSWORD` được bật, API này trả 401 như các API khác.

## Giới hạn của bản chạy thử

- Khi chưa cấu hình/đăng nhập Supabase, dữ liệu vẫn ở trình duyệt. Xóa dữ liệu trình duyệt sẽ mất bản demo. Luồng tài khoản đã có code nhưng còn chờ kiểm tra với project thật như hướng dẫn bên dưới.
- Tất cả người dùng chung một khóa Gemini và một hạn mức. Gói free của Gemini có giới hạn số lượt mỗi phút/ngày; đông người thì nên bật thanh toán trong Google AI Studio.
- Gói Hobby của Vercel dành cho dự án cá nhân, phi thương mại. Khi đưa vào trường dùng chính thức thì chuyển gói Pro.

## Tên miền riêng (lopminhedu.vn)

Vercel → Project → **Settings → Domains** → thêm `lopminhedu.vn`, rồi vào trang quản lý tên miền thêm bản ghi DNS theo hướng dẫn Vercel hiện ra.

## Supabase và Google (Giai đoạn 3)

Code đã có; nhóm chưa cung cấp project nên chưa thử OAuth hoặc đồng bộ trên Supabase thật.

1. Tạo project, bật Google provider và cấu hình ứng dụng Google theo [hướng dẫn Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google). Chỉ dùng quyền hồ sơ cơ bản; không bật Gmail ở bước này.
2. Tự điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ở máy và Vercel. Không dùng service-role key làm biến public, không gửi giá trị khóa trong chat. Thiếu một trong hai biến thì ứng dụng vẫn chạy demo.
3. Chạy lần lượt migration `0001_khoi_tao.sql`, `0002_luu_tru_tai_khoan.sql` trong SQL Editor. Không chạy `scripts/kiem-tra-rls.sql` trên database thật: script dành cho DB thử riêng.
4. Trong Supabase Authentication → URL Configuration, đặt Site URL đúng tên miền, thêm redirect URL `https://TEN-MIEN/auth/callback` và `http://localhost:3000/auth/callback` khi thử local. Google dùng callback Supabase do dashboard cung cấp. Redeploy sau khi đổi biến public.
5. Nhập cổng mật khẩu trước, rồi menu hồ sơ → Tài khoản → Đăng nhập Google. Lần đầu tự chọn Thầy/Cô, tên gọi, lớp đầu tiên nếu cần và Có/Không chuyển dữ liệu trên máy. Không suy đoán giới tính từ tên Google. Nếu chọn Có, các hồ sơ cũ vẫn nằm trong menu; bản local không bị xóa.
6. Kiểm tra với hai tài khoản thật: tạo ghi chú/giáo án, mở máy thứ hai, đổi tài khoản, xóa chat rồi tải lại. RLS phải chặn đọc/ghi chéo. Mở `/api/storage` chưa đăng nhập phải trả 401.
7. Chỉ bỏ `SITE_PASSWORD` sau khi đã kiểm tra đăng nhập và RLS thật. Khi có cấu hình Supabase, proxy yêu cầu phiên hợp lệ cho các API làm việc (trừ gate/health). Các trang demo vẫn mở được nhưng API làm việc cần đăng nhập. Khi chưa có Supabase, phải giữ cổng mật khẩu nếu dùng Gemini trên mạng.

Dữ liệu tài khoản nằm trong `app_state` theo `(user_id,key)` có RLS, gồm notes, rosters, lessons, quiz, quizurl, mail, docs, filestore, chat, chatmem, load, kynang, songngu-days, workflows, classes, timetable và tùy chọn giao diện. Snapshot giữ giao diện hook cũ; chưa chuẩn hóa từng thực thể sang bảng quan hệ. `profiles.gender/call_name` được đồng bộ trong cùng giao dịch với snapshot hồ sơ.

Khi đổi tài khoản, cache và state giao diện được tạo lại. Kết quả request cũ không được ghi vào phiên mới. Lỗi lưu hiện cảnh báo, có nút thử lại; bản chưa lưu nằm trong bộ nhớ, chưa có hàng đợi offline bền vững. Không đóng trang khi chưa lưu xong. Mở máy khác nạp bản server; chỉnh đồng thời trên nhiều máy hiện dùng lần ghi sau cùng cho mỗi khóa, chưa hòa trộn thay đổi. Dữ liệu mỗi lần ghi/nhập giới hạn 3,5 MB; nhiều ảnh có thể vượt giới hạn và cần giảm ảnh trước khi chuyển.

Nút “Xóa toàn bộ trò chuyện” xóa cả lịch sử và sổ ghi nhớ của hồ sơ đang chọn trên server. Bản demo từng được sao chép vẫn còn ở localStorage theo lựa chọn giữ dữ liệu local; xóa bản đó bằng chế độ demo nếu cần. Hồ sơ khác trong cùng tài khoản có lịch sử riêng.

Kho Gemini riêng khi đăng nhập dùng tên kho có chữ ký gắn với tài khoản; không thể tự gán tên kho của người khác. Kho demo cũ chưa có chữ ký cần tải lại tài liệu vào tài khoản. Đổi khóa Gemini làm chữ ký cũ hết hiệu lực, cần tải lại tài liệu; không xóa tài liệu cũ tự động. Kho chung chỉ lấy từ biến server `GEMINI_SHARED_STORE`.

Kiểm chứng đã làm: unit test đổi tài khoản/cache/ghi chậm/lỗi mạng/xóa; PostgreSQL 17 cục bộ chạy migrations và kiểm tra RLS bằng 2 vai người dùng giả. Đây không thay thế kiểm tra đăng nhập Google, cookie trên Vercel và project Supabase thật.

## Job soạn giáo án

Áp dụng thêm `supabase/migrations/0003_job_soan_bai.sql` sau 0002. Khi đăng nhập, Soạn Bài tạo job và theo dõi trạng thái; không có Supabase vẫn gọi trực tiếp như demo. Kiểm tra RLS cục bộ bằng `scripts/kiem-tra-jobs.sql` trên DB thử nghiệm có hai user giả (không chạy trên dữ liệu thật).

Route dùng Next.js `after()` với `maxDuration = 270`. Cần bật Fluid Compute và kiểm tra thời lượng Function trong Vercel; Hobby hỗ trợ tối đa 300 giây theo [tài liệu thời lượng](https://vercel.com/docs/functions/configuring-functions/duration). Phần lấy tài liệu tối đa 40 giây, Gemini tổng 180 giây, còn thời gian lưu kết quả.

`after()` tiếp tục sau response nhưng không phải hàng đợi bảo đảm chạy lại khi tiến trình bị hủy. Job quá 5 phút được đánh dấu lỗi khi truy vấn tiếp; giáo viên tạo lại. Kết quả lưu trong jobs, mở lại Soạn Bài để xem và lưu vào danh sách. Chưa có dọn lịch sử jobs tự động.

Trước phát hành: đăng nhập thật, soạn một bài, tắt mạng hoặc đóng tab sau khi nhận mã, mở lại và đối chiếu kết quả. Thử hai tài khoản không đọc được job nhau. Các bước này chưa thực hiện vì chưa có project Supabase.
