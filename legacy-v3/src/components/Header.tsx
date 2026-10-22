'use client';

import React from 'react';
import { 
  HeartHandshake, 
  BookOpenCheck, 
  UserCircle2, 
  SunMedium, 
  Type, 
  ShieldAlert, 
  Smile,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { TeacherProfile } from '@/types/teacher';
import { SoundService } from '@/lib/soundService';

export type FontScale = '100' | '125' | '150';

interface HeaderProps {
  teacher: TeacherProfile;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  fontScale: FontScale;
  onChangeFontScale: (scale: FontScale) => void;
  onOpenTeacherProfile: () => void;
  onOpenKnowledgeHub: () => void;
  onOpenGuideModal: () => void;
  onOpenAuthModal?: () => void;
  onStartTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  teacher,
  isHighContrast,
  onToggleHighContrast,
  fontScale,
  onChangeFontScale,
  onOpenTeacherProfile,
  onOpenKnowledgeHub,
  onOpenGuideModal,
  onOpenAuthModal,
  onStartTour
}) => {
  const [isMuted, setIsMuted] = React.useState(SoundService.getMuteState());

  const handleToggleMute = () => {
    const muted = SoundService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      SoundService.playSoftPop();
    }
  };

  const getLoadBadge = () => {
    switch (teacher.psychologicalLoad) {
      case 'light':
        return { text: 'Tâm lý: Thư thái', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Smile };
      case 'moderate':
        return { text: 'Tâm lý: Ổn định', bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: SunMedium };
      case 'strained':
        return { text: 'Tâm lý: Đang tải việc', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: HeartHandshake };
      case 'overloaded':
        return { text: 'Tâm lý: Cần nghỉ ngơi', bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: ShieldAlert };
    }
  };

  const loadBadge = getLoadBadge();
  const LoadIcon = loadBadge.icon;

  const shortTeacherName = `${teacher.salutation} ${teacher.fullName.split(' ').slice(-2).join(' ')}`;

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b-2 border-[#E8E2D2] shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Slogan */}
        <div id="header-brand" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#1E3A2F] text-amber-300 flex items-center justify-center shadow-md border-2 border-amber-400/40">
            <span className="font-sans text-2xl font-bold tracking-tight">LM</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A2F] tracking-tight font-sans">
                Lớp Mình
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                lopminhedu.vn • Multi-Tenant V2
              </span>
            </div>
            <p className="text-[11px] text-[#526358] font-medium hidden sm:block">
              &quot;Thấu hiểu từng học sinh, đồng hành cùng người gieo chữ&quot;
            </p>
          </div>
        </div>

        {/* Center: Teacher Greeting & School Info */}
        <div className="hidden xl:flex items-center gap-3 px-4 py-1 rounded-full bg-amber-50/70 border border-amber-200/70">
          <div className="text-xs text-[#4A3B2C] leading-tight">
            <span className="font-semibold text-[#1E3A2F]">
              {teacher.salutation} {teacher.fullName}
            </span>
            <span className="mx-1.5 text-amber-400">•</span>
            <span>{teacher.department} ({teacher.schoolName})</span>
          </div>
          <button
            onClick={onOpenTeacherProfile}
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-transform hover:scale-105 ${loadBadge.bg}`}
            title="Xem và điều chỉnh mức độ tải tâm lý sư phạm"
          >
            <LoadIcon className="w-3.5 h-3.5" />
            <span>{loadBadge.text}</span>
          </button>
        </div>

        {/* Accessibility & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Senior Font Scale Toggle (100% / 125% / 150%) */}
          <div className="flex items-center rounded-xl bg-white border border-[#E8E2D2] p-0.5 text-xs font-bold text-[#38483F]">
            <span className="px-2 text-gray-500 hidden sm:inline text-[11px]">Cỡ chữ:</span>
            {(['100', '125', '150'] as FontScale[]).map((scale) => (
              <button
                key={scale}
                onClick={() => {
                  onChangeFontScale(scale);
                  SoundService.playSoftPop();
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  fontScale === scale
                    ? 'bg-[#1E3A2F] text-amber-300 shadow-xs'
                    : 'hover:bg-amber-50'
                }`}
                title={`Đặt cỡ chữ ${scale}%`}
              >
                {scale}%
              </button>
            ))}
          </div>

          {/* Sound Bell Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-white border border-[#E8E2D2] hover:bg-amber-50 text-gray-700 transition-colors"
            title={isMuted ? 'Bật âm thanh chuông lớp học' : 'Tắt âm thanh thông báo'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
          </button>

          {/* Spotlight Tour Button */}
          {onStartTour && (
            <button
              onClick={() => {
                SoundService.playSoftPop();
                onStartTour();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-amber-200 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 border border-emerald-500/60"
              title="Bắt đầu Spotlight Tour hướng dẫn từng bước trực quan"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Tour Chỉ Dẫn</span>
            </button>
          )}

          {/* Bé Bảng Guide Button */}
          <button
            onClick={() => {
              SoundService.playSoftPop();
              onOpenGuideModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#14271F] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
            title="Bé Bảng hướng dẫn sử dụng từng bước"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chỉ Dẫn</span>
          </button>

          {/* Multi-Tenant Switcher / Google OAuth Trigger */}
          {onOpenAuthModal && (
            <button
              id="btn-switch-tenant"
              onClick={() => {
                SoundService.playSoftPop();
                onOpenAuthModal();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-all shadow-xs"
              title="Đổi tài khoản giáo viên hoặc đăng nhập Google OAuth"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="hidden md:inline">Đổi Tài Khoản</span>
            </button>
          )}

          {/* Knowledge Hub Trigger */}
          <button
            onClick={onOpenKnowledgeHub}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 bg-white text-[#1E3A2F] border border-[#E8E2D2] hover:bg-emerald-50 transition-all shadow-xs"
            title="Kho tri thức số (SGK KNTT, CTST, Cánh diều & CV 5512)"
          >
            <BookOpenCheck className="w-4 h-4 text-emerald-700" />
            <span className="hidden lg:inline">Kho Tri Thức</span>
          </button>

          {/* Dynamic Teacher Profile Trigger */}
          <button
            onClick={onOpenTeacherProfile}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-[#1E3A2F] text-white hover:bg-[#2A4F40] transition-all shadow-sm"
            title="Hồ sơ cá nhân & Mức độ tải tâm lý sư phạm"
          >
            <UserCircle2 className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">{shortTeacherName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
