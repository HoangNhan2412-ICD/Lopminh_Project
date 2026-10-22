# Nhập thư viện chung

Hiện chỉ có cấu trúc và danh sách cần đối chiếu do nhóm đề xuất. Chưa có PDF, chưa xác minh số hiệu, ngày hoặc hiệu lực. Không coi danh sách này là tư vấn pháp lý hay nội dung SGK đã xác nhận.

1. Nhóm tải PDF nguyên bản từ vbpl.vn, moet.gov.vn hoặc chinhphu.vn vào `kho-mac-dinh/van-ban/`. Không tải từ trang tổng hợp, không đặt SGK vào thư mục này.
2. Đối chiếu số hiệu, ngày ban hành, ngày hiệu lực, các sửa đổi và tình trạng. Với CV 5512 cần đủ phụ lục I–IV. Bổ sung công văn nhiệm vụ năm học khi đã có bản chính thức; không đoán số hiệu.
3. Sửa `src/content/thu-vien/van-ban.json`: `banGoc` là URL chính xác; `tepPdf` là tên tệp; `sha256` lấy bằng `sha256sum kho-mac-dinh/van-ban/<ten>.pdf`; `ngayKiemTra` là ngày thực tế.
4. `tomTat` gồm `{ text, source, location }`, ghi chính xác điều/mục/phụ lục. `khungBaiDay` gồm `{ text, location }`: trích khung đã đối chiếu để đặt đầu prompt. Chỉ bật `daKiemTra: true` sau khi đủ chứng cứ.
5. Mục lục SGK: sửa các tệp trong `src/content/thu-vien/sgk/`. Chỉ có tập, chương, tên bài, số tiết gợi ý; mỗi bài có `docSach` trỏ bản đọc chính thức trên taphuan.nxbgd.vn. `yeuCauCanDat` lấy từ văn bản chương trình, kèm URL và vị trí. Không sao chép trang sách, bài tập hoặc hình ảnh.
6. Các môn/lớp demo đã có 5 tệp rỗng. Khi thêm môn/lớp, sao chép cấu trúc một tệp, đổi `id/mon/lop`, giữ `chuong: []` cho đến khi đối chiếu; thêm import vào `catalog.ts`. Không tự điền tên bài từ trí nhớ. Không có danh mục môn đầy đủ đã duyệt nên chưa sinh hàng loạt tệp cho các môn khác.

Mẫu cấu trúc chương (thay mọi chỗ trong dấu ngoặc bằng dữ liệu thật, không nạp mẫu này):

```text
chuong: [{ id, tap, ten, bai: [{ id, ten, soTietGoiY,
  yeuCauCanDat: [{ text, source, location }], docSach }] }]
```

Chạy `node --experimental-strip-types scripts/kiem-tra-thu-vien.mjs` và `npm run test`. Schema kiểm tra định dạng, nguồn và trùng mã; con người vẫn phải xác nhận nội dung, quyền sử dụng và hiệu lực.

# Nạp Gemini File Search

Script dùng SDK chính thức theo [tài liệu File Search của Google](https://ai.google.dev/gemini-api/docs/file-search). Chưa chạy upload trong phiên triển khai vì chưa có PDF/khóa. Không thay model mặc định.

- Kiểm tra không upload: `node --experimental-strip-types scripts/nap-thu-vien.ts`.
- Sau khi nhóm đối chiếu và chấp nhận chi phí File Search, người quản lý tự chạy `node --env-file=.env.local --experimental-strip-types scripts/nap-thu-vien.ts --upload`.
- Script chỉ nhận PDF đã kiểm tra, còn hiệu lực, đúng SHA256 và nằm trong thư mục cho phép; không nhận SGK. Trạng thái lần nạp được lưu `.local/` (git bỏ qua).
- Đặt tên kho vào `GEMINI_SHARED_STORE`, không đưa khóa vào code. Nếu bị ngắt sau khi tạo kho, đọc tên trong `.local/thu-vien-store.json` rồi cấu hình biến trước khi chạy lại. Kho hiện có được dùng tiếp; tài liệu đã nạp đúng hash được bỏ qua. Nếu PDF thay đổi, người quản lý cần xử lý phiên bản cũ trong kho trước khi nạp lại.
- Khi soạn bài/hỏi kho, server ghép kho chung với kho riêng. Nội dung chưa đối chiếu không được dùng làm nguồn SGK. Không có Gemini vẫn tìm theo từ khóa trên thẻ thư viện.

Còn chờ: PDF chính thức, mục lục sách thật, trích yêu cầu cần đạt, đối chiếu thời điểm áp dụng bộ SGK, chạy upload và thử một bài có nguồn thật. Không đánh dấu Giai đoạn 2C hoàn thành trước các bước này.
