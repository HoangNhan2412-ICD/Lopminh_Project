'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  Users, 
  Calendar, 
  Filter, 
  ClipboardPaste, 
  Sparkles, 
  CheckCircle2, 
  Pin, 
  ArrowRight, 
  Laptop, 
  Smartphone, 
  Apple, 
  Clock, 
  Volume2,
  Trash2,
  Plus
} from 'lucide-react';
import { 
  ZaloMessageItem, 
  ZaloCategory, 
  ZaloBridge, 
  initialZaloMessages, 
  ZaloDailyDigest 
} from '@/lib/zalo-bridge';
import { SoundService } from '@/lib/soundService';

interface ZaloUnifiedFeedProps {
  onSyncStudentNotice?: (studentName: string, actionNote: string) => void;
}

export const ZaloUnifiedFeed: React.FC<ZaloUnifiedFeedProps> = ({ onSyncStudentNotice }) => {
  const [messages, setMessages] = useState<ZaloMessageItem[]>(initialZaloMessages);
  const [filter, setFilter] = useState<ZaloCategory | 'all'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'digest' | 'ios_paste'>('feed');
  const [digestSession, setDigestSession] = useState<'morning_11h30' | 'afternoon_17h00'>('morning_11h30');
  
  // iOS Rapid-Paste Zone state
  const [pasteInput, setPasteInput] = useState('');
  const [pasteSender, setPasteSender] = useState('Phụ huynh gửi qua Zalo');
  const [pasteSuccessNotice, setPasteSuccessNotice] = useState('');

  const filteredMessages = messages.filter(
    (m) => filter === 'all' || m.category === filter
  );

  const urgentCount = messages.filter((m) => m.category === 'urgent_bgh').length;
  const deadlineCount = messages.filter((m) => m.category === 'deadline').length;
  const studentChangeCount = messages.filter((m) => m.category === 'student_change').length;

  const currentDigest = ZaloBridge.generateDailyDigest(messages, digestSession);

  // Handle iOS Clipboard Paste
  const handleClipboardPaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setPasteInput(text);
          SoundService.playSoftPop();
        }
      }
    } catch {
      // ignore clipboard permission error
    }
  };

  const handleProcessPastedText = () => {
    if (!pasteInput.trim()) return;

    const parsed = ZaloBridge.parseZaloPayload(
      pasteInput,
      pasteSender,
      false,
      'ios_rapid_paste'
    );

    if (parsed) {
      setMessages((prev) => [parsed, ...prev]);
      setPasteSuccessNotice(
        `Đã lọc sạch tạp âm và phân loại thành công: "${parsed.cleanContent.slice(0, 50)}..."`
      );
      setPasteInput('');
      SoundService.playSuccessChime();

      if (parsed.extractedStudentName && onSyncStudentNotice) {
        onSyncStudentNotice(parsed.extractedStudentName, parsed.cleanContent);
      }
    } else {
      setPasteSuccessNotice('Tin nhắn toàn bộ là lời chào hỏi/sticker lịch sự. AI đã tự động lọc bỏ.');
    }

    setTimeout(() => setPasteSuccessNotice(''), 5000);
  };

  // Simulate incoming Chrome Extension payload
  const handleSimulateExtension = () => {
    const raw = '[TIN MỚI - Chrome Extension] Kính gửi cô Hoa, phòng GD thông báo bổ sung danh sách học sinh tham gia kỳ thi chọn HSG cấp trường vào trước 11h sáng mai.';
    const parsed = ZaloBridge.parseZaloPayload(raw, 'Bộ Phận Khảo Thí', true, 'chrome_extension');
    if (parsed) {
      setMessages((prev) => [parsed, ...prev]);
      SoundService.playSchoolBell();
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Architecture Status Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#1E3A2F] via-[#284B3D] to-[#14271F] text-white shadow-md border-2 border-amber-500/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-emerald-700/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xl sm:text-2xl font-bold font-sans text-amber-200">
                Bộ Lọc Zalo Thông Minh & Thông Báo Khẩn (Tri-Platform)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100">
              Tự động gom và lọc 100+ tin nhắn phụ huynh & BGH thành thông tin sư phạm cô đọng, triệt tiêu tạp âm chào hỏi.
            </p>
          </div>

          {/* Tri-Platform Architecture Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/15 text-xs font-semibold flex items-center gap-1.5 border border-white/20">
              <Laptop className="w-3.5 h-3.5 text-sky-300" />
              <span>Chrome / Cốc Cốc Web</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/15 text-xs font-semibold flex items-center gap-1.5 border border-white/20">
              <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
              <span>Android Listener</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/15 text-xs font-semibold flex items-center gap-1.5 border border-white/20">
              <Apple className="w-3.5 h-3.5 text-amber-300" />
              <span>iOS Dán Nhanh</span>
            </span>
          </div>
        </div>

        {/* Quick Simulation Trigger */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-amber-100">
              Đang hoạt động: Đã chặn 42 tin nhắn chúc mừng/sticker rác hôm nay.
            </span>
          </div>
          <button
            onClick={handleSimulateExtension}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#14271F] font-bold transition-all shadow-xs"
          >
            + Giả lập tin nhắn Chrome Extension
          </button>
        </div>
      </div>

      {/* Sub Tabs: Feed vs Daily Digest vs iOS Paste */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border-2 border-[#E8E2D2] shadow-xs">
        <button
          onClick={() => {
            setActiveSubTab('feed');
            SoundService.playSoftPop();
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'feed'
              ? 'bg-[#1E3A2F] text-amber-300 shadow-xs'
              : 'text-[#4A5D52] hover:bg-amber-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Tin Đã Lọc Thông Minh ({messages.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('digest');
            SoundService.playSoftPop();
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'digest'
              ? 'bg-[#1E3A2F] text-amber-300 shadow-xs'
              : 'text-[#4A5D52] hover:bg-amber-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Bản Tin Vắn 2 Buổi (11h30 & 17h00)</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('ios_paste');
            SoundService.playSoftPop();
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'ios_paste'
              ? 'bg-[#1E3A2F] text-amber-300 shadow-xs'
              : 'text-[#4A5D52] hover:bg-amber-50'
          }`}
        >
          <ClipboardPaste className="w-4 h-4 text-amber-600" />
          <span>Khu Vực Dán Nhanh Zalo (iOS/iPad)</span>
        </button>
      </div>

      {/* VIEW 1: Filtered Messages Feed */}
      {activeSubTab === 'feed' && (
        <div className="space-y-4">
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-[#1E3A2F] text-amber-300'
                  : 'bg-white text-gray-700 border border-[#E8E2D2]'
              }`}
            >
              Tất cả ({messages.length})
            </button>
            <button
              onClick={() => setFilter('urgent_bgh')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'urgent_bgh'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Chỉ đạo khẩn BGH ({urgentCount})</span>
            </button>
            <button
              onClick={() => setFilter('student_change')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'student_change'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Biến động học sinh ({studentChangeCount})</span>
            </button>
            <button
              onClick={() => setFilter('deadline')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'deadline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Hạn nộp & Sổ sách ({deadlineCount})</span>
            </button>
          </div>

          {/* Messages Cards */}
          <div className="space-y-3">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-5 rounded-2xl bg-white border-2 transition-all shadow-xs flex flex-col justify-between ${
                  msg.priorityScore === 3
                    ? 'border-rose-400 bg-rose-50/20'
                    : msg.category === 'student_change'
                    ? 'border-amber-300'
                    : 'border-[#E8E2D2]'
                }`}
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-[#F0EAE0]">
                    <div className="flex items-center gap-2">
                      {msg.isPinned && (
                        <span className="p-1 rounded-md bg-rose-100 text-rose-700" title="Tin nhắn ghim">
                          <Pin className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <strong className="text-sm text-[#1E3A2F]">
                        {msg.senderName}
                      </strong>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {msg.senderRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8C7A68]">
                        {msg.timestamp}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          msg.priorityScore === 3
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {msg.category === 'urgent_bgh' ? 'Chỉ đạo khẩn' : msg.category === 'student_change' ? 'Biến động HS' : 'Hạn nộp'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#1E2922] font-sans leading-relaxed mb-3">
                    {msg.cleanContent}
                  </p>

                  {/* Action recommendation */}
                  {msg.actionRequired && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        <span><strong>Gợi ý Bé Bảng: </strong>{msg.actionRequired}</span>
                      </div>
                      {msg.deadlineDate && (
                        <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200 flex-shrink-0">
                          Hạn: {msg.deadlineDate}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: 2-Times-Daily Digest */}
      {activeSubTab === 'digest' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-[#E8E2D2] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE0]">
            <div>
              <h4 className="font-sans font-bold text-xl text-[#1E3A2F]">
                {currentDigest.sessionTitle}
              </h4>
              <p className="text-xs text-[#5C6E64]">
                Tự động tổng hợp lúc 11h30 (sau giờ học sáng) và 17h00 (trước khi giáo viên rời trường).
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#E8E2D2]">
              <button
                onClick={() => setDigestSession('morning_11h30')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  digestSession === 'morning_11h30'
                    ? 'bg-[#1E3A2F] text-amber-300'
                    : 'text-gray-700 hover:bg-white'
                }`}
              >
                Bản tin trưa 11h30
              </button>
              <button
                onClick={() => setDigestSession('afternoon_17h00')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  digestSession === 'afternoon_17h00'
                    ? 'bg-[#1E3A2F] text-amber-300'
                    : 'text-gray-700 hover:bg-white'
                }`}
              >
                Bản tin chiều 17h00
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Digest Summary */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300">
              <h5 className="font-bold text-sm text-emerald-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Tóm tắt tình hình lớp học:</span>
              </h5>
              <ul className="space-y-2 text-xs sm:text-sm text-emerald-900">
                {currentDigest.summaryBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300">
              <h5 className="font-bold text-sm text-amber-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Việc cần cô lưu ý:</span>
              </h5>
              <ul className="space-y-2 text-xs sm:text-sm text-amber-900">
                {currentDigest.urgentActionItems.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-700 mt-1 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: iOS Secure Rapid-Paste Zone */}
      {activeSubTab === 'ios_paste' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-[#E8E2D2] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE0]">
            <div>
              <h4 className="font-sans font-bold text-xl text-[#1E3A2F] flex items-center gap-2">
                <Apple className="w-5 h-5 text-gray-800" />
                <span>Khu Vực Dán Nhanh Zalo (iOS / iPad Sandbox Fallback)</span>
              </h4>
              <p className="text-xs text-[#5C6E64]">
                Trên iPhone hoặc iPad, thầy cô chỉ cần sao chép (Copy) tin nhắn trên Zalo, sau đó bấm nút &ldquo;Dán từ Clipboard&rdquo; bên dưới.
              </p>
            </div>

            <button
              onClick={handleClipboardPaste}
              className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#1E3A2F] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ClipboardPaste className="w-4 h-4 text-amber-700" />
              <span>Dán từ bộ nhớ tạm (Clipboard)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5E53] uppercase mb-1.5">
              Nội dung tin nhắn Zalo cần xử lý
            </label>
            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder="Dán toàn bộ tin nhắn Zalo vào đây (kể cả lời chào, emoji, sticker, AI sẽ tự động thanh lọc)..."
              rows={4}
              className="w-full p-4 rounded-2xl border-2 border-[#E8E2D2] text-sm text-[#1E3A2F] focus:border-[#1E3A2F] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#55695C] font-semibold">Người gửi:</span>
              <input
                type="text"
                value={pasteSender}
                onChange={(e) => setPasteSender(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E8E2D2] text-xs text-[#1E3A2F]"
              />
            </div>

            <button
              onClick={handleProcessPastedText}
              disabled={!pasteInput.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1E3A2F] hover:bg-[#2A4F40] text-amber-300 font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Lọc Tạp Âm & Đồng Bộ Ngay</span>
            </button>
          </div>

          {pasteSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{pasteSuccessNotice}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
