# Bật đọc Gmail cho Hộp Thư Công Việc

Hộp Thư hiện lọc tin do thầy cô dán vào. Để tự đọc Gmail cần làm các bước sau (nhóm phát triển làm một lần):

1. Google Cloud Console → tạo OAuth client (Web), bật **Gmail API**.
2. Thêm scope `https://www.googleapis.com/auth/gmail.readonly`. Đây là scope nhóm "restricted": khi app chưa được Google xác minh, chỉ dùng được với **tối đa 100 tài khoản thử nghiệm** khai báo trong mục Test users.
3. Supabase → Authentication → Providers → Google: điền Client ID/Secret, thêm scope trên vào "Additional scopes". Bật lưu `provider_token`.
4. Viết route `/api/mail/gmail` (server): lấy `provider_token` của phiên Supabase, gọi `GET https://gmail.googleapis.com/gmail/v1/users/me/messages?q=newer_than:3d` rồi `messages.get` từng thư (format=full), ghép thành `RawMail[]` và chuyển cho `/api/mail/classify`.
5. Chỉ đọc. Không xóa, không gắn nhãn, không gửi thư thay giáo viên. Không lưu nội dung thư vào log.

Zalo không cho đọc tin nhắn cá nhân qua API, nên ô "Dán tin" vẫn là cách lọc tin Zalo.
