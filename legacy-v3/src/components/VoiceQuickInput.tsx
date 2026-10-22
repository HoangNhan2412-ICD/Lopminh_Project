'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, CheckCircle2, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { SpeechService } from '@/lib/speechService';
import { parseVietnameseClassroomVoice, ParsedVoiceAction } from '@/lib/voiceParser';
import { Student } from '@/types/student';

interface VoiceQuickInputProps {
  students: Student[];
  onApplyAction: (action: ParsedVoiceAction) => void;
  externalTrigger?: boolean;
}

export const VoiceQuickInput: React.FC<VoiceQuickInputProps> = ({
  students,
  onApplyAction,
  externalTrigger = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [parsedAction, setParsedAction] = useState<ParsedVoiceAction | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [stopHandle, setStopHandle] = useState<{ stop: () => void } | null>(null);

  const sampleTriggers = [
    'Em An nghỉ ốm sốt đến hết tuần',
    'Em Bình đạt IELTS 4.0 sau 3 tháng bứt phá',
    'Em Chi hôm nay buồn bã không tập trung',
    'Em Tâm cần cô giảng lại công thức căn bậc hai'
  ];

  const handleStartListening = () => {
    setErrorMessage('');
    setTranscript('');
    setInterimText('');
    setParsedAction(null);

    const controller = SpeechService.startVoiceRecognition(
      (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          setInterimText('');
          const parsed = parseVietnameseClassroomVoice(text, students);
          setParsedAction(parsed);
        } else {
          setInterimText(text);
        }
      },
      (err) => {
        setErrorMessage(
          err.includes('not-allowed')
            ? 'Vui lòng cho phép quyền truy cập Micro trên trình duyệt để sử dụng tính năng này.'
            : `Thông báo micro: ${err}. Thầy cô có thể dùng các câu mẫu bên dưới.`
        );
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    setStopHandle(controller);
    setIsRecording(true);
  };

  const handleStopListening = () => {
    if (stopHandle) {
      stopHandle.stop();
    }
    setIsRecording(false);
  };

  const handleApplySample = (sample: string) => {
    setTranscript(sample);
    setInterimText('');
    setErrorMessage('');
    const parsed = parseVietnameseClassroomVoice(sample, students);
    setParsedAction(parsed);
  };

  const handleConfirmAction = () => {
    if (parsedAction) {
      onApplyAction(parsedAction);
      setParsedAction(null);
      setTranscript('');
    }
  };

  return (
    <div id="voice-quick-input-section" className="bg-[#FFFFFF] rounded-2xl p-5 border-2 border-[#E8E2D2] shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Mic className="w-5 h-5 text-[#B45309]" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#1E3A2F] font-sans">
              Nhập liệu Giọng nói Tiếng Việt (Web Speech API)
            </h3>
            <p className="text-xs text-[#5C6E64]">
              Nói tự nhiên vào micro: &quot;Em An nghỉ ốm sốt&quot; hoặc &quot;Em Bình bứt phá điểm cao&quot;
            </p>
          </div>
        </div>

        {/* Start / Stop Toggle Button */}
        <div>
          {!isRecording ? (
            <button
              onClick={handleStartListening}
              className="px-4 py-2.5 rounded-xl bg-[#1E3A2F] hover:bg-[#2A4F40] text-amber-300 font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Bật Micro & Nói</span>
            </button>
          ) : (
            <button
              onClick={handleStopListening}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center gap-2 shadow-md animate-pulse transition-all"
            >
              <MicOff className="w-4 h-4" />
              <span>Dừng ghi âm</span>
            </button>
          )}
        </div>
      </div>

      {/* Recording Waveform Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 py-3 px-4 mb-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs sm:text-sm font-semibold text-amber-900">
            Đang lắng nghe cô nói... Hãy phát âm rõ tên học sinh và tình hình.
          </span>
          <div className="flex items-center gap-1 ml-2">
            <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:0.1s]" />
            <span className="w-1 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:0.3s]" />
            <span className="w-1 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      {/* Interim text during live speech */}
      {interimText && (
        <div className="p-3 mb-3 rounded-xl bg-emerald-50 text-emerald-900 text-sm italic border border-emerald-200">
          Đang nhận diện: &ldquo;{interimText}&rdquo;...
        </div>
      )}

      {/* Error / Fallback info */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 mb-3 rounded-xl bg-amber-50 text-amber-800 text-xs sm:text-sm border border-amber-200">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Structured Parsing Preview Card */}
      {parsedAction && (
        <div className="p-4 rounded-xl bg-emerald-50/80 border-2 border-emerald-400 mb-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-sm text-emerald-900">
                Bé Bảng đã hiểu thông điệp của cô:
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
              Phân loại: {parsedAction.category}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-[#55695C] font-medium">Học sinh được nhận diện: </span>
              <strong className="text-[#1E3A2F] text-base">
                {parsedAction.detectedStudentName || 'Chưa rõ học sinh'}
              </strong>
            </div>

            <div>
              <span className="text-[#55695C] font-medium">Thẻ trạng thái mới: </span>
              <span className="inline-block px-2 py-0.5 font-bold rounded-md bg-amber-200 text-amber-900 ml-1">
                {parsedAction.suggestedBadgeText}
              </span>
            </div>

            <div className="sm:col-span-2 bg-white/70 p-2.5 rounded-lg border border-emerald-200">
              <span className="font-semibold text-emerald-950">Tác động sư phạm tự động: </span>
              <span className="text-emerald-900">{parsedAction.suggestedImpact}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => setParsedAction(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-white transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmAction}
              className="px-4 py-2 rounded-xl bg-[#1E3A2F] hover:bg-[#2A4F40] text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cập nhật ngay vào Sổ theo dõi</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Testing Samples for Senior / Non-mic environment */}
      <div className="pt-2 border-t border-[#F0EAE0]">
        <div className="flex items-center gap-1.5 text-xs text-[#526358] mb-2 font-medium">
          <span>Hoặc nhấp 1 chạm vào câu mẫu để thử nghiệm nhanh:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleTriggers.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleApplySample(sample)}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#F7F4EB] hover:bg-amber-100 hover:text-amber-900 text-[#405046] border border-[#DDD5C5] transition-colors flex items-center gap-1.5"
            >
              <span>{sample}</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
