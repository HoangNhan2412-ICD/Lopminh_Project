'use client';

import React, { useState } from 'react';
import { 
  Laptop, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  Tv,
  QrCode,
  FileCheck2,
  ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { initialDigitalSkillGuides } from '@/data/digitalSkillsData';
import { DigitalSkillGuide } from '@/types/sanctuary';

export const DigitalSkillsGuide: React.FC = () => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>(initialDigitalSkillGuides[0].id);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const activeGuide = initialDigitalSkillGuides.find((g) => g.id === selectedGuideId) || initialDigitalSkillGuides[0];

  const handleMarkComplete = (guideId: string) => {
    setCompletedMap((prev) => ({ ...prev, [guideId]: true }));
    // Trigger celebratory confetti for senior encouragement!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }
  };

  const getGuideIcon = (category: string) => {
    switch (category) {
      case 'PowerPoint':
        return Tv;
      case 'QRCode':
        return QrCode;
      case 'GoogleForm':
        return FileCheck2;
      default:
        return Laptop;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E8E2D2] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Laptop className="w-5 h-5 text-amber-700" />
            </span>
            <h3 className="font-sans font-bold text-xl text-[#1E3A2F]">
              Kỹ Năng Số 2 Phút Cho Thầy Cô
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#5C6E64]">
            Hướng dẫn trực quan, ngắn gọn, chữ to rõ nét dành cho giáo viên lớn tuổi – Không từ ngữ kỹ thuật rườm rà.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ThumbsUp className="w-4 h-4 text-emerald-600" />
          <span>Học từng chút một, không sợ sai!</span>
        </div>
      </div>

      {/* Guide Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {initialDigitalSkillGuides.map((guide) => {
          const isSelected = guide.id === selectedGuideId;
          const isDone = completedMap[guide.id];
          const Icon = getGuideIcon(guide.category);

          return (
            <button
              key={guide.id}
              onClick={() => setSelectedGuideId(guide.id)}
              className={`p-4 rounded-2xl text-left border-2 transition-all flex items-start gap-3 ${
                isSelected
                  ? 'bg-amber-50/70 border-[#1E3A2F] shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E8E2D2] hover:bg-white'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-[#1E3A2F] text-amber-300' : 'bg-white text-gray-700 border'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                    {guide.timeEstimate}
                  </span>
                  {isDone && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã học</span>
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1E3A2F] line-clamp-2">
                  {guide.title}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Guide Content */}
      <div className="p-6 rounded-3xl bg-[#FAF8F5] border-2 border-[#E8E2D2] space-y-5">
        <div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1E3A2F] text-amber-300 uppercase">
            {activeGuide.category} • {activeGuide.targetSeniorLevel}
          </span>
          <h4 className="text-xl font-bold font-sans text-[#1E3A2F] mt-2 mb-1">
            {activeGuide.title}
          </h4>
          <p className="text-sm text-[#4E6155] leading-relaxed">
            {activeGuide.summary}
          </p>
        </div>

        {/* Lời dặn an tâm */}
        <div className="p-4 rounded-2xl bg-amber-100/70 border-2 border-amber-300 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-950 text-sm block mb-0.5">Lời dặn an tâm từ Bé Bảng:</strong>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              &ldquo;{activeGuide.goldenRule}&rdquo;
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          <h5 className="font-bold text-sm text-[#1E3A2F] uppercase tracking-wider">
            Các bước thực hiện (Làm theo thứ tự):
          </h5>

          <div className="space-y-3">
            {activeGuide.steps.map((st) => (
              <div
                key={st.stepNumber}
                className="p-4 rounded-2xl bg-white border-2 border-[#E8E2D2] flex items-start gap-4 shadow-xs"
              >
                <div className="w-8 h-8 rounded-full bg-[#1E3A2F] text-amber-300 font-bold flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {st.stepNumber}
                </div>
                <div className="flex-1">
                  <h6 className="font-bold text-base text-[#1E3A2F] mb-1">
                    {st.title}
                  </h6>
                  <p className="text-sm text-[#405046] leading-relaxed">
                    {st.description}
                  </p>
                  {st.shortcutOrHint && (
                    <div className="mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 inline-block">
                      💡 Mẹo nhỏ: {st.shortcutOrHint}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Confirmation Button */}
        <div className="pt-4 border-t border-[#E8E2D2] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#6B7D72]">
            Thầy cô có thể thực hành ngay trên máy tính hoặc mở điện thoại thử nghiệm.
          </span>

          <button
            onClick={() => handleMarkComplete(activeGuide.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md ${
              completedMap[activeGuide.id]
                ? 'bg-emerald-600 text-white'
                : 'bg-[#1E3A2F] hover:bg-[#2A4F40] text-amber-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{completedMap[activeGuide.id] ? 'Cô đã hoàn thành bài này!' : 'Đã hiểu và làm được!'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
