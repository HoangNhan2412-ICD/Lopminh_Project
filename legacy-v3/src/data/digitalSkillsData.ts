import { DigitalSkillGuide } from '@/types/sanctuary';

export const initialDigitalSkillGuides: DigitalSkillGuide[] = [
  {
    id: 'guide-ppt-video',
    title: 'Chèn video vào PowerPoint xem mượt mà, không lo mất mạng ở trường',
    category: 'PowerPoint',
    timeEstimate: '2 phút',
    targetSeniorLevel: 'Người mới bắt đầu',
    summary: 'Giúp thầy cô tải video sẵn về máy tính và gắn vào bài giảng, chiếu trên lớp không bao giờ bị đứng hình hay quảng cáo chen ngang.',
    goldenRule: 'Thầy cô nhớ để file Video cùng chung 1 thư mục với bài trình chiếu PowerPoint nhé!',
    steps: [
      {
        stepNumber: 1,
        title: 'Mở trang slide cần chèn',
        description: 'Bấm chọn trang slide cô muốn cho học sinh xem clip ngắn.'
      },
      {
        stepNumber: 2,
        title: 'Chọn Chèn (Insert) -> Video',
        description: 'Nhìn lên thanh menu trên cùng, bấm chữ "Insert", sau đó tìm biểu tượng cuộn phim có chữ "Video".',
        shortcutOrHint: 'Bấm: Insert -> Video -> This Device (Từ máy tính này)'
      },
      {
        stepNumber: 3,
        title: 'Chọn tệp video và bấm Chèn (Insert)',
        description: 'Chọn video đã tải về sẵn, bấm nút Insert. Video sẽ hiện ngay giữa trang slide.',
        shortcutOrHint: 'Kéo 4 góc của video để chỉnh to nhỏ cho vừa mắt'
      },
      {
        stepNumber: 4,
        title: 'Cài đặt tự động phát (Tùy chọn)',
        description: 'Bấm vào video, nhìn lên thẻ "Playback" trên cùng, ở ô "Start" chọn "Automatically" (Khi chuyển tới slide này là video tự chiếu luôn, thầy cô không cần bấm chuột).'
      }
    ]
  },
  {
    id: 'guide-zalo-qr',
    title: 'Tạo mã QR bài tập gửi nhóm Zalo để phụ huynh & học sinh quét trong 1 giây',
    category: 'QRCode',
    timeEstimate: '1.5 phút',
    targetSeniorLevel: 'Người mới bắt đầu',
    summary: 'Không cần học sinh phải gõ đường link dài ngoằng, phụ huynh chỉ cần mở Zalo bấm Quét mã là vào ngay bài tập của cô.',
    goldenRule: 'Mọi điện thoại thông minh mở Zalo đều có sẵn nút quét mã ở góc trên bên phải!',
    steps: [
      {
        stepNumber: 1,
        title: 'Lấy đường link bài tập',
        description: 'Copy (sao chép) link bài tập từ Quizizz, Google Form hoặc link tài liệu drive.'
      },
      {
        stepNumber: 2,
        title: 'Bấm nút "Tạo QR" trên Lớp Mình',
        description: 'Trên nền tảng "Lớp Mình", chỉ cần bấm tab "Soạn Bài Nhanh", mã QR tương tác đã được hệ thống tự động vẽ sẵn cực kỳ rõ nét.'
      },
      {
        stepNumber: 3,
        title: 'Lưu ảnh hoặc chụp màn hình gửi Zalo',
        description: 'Nhấp chuột phải vào mã QR chọn "Lưu hình ảnh" hoặc bấm nút Tải ảnh về, sau đó gửi ảnh vào nhóm Zalo lớp với lời dặn: "Các em mở Zalo quét mã làm bài nhé".'
      }
    ]
  },
  {
    id: 'guide-google-form',
    title: 'Tạo bài kiểm tra 15 phút tự chấm điểm trên Google Form',
    category: 'GoogleForm',
    timeEstimate: '3 phút',
    targetSeniorLevel: 'Cơ bản',
    summary: 'Thầy cô không còn phải thức đêm chấm từng bài trắc nghiệm giấy. Máy tính sẽ tự động tổng hợp điểm và xếp loại học sinh theo danh sách Excel.',
    goldenRule: 'Nhớ bật nút "Đặt làm bài kiểm tra" (Make this a quiz) trong phần Cài đặt thì máy mới tự chấm điểm được cô nhé!',
    steps: [
      {
        stepNumber: 1,
        title: 'Vào forms.google.com và chọn Tạo biểu mẫu mới',
        description: 'Đăng nhập tài khoản Gmail giáo viên, bấm dấu cộng (+) lớn màu sắc để tạo bài kiểm tra.'
      },
      {
        stepNumber: 2,
        title: 'Bật chế độ Bài kiểm tra',
        description: 'Bấm vào thẻ "Cài đặt" (Settings), gạt công tắc "Đặt làm bài kiểm tra" sang màu xanh.'
      },
      {
        stepNumber: 3,
        title: 'Thêm câu hỏi và nhập Đáp án đúng',
        description: 'Ở mỗi câu hỏi trắc nghiệm, bấm nút "Đáp án" màu xanh ở góc dưới câu hỏi, tích chọn đáp án đúng và gõ số điểm (ví dụ: 1 điểm/câu).'
      },
      {
        stepNumber: 4,
        title: 'Bấm Gửi và copy đường link',
        description: 'Bấm nút "Gửi" màu tím góc trên bên phải, bấm biểu tượng mắt xích và bấm "Rút ngắn URL" để có đường link ngắn gọn gửi học sinh.'
      }
    ]
  }
];
