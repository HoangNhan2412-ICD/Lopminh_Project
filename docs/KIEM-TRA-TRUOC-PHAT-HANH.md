# Kiểm tra trước phát hành V4

Ngày 21/10/2026. Kết quả cục bộ dùng demo, không có .env.local.

## Đã kiểm tra

- [x] Nhánh v4-nang-cap, không đổi main hoặc sửa lịch sử git. Không đưa .env hoặc khóa vào commit.
- [x] Xưng hô tên giáo viên trong UI/prompt đi qua hàm danh xưng. Không thấy tên giáo viên viết cứng ngoài chú thích/test.
- [x] Không còn mã hex cố định trong component; linh vật dùng token. Slide lấy màu từ palette xuất file riêng.
- [x] Đầu vào JSON nội dung, dữ liệu lưu, prompt và JSON AI chuẩn NFC. Mật khẩu giữ nguyên chuỗi bí mật để không đổi quy tắc xác thực. Có test Unicode lồng nhau.
- [x] Không ghi message/error thô của SDK ở API. Log AI chỉ mã/loại lỗi và số token/thời gian; test lỗi chứa nội dung riêng không lộ log.
- [x] Ghi chú JSON dùng generateJson chung, ngân sách retry có giới hạn. Không đổi model mặc định.
- [x] 96 test ở 19 file; npm run test/lint/build qua, 33 route.
- [x] Playwright dev: 11 trang × 1280/390px, không tràn ngang hoặc lỗi JavaScript; vùng bấm hiện diện của nội dung chính >=44px. Sửa nút tự gõ quiz trước đó cao 27px. Cỡ chữ nền/nội dung chính 18px; nhãn và ghi chú phụ có thể nhỏ hơn.
- [x] Token chữ/nút/nhãn/quiz sáng và tối đạt >=4,5:1. Qua mốc giờ Việt Nam tự đổi; màn hình chiếu có lựa chọn riêng; đổi màu app không đổi nội dung slide.
- [x] Migration/RLS 0001–0003 chạy trên PostgreSQL thử nghiệm; hai user không đọc/ghi chéo; anonymous bị chặn; xóa chat và kết quả job được kiểm tra.
- [x] Vercel công khai: / và /tam-tinh trả HTTP 200. Chưa đối chiếu commit deployment trên dashboard.

## Cần người kiểm tra

- [ ] Supabase/Google thật: OAuth callback/cookie, đổi tài khoản, nhập dữ liệu có/không, hai máy, xóa chat trên server. Không tắt cổng mật khẩu trước khi kiểm tra bảo vệ API.
- [ ] Job trên Vercel: có Fluid Compute, chạy AI thật, mất mạng/đóng tab rồi mở lại; hạn mức 270 giây và xử lý quá hạn.
- [ ] Giáo viên đọc giáo án/quiz/phiếu, thử mọi nút bằng bàn phím, thiết bị iOS/Android, cỡ chữ rất lớn, các sheet/dialog có dữ liệu dài. Lượt tự động không chứng minh mọi tổ hợp màn hình đạt chuẩn tiếp cận.
- [ ] Đối chiếu bản gốc văn bản pháp luật, hiệu lực, mục lục SGK và yêu cầu cần đạt. Thư viện hiện chỉ có khung chờ nguồn.
- [ ] Nhập file mẫu chính thức Wayground/Kahoot rồi kiểm tra import trên tài khoản thật.
- [ ] Ảnh hướng dẫn bên ngoài: nhóm chụp tay; chỉ phần thao tác trong Lớp Mình đã có ảnh.
- [ ] Kiểm tra đường dây nóng đang ghi trong src/lib/ai/prompts.ts: **115** và **Ngày Mai — duongdaynongngaymai.vn**. Code không chứa số điện thoại Ngày Mai. Chưa xác minh hoạt động/giờ tiếp nhận; không tự sửa số hoặc địa chỉ.
- [ ] Npm audit: **9 mục (7 cao, 2 vừa)**, không có mức nghiêm trọng. Nhánh lint: braces → micromatch → fast-glob → eslint-config-next; nhánh xuất PPTX: image-size → pptxgenjs; nhánh Excel: uuid → exceljs. Đề xuất tự động hiện có downgrade/thay đổi phiên bản lớn; chưa áp dụng force. Cần chọn bản tương thích và thử xuất/nhập trước phát hành.
- [ ] Hạn mức và bảo vệ AI theo tài khoản: chưa có quota/rate limit ứng dụng; cổng mật khẩu chung không thay thế kiểm soát người dùng.
- [ ] Chính sách lưu/xóa dữ liệu, quyền dùng tài liệu tải lên, đồng ý của nhà trường; bản local demo vẫn còn sau nhập và sau xóa bản cloud.

## Chưa triển khai theo điểm dừng

Phòng quiz học sinh chờ Supabase; Gmail tạm hoãn; âm thanh/video tạm hoãn. Không thêm dịch vụ trả phí, quyền Google hoặc đăng nhập bằng cookie hộ người dùng.
