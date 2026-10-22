'use client';

import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { SoundService } from './soundService';

/**
 * Tour hướng dẫn sử dụng tương tác từng bước cho giáo viên (Spotlight Onboarding)
 * Sử dụng driver.js với phong cách sư phạm thân thiện, chỉ dẫn cụ thể từng tính năng.
 */
export function startSpotlightTour(): void {
  SoundService.playSoftPop();

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(20, 39, 31, 0.75)',
    nextBtnText: 'Tiếp tục ➔',
    prevBtnText: '⬅ Quay lại',
    doneBtnText: 'Hoàn tất & Bắt đầu dạy 🎉',
    progressText: 'Bước {{current}} / {{total}}',
    steps: [
      {
        element: '#header-brand',
        popover: {
          title: '🌸 Chào mừng Thầy Cô đến với Lớp Mình',
          description: 'Nền tảng trợ lý sư phạm thấu cảm (lopminhedu.vn) được thiết kế riêng cho giáo viên Việt Nam, giảm tải tối đa áp lực hành chính và hỗ trợ thấu hiểu từng học sinh.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#macro-tab-today-class',
        popover: {
          title: '📋 Tab 1: Lớp Mình Hôm Nay (GVCN & GVBM)',
          description: 'Quản lý sĩ số, tình hình sức khỏe và phân hóa năng lực học sinh. Hỗ trợ chuyển đổi linh hoạt giữa lớp Chủ nhiệm và các lớp Bộ môn.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#voice-quick-input-section',
        popover: {
          title: '🎙️ Nhập Liệu Giọng Nói Tiếng Việt (Hands-Free)',
          description: 'Thầy cô chỉ cần bấm micro và nói tự nhiên (ví dụ: "Em An nghỉ ốm sốt đến hết tuần"). Hệ thống tự động bóc tách thực thể và đồng bộ tức thì vào Kế hoạch bài dạy.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#macro-tab-lesson-planner',
        popover: {
          title: '📑 Tab 2: Soạn Bài Số Chuẩn Công Văn 5512',
          description: 'Tự động tạo bài dạy đủ 4 hoạt động bắt buộc, phân hóa 2 tầng năng lực và xuất file 1-chạm sang Word, PowerPoint 16:9, Sơ đồ tư duy và Quizizz.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#macro-tab-zalo-feed',
        popover: {
          title: '💬 Tab 3: Bộ Lọc Zalo Thông Minh 3 Nền Tảng',
          description: 'Tự động loại bỏ tin nhắn rác, nhặt tin nhắn ghim của Ban giám hiệu và tổng hợp Bản tin vắn 2 buổi (11h30 trưa & 17h00 chiều).',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#macro-tab-teacher-sanctuary',
        popover: {
          title: '☕ Tab 4: Góc Cởi Bỏ Chiếc Áo Giáo Viên',
          description: 'Không gian riêng tư, bảo mật 100% để thầy cô tâm sự giải tỏa căng thẳng sau giờ dạy, kèm Trạm song ngữ và Kỹ năng số 2 phút.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#btn-switch-tenant',
        popover: {
          title: '🏫 Phân Vùng Đa Trường (Multi-Tenant)',
          description: 'Chuyển đổi tức thì giữa các tài khoản giáo viên mẫu hoặc đăng nhập Google OAuth. Dữ liệu học sinh và giáo án được cách ly tuyệt đối.',
          side: 'bottom',
          align: 'end'
        }
      }
    ],
    onDestroyed: () => {
      SoundService.playSuccessChime();
    }
  });

  driverObj.drive();
}
