'use client';

import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Send, 
  Mic, 
  Sparkles, 
  Coffee, 
  Volume2, 
  ShieldCheck, 
  Smile, 
  Flower2,
  CheckCircle2
} from 'lucide-react';
import { TeacherProfile } from '@/types/teacher';
import { SanctuaryMessage } from '@/types/sanctuary';
import { GeminiService } from '@/lib/geminiService';
import { SpeechService } from '@/lib/speechService';
import { TenantManager } from '@/lib/tenantManager';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface UnbuttoningSpaceProps {
  teacher: TeacherProfile;
}

export const UnbuttoningSpace: React.FC<UnbuttoningSpaceProps> = ({ teacher }) => {
  const [messages, setMessages] = useState<SanctuaryMessage[]>(() => {
    return TenantManager.getChatMessages(teacher.id);
  });
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  // Sync isolated chat history whenever teacher tenant switches
  useEffect(() => {
    setMessages(TenantManager.getChatMessages(teacher.id));
  }, [teacher.id]);

  const worryTopics = [
    'Phụ huynh nhắn tin trách móc lúc nửa đêm làm tôi mất ngủ',
    'Học sinh nói chuyện riêng nhiều, tôi cảm thấy bất lực và kiệt sức',
    'Áp lực chỉ tiêu thi đua và chuẩn bị hồ sơ thanh tra quá lớn',
    'Cảm giác cô đơn khi cố gắng đổi mới phương pháp nhưng chưa ai hiểu'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    const teacherMsg: SanctuaryMessage = {
      id: `teacher-${Date.now()}`,
      sender: 'teacher',
      timestamp: 'Vừa xong',
      content: text
    };

    const updatedWithUser = [...messages, teacherMsg];
    setMessages(updatedWithUser);
    TenantManager.saveChatMessages(teacher.id, updatedWithUser);
    setInputValue('');
    setIsSending(true);

    try {
      const result = await GeminiService.answerSanctuary(text, teacher);

      const aiMsg: SanctuaryMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp: 'Vừa xong',
        content: result.response,
        pedagogicalRemedies: result.remedies,
        suggestedSelfCare: result.selfCare
      };

      const updatedWithAi = [...updatedWithUser, aiMsg];
      setMessages(updatedWithAi);
      TenantManager.saveChatMessages(teacher.id, updatedWithAi);
    } catch (err) {
      console.error('Sanctuary error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSpeak = async (msg: SanctuaryMessage) => {
    if (playingMessageId === msg.id) return;
    setPlayingMessageId(msg.id);
    try {
      await SpeechService.speakText(msg.content, 'vi-VN', 0.95);
    } catch {
      // ignore
    } finally {
      setPlayingMessageId(null);
    }
  };

  const teacherDisplayName = `${teacher.salutation} ${teacher.fullName.split(' ').pop()}`;

  return (
    <div className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-6 border-2 border-[#E8E2D2] shadow-sm flex flex-col h-[750px] max-h-[85vh]">
      {/* Header of the Sanctuary */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE0]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-bold text-xl text-[#1E3A2F]">
                Cởi Bỏ Chiếc Áo Giáo Viên
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bảo mật tuyệt đối</span>
              </span>
            </div>
            <p className="text-xs text-[#5C6E64]">
              Không gian riêng của {teacherDisplayName} ({teacher.schoolName}) – Nơi thầy cô được quyền mỏi mệt và được lắng nghe.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#8C7A68]">
          <Coffee className="w-4 h-4 text-amber-700" />
          <span>{teacher.personalInterests?.[0] || 'Trà sen & Một tách bình yên'}</span>
        </div>
      </div>

      {/* Quick Worry Topics Chips */}
      <div className="py-3 border-b border-[#F5EFE6]">
        <div className="text-xs font-bold text-[#55695C] mb-2 flex items-center gap-1.5">
          <Flower2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Những tâm tư thường gặp của thầy cô hôm nay:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {worryTopics.map((topic, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(topic)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#FBF9F5] hover:bg-rose-50 hover:text-rose-900 text-[#405046] border border-[#E3DAC8] transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 shadow-xs border ${
                  isAi
                    ? 'bg-[#FAF8F5] border-[#E8E2D2] text-[#1E3A2F]'
                    : 'bg-[#1E3A2F] border-[#14271F] text-amber-50'
                }`}
              >
                {/* Sender badge */}
                <div className="flex items-center justify-between gap-3 mb-2 pb-1 border-b border-black/5">
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-700">
                    {isAi ? 'Bé Bảng & Đồng nghiệp tri kỷ' : teacherDisplayName}
                  </span>
                  <span className="text-[11px] opacity-60">{msg.timestamp}</span>
                </div>

                {/* Content */}
                {isAi ? (
                  <div className="prose prose-sm max-w-none text-[#1E3A2F] leading-relaxed font-sans prose-p:my-1.5 prose-strong:text-[#14271F] prose-ul:my-1.5 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
                    {msg.content}
                  </p>
                )}

                {/* Pedagogical Remedies Card (If available) */}
                {msg.pedagogicalRemedies && msg.pedagogicalRemedies.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-[#E8E2D2] bg-white/70 p-3 rounded-2xl border">
                    <span className="font-bold text-xs text-emerald-950 uppercase tracking-wider block mb-1.5">
                      💡 Gợi ý giải tỏa sư phạm nhẹ nhàng:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#2A4032]">
                      {msg.pedagogicalRemedies.map((rem, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{rem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Self Care Tip */}
                {msg.suggestedSelfCare && (
                  <div className="mt-2.5 bg-rose-50/80 p-2.5 rounded-xl border border-rose-200/60 text-xs text-rose-950 flex items-start gap-2">
                    <span className="text-base">🌸</span>
                    <div>
                      <strong>Nhắn nhủ chăm sóc bản thân:</strong> {msg.suggestedSelfCare}
                    </div>
                  </div>
                )}

                {/* Audio TTS Listen Button */}
                <div className="mt-2 flex items-center justify-end">
                  <button
                    onClick={() => handleSpeak(msg)}
                    className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100 hover:text-emerald-700 transition-opacity"
                    title="Nghe giọng đọc ấm áp tiếng Việt"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{playingMessageId === msg.id ? 'Đang đọc...' : 'Nghe đọc'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-2xl border border-emerald-200 w-fit animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>Bé Bảng đang lắng nghe và suy ngẫm cùng {teacherDisplayName}...</span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="pt-3 border-t border-[#F0EAE0]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Trút bầu tâm sự cùng Bé Bảng... (${teacherDisplayName} đừng giữ trong lòng)`}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#FAF8F5] border-2 border-[#E8E2D2] text-sm text-[#1E2922] placeholder-gray-400 focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="px-4 py-3 rounded-2xl bg-[#1E3A2F] text-amber-300 font-bold text-sm flex items-center gap-1.5 hover:bg-[#2A4F40] disabled:opacity-40 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi tâm tình</span>
          </button>
        </form>
      </div>
    </div>
  );
};
