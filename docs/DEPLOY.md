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

- Dữ liệu (ghi chú, giáo án, quiz, hộp thư, sổ ghi nhớ) còn lưu trong trình duyệt của từng người. Đổi máy hoặc xóa dữ liệu trình duyệt là mất. Muốn dùng thật nhiều máy cần nối Supabase.
- Tất cả người dùng chung một khóa Gemini và một hạn mức. Gói free của Gemini có giới hạn số lượt mỗi phút/ngày; đông người thì nên bật thanh toán trong Google AI Studio.
- Gói Hobby của Vercel dành cho dự án cá nhân, phi thương mại. Khi đưa vào trường dùng chính thức thì chuyển gói Pro.

## Tên miền riêng (lopminhedu.vn)

Vercel → Project → **Settings → Domains** → thêm `lopminhedu.vn`, rồi vào trang quản lý tên miền thêm bản ghi DNS theo hướng dẫn Vercel hiện ra.
