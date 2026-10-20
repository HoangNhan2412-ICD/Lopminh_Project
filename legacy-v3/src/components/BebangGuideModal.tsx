'use client';

import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Volume2, 
  Sparkles, 
  QrCode, 
  Laptop, 
  Smartphone, 
  Apple, 
  Tv, 
  CheckCircle2, 
  ArrowRight,
  FileSpreadsheet,
  Network
} from 'lucide-react';
import { SpeechService } from '@/lib/speechService';
import { SoundService } from '@/lib/soundService';

export type GuideTopicKey = 'quizizz' | 'zalo' | 'pptx_mindmap';

interface BebangGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: GuideTopicKey;
}

export const BebangGuideModal: React.FC<BebangGuideModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'quizizz'
}) => {
  const [activeTopic, setActiveTopic] = useState<GuideTopicKey>(initialTopic);
  const [zaloSubTab, setZaloSubTab] = useState<'desktop' | 'android' | 'ios'>('desktop');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const handleReadAloud = async (text: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await SpeechService.speakText(text, 'vi-VN', 0.95);
    } catch {
      // ignore
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border-4 border-[#8B4513] my-8 max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header with Mascot Avatar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE0]">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#14271F] border-3 border-[#C88B46] text-amber-300 flex flex-col items-center justify-center shadow-md relative">
              <span className="text-xl">🎓</span>
              <div className="w-6 h-2 border-b-2 border-amber-300 rounded-b-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-xl sm:text-2xl text-[#1E3A2F]">
                  Bé Bảng Hướng Dẫn Tận Tình
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  Senior-Friendly
                </span>
              </div>
              <p className="text-xs text-[#5C6E64]">
                Thầy cô không cần ghi nhớ kỹ thuật – Cứ làm từng bước theo tranh hướng dẫn to rõ dưới đây.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              SoundService.playSoftPop();
              onClose();
            }}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 3 Main Topic Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-5">
          <button
            onClick={() => {
              setActiveTopic('quizizz');
              SoundService.playSoftPop();
            }}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
              activeTopic === 'quizizz'
                ? 'bg-amber-50/70 border-[#1E3A2F] shadow-xs'
                : 'bg-[#FAF8F5] border-[#E8E2D2] hover:bg-white'
            }`}
          >
            <QrCode className="w-5 h-5 text-purple-700 flex-shrink-0" />
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#1E3A2F]">1. Quizizz & Mã QR</div>
              <div className="text-[11px] text-[#6B7D72]">Tải Excel & Quét mã</div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTopic('zalo');
              SoundService.playSoftPop();
            }}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
              activeTopic === 'zalo'
                ? 'bg-amber-50/70 border-[#1E3A2F] shadow-xs'
                : 'bg-[#FAF8F5] border-[#E8E2D2] hover:bg-white'
            }`}
          >
            <Smartphone className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#1E3A2F]">2. Thiết Lập Zalo</div>
              <div className="text-[11px] text-[#6B7D72]">Máy tính, Android, iOS</div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTopic('pptx_mindmap');
              SoundService.playSoftPop();
            }}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
              activeTopic === 'pptx_mindmap'
                ? 'bg-amber-50/70 border-[#1E3A2F] shadow-xs'
                : 'bg-[#FAF8F5] border-[#E8E2D2] hover:bg-white'
            }`}
          >
            <Tv className="w-5 h-5 text-blue-700 flex-shrink-0" />
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#1E3A2F]">3. Slide & Sơ Đồ Tư Duy</div>
              <div className="text-[11px] text-[#6B7D72]">Chiếu màn hình lớp học</div>
            </div>
          </button>
        </div>

        {/* TOPIC 1: Quizizz & QR Code Guide */}
        {activeTopic === 'quizizz' && (
          <div className="p-6 rounded-3xl bg-[#FAF8F5] border-2 border-[#E8E2D2] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-900 uppercase">
                Hướng Dẫn Tải Excel & Nhả Mã QR Quizizz
              </span>
              <button
                onClick={() => handleReadAloud('Bước 1: Thầy cô bấm Tải file câu hỏi Excel do Lớp Mình vừa tạo. Bước 2: Mở trang Quizizz, chọn Import from spreadsheet và thả file vào. Bước 3: Sao chép link bài dán vào Lớp Mình để nhận mã QR.')}
                disabled={isPlayingAudio}
                className="text-xs px-3 py-1.5 rounded-xl bg-white border border-[#E8E2D2] text-purple-800 font-bold flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingAudio ? 'Đang đọc...' : 'Bé Bảng đọc to'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D2] flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-sm text-[#1E3A2F] block mb-0.5">
                    Tải tệp Excel câu hỏi tự động:
                  </strong>
                  <p className="text-xs sm:text-sm text-[#4E6155] leading-relaxed">
                    Ở tab <strong>Soạn Bài Số</strong>, bấm nút <strong>&ldquo;Tải file Excel Quizizz&rdquo;</strong>. Hệ thống sẽ tự động tạo sẵn 5 câu hỏi trắc nghiệm đúng chuẩn cột mẫu Quizizz.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D2] flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-sm text-[#1E3A2F] block mb-0.5">
                    Nạp vào Quizizz trong 3 giây:
                  </strong>
                  <p className="text-xs sm:text-sm text-[#4E6155] leading-relaxed">
                    Mở trang web <em>quizizz.com</em> -&gt; Bấm Tạo bài mới -&gt; Chọn <strong>&ldquo;Import from spreadsheet&rdquo;</strong> và kéo thả file Excel vừa tải vào. Toàn bộ câu hỏi và đáp án sẽ được nạp tự động, cô không phải gõ lại một chữ nào!
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D2] flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-sm text-[#1E3A2F] block mb-0.5">
                    Nhận mã QR để học sinh quét tại lớp:
                  </strong>
                  <p className="text-xs sm:text-sm text-[#4E6155] leading-relaxed">
                    Bấm &ldquo;Bắt đầu bài kiểm tra trực tiếp&rdquo; trên Quizizz, copy link và dán vào ô trên Lớp Mình. Bé Bảng sẽ vẽ ngay một mã QR to rõ nét để chiếu lên máy chiếu cho cả lớp quét bằng điện thoại/máy tính bảng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOPIC 2: Zalo Setup Guide for Teachers */}
        {activeTopic === 'zalo' && (
          <div className="p-6 rounded-3xl bg-[#FAF8F5] border-2 border-[#E8E2D2] space-y-4">
            {/* Platform Sub-tabs */}
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E8E2D2]">
              <button
                onClick={() => setZaloSubTab('desktop')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  zaloSubTab === 'desktop'
                    ? 'bg-[#1E3A2F] text-amber-300'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dành cho Máy tính (Extension)
              </button>
              <button
                onClick={() => setZaloSubTab('android')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  zaloSubTab === 'android'
                    ? 'bg-[#1E3A2F] text-amber-300'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dành cho Android (Thông báo)
              </button>
              <button
                onClick={() => setZaloSubTab('ios')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  zaloSubTab === 'ios'
                    ? 'bg-[#1E3A2F] text-amber-300'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dành cho iPhone/iPad (Dán nhanh)
              </button>
            </div>

            {zaloSubTab === 'desktop' && (
              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D2] space-y-2 text-xs sm:text-sm">
                <strong className="text-base text-[#1E3A2F] block">
                  Cài tiện ích Lớp Mình trên Chrome hoặc Cốc Cốc (1 Click):
                </strong>
                <p className="text-[#4E6155] leading-relaxed">
                  1. Mở trình duyệt Chrome hoặc Cốc Cốc trên máy tính của trường.<br />
                  2. Cài tiện ích &ldquo;Lớp Mình Zalo Companion&rdquo;.<br />
                  3. Khi mở <em>chat.zalo.me</em>, tiện ích sẽ tự động nhận diện tin nhắn ghim từ BGH và chuyển tiếp về bảng điều khiển của cô, loại bỏ mọi tin chào hỏi chúc tụng.
                </p>
              </div>
            )}

            {zaloSubTab === 'android' && (
              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D2] space-y-2 text-xs sm:text-sm">
                <strong className="text-base text-[#1E3A2F] block">
                  Bật quyền đọc thông báo trên điện thoại Samsung, Oppo, Xiaomi:
                </strong>
                <p className="text-[#4E6155] leading-relaxed">
                  1. Mở Cài đặt trên điện thoại -&gt; Chọn &ldquo;Ứng dụng &amp; Thông báo&rdquo;.<br />
                  2. Bật quyền cho ứng dụng Lớp Mình: &ldquo;Quyền truy cập thông báo&rdquo;.<br />
                  3. Điện thoại sẽ tự động gom các thông báo Zalo lớp học và tổng hợp thành <strong>Bản tin trưa 11h30</strong> và <strong>Bản tin chiều 17h00</strong>.
                </p>
              </div>
            )}

            {zaloSubTab === 'ios' && (
              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D2] space-y-2 text-xs sm:text-sm">
                <strong className="text-base text-[#1E3A2F] block">
                  Dán nhanh 3 giây trên iPhone hoặc iPad:
                </strong>
                <p className="text-[#4E6155] leading-relaxed">
                  Vì chính sách bảo mật của Apple, thầy cô chỉ cần:<br />
                  1. Nhấn giữ tin nhắn dài trên Zalo -&gt; Bấm <strong>Sao chép</strong>.<br />
                  2. Quay lại Lớp Mình ở Tab <strong>Bộ Lọc Zalo</strong> -&gt; Bấm nút <strong>&ldquo;Dán từ Clipboard&rdquo;</strong>.<br />
                  3. Hệ thống sẽ tự động lọc sạch tạp âm và phân loại trong nháy mắt!
                </p>
              </div>
            )}
          </div>
        )}

        {/* TOPIC 3: PowerPoint & Mindmap Guide */}
        {activeTopic === 'pptx_mindmap' && (
          <div className="p-6 rounded-3xl bg-[#FAF8F5] border-2 border-[#E8E2D2] space-y-4 text-xs sm:text-sm">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-900 uppercase">
              Hướng Dẫn Chiếu Slide & Sơ Đồ Tư Duy
            </span>

            <div className="p-4 rounded-2xl bg-white border border-[#E8E2D2] space-y-2">
              <strong className="text-base text-[#1E3A2F] block">
                Mở bài giảng điện tử PowerPoint (.pptx):
              </strong>
              <p className="text-[#4E6155] leading-relaxed">
                Tệp PowerPoint do Lớp Mình xuất ra đã có sẵn định dạng chuẩn 16:9, màu nền xanh bảng phấn chống mỏi mắt cho học sinh ngồi xa, đầy đủ 4 hoạt động Khởi động - Hình thành - Luyện tập - Vận dụng. Cô chỉ cần bấm phím <strong>F5</strong> trên bàn phím là trình chiếu ngay!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8E2D2] space-y-2">
              <strong className="text-base text-[#1E3A2F] block">
                Sử dụng Sơ đồ tư duy (Mindmap) trên màn hình tương tác:
              </strong>
              <p className="text-[#4E6155] leading-relaxed">
                Tại mục Sơ đồ tư duy trong Soạn Bài Số, cô có thể bấm nút <strong>&ldquo;Toàn màn hình&rdquo;</strong> để biến toàn bộ màn hình máy chiếu thành sơ đồ kiến thức. Cô dùng ngón tay hoặc chuột nhấp vào các nút tròn để mở dần kiến thức bài dạy, giúp học sinh tò mò và dễ tiếp thu hơn.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-[#F0EAE0] flex items-center justify-end">
          <button
            onClick={() => {
              SoundService.playSoftPop();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1E3A2F] text-amber-300 hover:bg-[#2A4F40]"
          >
            Cô Đã Hiểu Rõ, Cảm Ơn Bé Bảng!
          </button>
        </div>
      </div>
    </div>
  );
};
