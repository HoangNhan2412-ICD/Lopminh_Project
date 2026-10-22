# Xưởng học liệu

Mở `/xuong-hoc-lieu`, chọn lớp và tên bài hoặc giáo án đã soạn. Tick các loại file rồi bấm **Bé Bảng làm giúp**. Mỗi loại có tiến độ, tải riêng và thử lại riêng. Giữ trang mở trong lúc làm; chưa có kho job trên server.

File hỗ trợ: giáo án Word; slide PowerPoint; sơ đồ PNG/SVG; đồ thị PNG/SVG và một slide PowerPoint; phiếu hai tầng Word; bộ câu hỏi Wayground/Kahoot/Quizlet; infographic A4 dọc PNG; gói nguồn và câu lệnh NotebookLM. File xuất không có dấu hoặc khoảng trắng trong tên. Mẫu Wayground/Kahoot vẫn chờ nhóm cung cấp để đối chiếu ở Giai đoạn 7.

Chưa có Gemini thì giáo án, phiếu và câu hỏi là **khung mẫu**, không phải nội dung bài học đã được kiểm chứng. Giao diện ghi rõ điều này. Không tự nạp mục lục hoặc văn bản chưa đối chiếu.

## Đồ thị

Mô tả đồ thị rồi bấm **Đọc yêu cầu đồ thị**, hoặc tự sửa bảng tham số. Kiểm tra công thức, đơn vị, pha và khoảng vẽ trước khi xác nhận xuất. Các họ cho phép: bậc nhất, bậc hai, sin, cos, mũ và bảng số liệu do người dùng nhập. Không thực thi chuỗi công thức, không dùng `eval`. Gemini chỉ đề xuất tham số; code tính 801 điểm. Bảng số liệu được xuất thành biểu đồ PowerPoint chỉnh sửa được. Vị trí và kích thước dùng chung bộ dàn trang; nhãn/phông của biểu đồ gốc có thể khác ảnh xem trước do PowerPoint dựng lại.

Ví dụ không cần khóa: `đồ thị li độ theo thời gian của dao động điều hòa, A = 5 cm, T = 2 s`. Mẫu mặc định công khai chọn pha ban đầu 0: x(t)=5cos(πt) cm, khoảng 0–4 s. Các điểm 0; 0,5; 1; 1,5; 2 s lần lượt là 5; 0; −5; 0; 5 cm. Chưa nêu A/T/đơn vị hoặc có yêu cầu pha riêng thì cần nhập tay hoặc Gemini; không tự suy đoán.

Bộ kiểm tra chặn số không hữu hạn, khoảng ngược, hàm tràn, hơn 40 chu kỳ và bảng rỗng. Chưa kiểm chứng thứ nguyên cho mọi công thức vật lý; giáo viên xác nhận đơn vị trước khi xuất. Sơ đồ/infographic rút ý từ mục tiêu và hoạt động, tối đa 6/5 ý; không phải thiết kế tự do như NotebookLM.

## Dữ liệu riêng

Xưởng không đọc ghi chú học sinh. Không gửi danh sách lớp sang API soạn bài; chỉ dùng tên trong danh sách tại máy để chặn nội dung có tên học sinh trước khi gửi/xuất. Không đưa phân tầng theo tên vào file. Bộ chặn cũng nhận các cụm ghi chú sức khỏe/tâm lý, nhưng không thay thế việc đọc lại nội dung: tên ngoài danh sách và cách diễn đạt gián tiếp vẫn cần giáo viên kiểm tra. Gói NotebookLM chỉ được tải về máy, người dùng tự kiểm tra rồi tải lên dịch vụ.

## Âm thanh và video — người dùng tạm hoãn

Chưa có route TTS, chưa gọi model trả phí, chưa xin thêm quyền Google. Chưa bật ô chọn âm thanh/video. Video dự kiến ghép slide và âm thanh trong trình duyệt; không chạy ffmpeg trên Vercel.

Đối chiếu ngày 21/10/2026: [hướng dẫn TTS](https://ai.google.dev/gemini-api/docs/speech-generation) liệt kê `gemini-3.8-flash-lite-tts`. [Bảng giá chính thức](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.8-flash-lite-tts) tại lúc kiểm tra ghi mức Standard đến 31/12/2026 là 0,50 USD/triệu token chữ đầu vào và 6 USD/triệu token âm thanh đầu ra; 25 token âm thanh/giây. Từ 01/01/2027 hai đơn giá này tăng gấp đôi.

Ước tính tự tính, giả sử 1.000 token chữ và âm thanh dài 120–180 giây: 3.000–4.500 token âm thanh, khoảng **0,0185–0,0275 USD/lần**. Nếu 20 lần/giáo viên/tháng: 10 giáo viên khoảng **3,70–5,50 USD/tháng**; 100 giáo viên khoảng **37–55 USD/tháng**. Chưa tính soạn lời, giáo án, lần thử lại, thuế hay hạ tầng. Video ghép tại máy dùng lại file âm thanh; không thêm phí model video. Hạn mức miễn phí không được dùng làm cam kết chi phí.

Ngày 21/10/2026 người dùng xác nhận tạm hoãn âm thanh/video. Cần người quản lý duyệt model và chi phí trước khi viết/bật luồng này. Khi duyệt, cấu hình vai `tts` tập trung trong `src/lib/ai/models.ts`, dùng `GEMINI_MODEL_TTS`, giữ nguyên các model chữ hiện có.
