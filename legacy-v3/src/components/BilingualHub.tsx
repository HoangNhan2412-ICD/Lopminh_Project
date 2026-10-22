'use client';

import React, { useState } from 'react';
import { 
  Languages, 
  Volume2, 
  Sparkles, 
  BookOpen, 
  Compass, 
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { 
  initialClassroomCommands, 
  initialBilingualTerms 
} from '@/data/bilingualData';
import { ClassroomCommand, BilingualTerm } from '@/types/sanctuary';
import { SpeechService } from '@/lib/speechService';

export const BilingualHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'commands' | 'terms'>('commands');
  const [selectedSubject, setSelectedSubject] = useState<string>('Toan');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredTerms = initialBilingualTerms.filter(
    (t) => selectedSubject === 'All' || t.subject === selectedSubject
  );

  const handlePronounce = async (text: string, id: string) => {
    if (playingId === id) return;
    setPlayingId(id);
    try {
      // Pronounce using English speech synthesis at a senior-friendly gentle rate (0.85)
      await SpeechService.speakText(text, 'en-US', 0.85);
    } catch (e) {
      console.error('Speech error:', e);
    } finally {
      setPlayingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E8E2D2] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Languages className="w-5 h-5 text-blue-700" />
            </span>
            <h3 className="font-sans font-bold text-xl text-[#1E3A2F]">
              Đồng Hành Song Ngữ Sư Phạm
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#5C6E64]">
            Dành riêng cho giáo viên Tự nhiên & Xã hội dạy song ngữ: Khẩu lệnh lớp học chuẩn và thuật ngữ chuyên ngành có phát âm mẫu.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#E8E2D2]">
          <button
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'commands'
                ? 'bg-[#1E3A2F] text-amber-300 shadow-xs'
                : 'text-[#48594F] hover:bg-white'
            }`}
          >
            Khẩu Lệnh Lớp Học (5 Câu)
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'terms'
                ? 'bg-[#1E3A2F] text-amber-300 shadow-xs'
                : 'text-[#48594F] hover:bg-white'
            }`}
          >
            Thuật Ngữ Theo Môn
          </button>
        </div>
      </div>

      {/* Commands View */}
      {activeTab === 'commands' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Lời khuyên cho thầy cô: </strong> Thầy cô chỉ cần dùng 1 đến 2 câu khẩu lệnh đơn giản mỗi tiết. Học sinh sẽ làm quen rất nhanh mà thầy cô không cảm thấy áp lực nói tiếng Anh!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialClassroomCommands.map((cmd) => (
              <div
                key={cmd.id}
                className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E8E2D2] hover:border-blue-300 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 uppercase">
                      {cmd.category}
                    </span>
                    <span className="text-xs text-[#8C7A68]">Bấm loa để nghe giọng đọc chuẩn</span>
                  </div>

                  <h4 className="font-bold text-base text-[#1E3A2F] mb-1">
                    {cmd.english}
                  </h4>
                  <p className="text-xs text-blue-700 font-mono mb-2">
                    {cmd.ipa}
                  </p>
                  <p className="text-xs sm:text-sm text-[#4A5D52] font-sans mb-3">
                    Nghĩa tiếng Việt: <strong>&ldquo;{cmd.vietnamese}&rdquo;</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E2D2] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#708077] italic line-clamp-1">
                    {cmd.situation}
                  </span>

                  <button
                    onClick={() => handlePronounce(cmd.pronounceText, cmd.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${playingId === cmd.id ? 'animate-spin' : ''}`} />
                    <span>{playingId === cmd.id ? 'Đang phát...' : 'Phát âm mẫu'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminology View */}
      {activeTab === 'terms' && (
        <div className="space-y-4">
          {/* Subject Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { key: 'Toan', label: 'Toán học' },
              { key: 'KHTN', label: 'KHTN / Vật lý' },
              { key: 'SinhHoc', label: 'Sinh học' },
              { key: 'LichSu', label: 'Lịch sử' },
              { key: 'All', label: 'Tất cả các môn' }
            ].map((sub) => (
              <button
                key={sub.key}
                onClick={() => setSelectedSubject(sub.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedSubject === sub.key
                    ? 'bg-[#1E3A2F] text-amber-300'
                    : 'bg-[#F2ECE1] text-[#405046] hover:bg-amber-100'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#E8E2D2] hover:border-emerald-300 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                      {term.subject} • {term.topic}
                    </span>
                    <span className="text-xs text-[#8C7A68]">{term.usageContext}</span>
                  </div>

                  <h4 className="font-bold text-base text-[#1E3A2F] mb-1">
                    {term.english}
                  </h4>
                  <p className="text-xs text-emerald-700 font-mono mb-2">
                    {term.ipa}
                  </p>
                  <p className="text-xs sm:text-sm text-[#3E4F44] font-medium mb-2">
                    Tiếng Việt: <strong>{term.vietnamese}</strong>
                  </p>

                  <div className="p-3 rounded-xl bg-white border border-[#E8E2D2] text-xs space-y-1 mb-3">
                    <p className="text-blue-900 italic font-medium">
                      &ldquo;{term.exampleSentenceEn}&rdquo;
                    </p>
                    <p className="text-[#55695C]">
                      ↳ {term.exampleSentenceVi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handlePronounce(term.pronounceText, term.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#1E3A2F] hover:bg-[#2A4F40] text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${playingId === term.id ? 'animate-spin' : ''}`} />
                    <span>{playingId === term.id ? 'Đang phát...' : 'Nghe phát âm chuẩn'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
