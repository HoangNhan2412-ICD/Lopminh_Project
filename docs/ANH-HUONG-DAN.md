# Chụp ảnh hướng dẫn

Chạy app demo, không cấu hình Supabase; không dùng tài khoản hoặc dữ liệu thật.

```sh
npm ci
npx playwright install chromium
npm run dev
# Terminal khác, ở thư mục repo:
node scripts/chup-huong-dan.ts
```

Script mở context mới chỉ localhost, dùng quiz và tin nhắn mẫu, xuất 5 WebP 1200×800 vào public/guides. Có thể đặt GUIDE_BASE_URL nếu đổi cổng localhost. Ảnh chỉ khoanh vùng thao tác, không có ảnh của dịch vụ bên ngoài.

Nhóm chụp tay các bước ngoài Lớp Mình: Wayground, Kahoot, Quizlet, PowerPoint, Camera/Zalo, Google Drive/Form. Dùng tài khoản thử, che thông tin riêng; đối chiếu giao diện thực tế trước khi bổ sung.
