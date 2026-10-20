'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Sparkles, HelpCircle, Coffee } from 'lucide-react';
import { TeacherProfile } from '@/types/teacher';
import { SpeechService } from '@/lib/speechService';
import { SoundService } from '@/lib/soundService';

export type MascotEmotion = 'welcoming' | 'thinking' | 'happy';

interface MascotBebangProps {
  teacher: TeacherProfile;
  onVoiceTrigger: () => void;
  onOpenGuideModal?: () => void;
  isListening?: boolean;
  customPromptMessage?: string;
  initialEmotion?: MascotEmotion;
}

export const MascotBebang: React.FC<MascotBebangProps> = ({
  teacher,
  onVoiceTrigger,
  onOpenGuideModal,
  isListening = false,
  customPromptMessage,
  initialEmotion = 'welcoming'
}) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [emotion, setEmotion] = useState<MascotEmotion>(initialEmotion);

  const proactivePrompts = [
    `Hôm nay lớp 9A có em nào vắng hay có chuyển biến mới không ${teacher.salutation} Hoa?`,
    `Hôm nay tiết 3 có làm ${teacher.salutation} mệt không? ${teacher.salutation} nhớ uống nước ấm nhé!`,
    `Em An đang nghỉ ốm sốt, Bé Bảng đã tự động chuẩn bị phiếu bù bài cho cô rồi ạ!`,
    `Em Bình vừa đạt IELTS 4.0 và bứt phá, cô bấm vào Soạn Bài Số để xem bài tập mở rộng nhé!`,
    `Bé Bảng vừa gom 14 tin nhắn Zalo của phụ huynh thành Bản Tin Vắn trưa nay cho cô rồi ạ!`
  ];

  const activeMessage = customPromptMessage || proactivePrompts[currentPromptIndex];

  useEffect(() => {
    if (isListening) {
      setEmotion('thinking');
    } else {
      setEmotion('welcoming');
    }
  }, [isListening]);

  // Rotate prompts gently
  useEffect(() => {
    if (customPromptMessage) return;
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % proactivePrompts.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [customPromptMessage, proactivePrompts.length]);

  const handleReadAloud = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await SpeechService.speakText(activeMessage, 'vi-VN', 0.95);
    } catch {
      // speech synthesis handled gracefully
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-[#1E3A2F] via-[#244638] to-[#14271F] rounded-3xl p-5 sm:p-6 text-white shadow-xl border-4 border-[#8B4513] overflow-hidden">
      {/* Decorative Chalk Dust Texture / Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Animated Mascot "Bé Bảng" Avatar */}
        <div className="relative flex-shrink-0 group">
          <div
            onClick={() => {
              setEmotion('happy');
              SoundService.playSoftPop();
              setTimeout(() => setEmotion('welcoming'), 2000);
            }}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#14271F] border-4 border-[#C88B46] shadow-2xl flex flex-col items-center justify-center relative cursor-pointer transform transition-transform duration-300 hover:scale-105"
            title="Nhấp vào Bé Bảng để xem biểu cảm!"
          >
            {/* Academic Cap */}
            <div className="absolute -top-4 -right-2 text-2xl filter drop-shadow">
              🎓
            </div>

            {/* Eyes based on emotion */}
            <div className="flex items-center gap-5 mb-2">
              {emotion === 'thinking' ? (
                <>
                  <div className="w-3.5 h-1 bg-amber-300 rounded-full animate-bounce" />
                  <div className="w-3.5 h-1 bg-amber-300 rounded-full animate-bounce" />
                </>
              ) : emotion === 'happy' ? (
                <>
                  <div className="w-3.5 h-3 border-t-3 border-amber-300 rounded-t-full" />
                  <div className="w-3.5 h-3 border-t-3 border-amber-300 rounded-t-full" />
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-200 shadow-sm animate-pulse" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-200 shadow-sm animate-pulse" />
                </>
              )}
            </div>

            {/* Chalk Smile */}
            <div className={`border-b-3 border-amber-300 rounded-b-full transition-all ${
              emotion === 'happy' ? 'w-10 h-4' : 'w-8 h-3'
            }`} />

            {/* Glasses */}
            <div className="absolute top-9 flex items-center justify-center opacity-85">
              <div className="w-5 h-4 border-2 border-amber-200/90 rounded-full mx-1" />
              <div className="w-2 h-0.5 bg-amber-200/90 -mt-1" />
              <div className="w-5 h-4 border-2 border-amber-200/90 rounded-full mx-1" />
            </div>

            {/* Name Tag */}
            <div className="absolute -bottom-2.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-[#14271F] text-[11px] font-extrabold uppercase tracking-wider shadow">
              {emotion === 'thinking' ? 'Đang nghĩ' : emotion === 'happy' ? 'Rất vui' : 'Bé Bảng'}
            </div>
          </div>

          {/* Quick Voice Trigger Floating Badge */}
          <button
            onClick={() => {
              SoundService.playSoftPop();
              onVoiceTrigger();
            }}
            className={`absolute -bottom-2 -right-2 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg border-2 ${
              isListening
                ? 'bg-rose-500 border-white text-white animate-bounce'
                : 'bg-amber-400 hover:bg-amber-300 border-[#14271F] text-[#14271F] hover:scale-110'
            }`}
            title="Nhấn để nói ngay với Bé Bảng bằng tiếng Việt"
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Mascot Proactive Speech Bubble & Guidance */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trợ lý sư phạm thân thương • V2 Tích hợp Zalo & Đa công cụ</span>
          </div>

          {/* Dialog Bubble */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner mb-3">
            <p className="text-base sm:text-lg font-medium text-amber-50 leading-relaxed font-sans">
              &ldquo;{activeMessage}&rdquo;
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <button
              onClick={() => {
                SoundService.playSoftPop();
                onVoiceTrigger();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-300 text-[#14271F]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isListening ? 'Đang lắng nghe cô nói...' : 'Bấm vào đây để nói'}</span>
            </button>

            <button
              onClick={handleReadAloud}
              disabled={isPlayingAudio}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all"
              title="Nghe Bé Bảng đọc to lời dặn bằng giọng nói tiếng Việt"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-amber-300 animate-spin' : ''}`} />
              <span>{isPlayingAudio ? 'Đang đọc...' : 'Nghe Bé Bảng đọc'}</span>
            </button>

            {onOpenGuideModal && (
              <button
                onClick={() => {
                  SoundService.playSoftPop();
                  onOpenGuideModal();
                }}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-400/40 transition-all"
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <span>Hướng dẫn 1 chạm</span>
              </button>
            )}

            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-200/90 ml-1">
              <Coffee className="w-3.5 h-3.5 text-amber-300" />
              <span>&quot;Cô cứ thong thả nói, mọi việc để Bé Bảng lo!&quot;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
