'use client';

import React from 'react';
import { Users2, FileSpreadsheet, Bell, HeartHandshake } from 'lucide-react';
import { SoundService } from '@/lib/soundService';

export type MacroTabKey = 'today-class' | 'lesson-planner' | 'zalo-feed' | 'teacher-sanctuary';

interface MacroNavigationProps {
  activeTab: MacroTabKey;
  onTabChange: (tab: MacroTabKey) => void;
  unresolvedCount?: number;
  zaloUrgentCount?: number;
}

export const MacroNavigation: React.FC<MacroNavigationProps> = ({
  activeTab,
  onTabChange,
  unresolvedCount = 0,
  zaloUrgentCount = 0
}) => {
  const tabs = [
    {
      key: 'today-class' as MacroTabKey,
      label: 'Lớp Mình Hôm Nay',
      subtitle: 'Giám sát động & Ghi âm',
      icon: Users2,
      badge: unresolvedCount > 0 ? `${unresolvedCount} lưu ý` : undefined
    },
    {
      key: 'lesson-planner' as MacroTabKey,
      label: 'Soạn Bài Số 5512',
      subtitle: 'Word, PPT, Mindmap, QR',
      icon: FileSpreadsheet,
      badge: 'Chuẩn Bộ GD'
    },
    {
      key: 'zalo-feed' as MacroTabKey,
      label: 'Bộ Lọc Zalo & Tin Khẩn',
      subtitle: 'Lọc rác & Bản tin 2 buổi',
      icon: Bell,
      badge: zaloUrgentCount > 0 ? `${zaloUrgentCount} tin khẩn` : 'Tri-Platform'
    },
    {
      key: 'teacher-sanctuary' as MacroTabKey,
      label: 'Góc Cởi Bỏ Chiếc Áo',
      subtitle: 'Tâm tình, Song ngữ & Kỹ năng',
      icon: HeartHandshake,
      badge: 'Nơi an yên'
    }
  ];

  return (
    <nav className="my-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              id={`macro-tab-${tab.key}`}
              onClick={() => {
                SoundService.playSoftPop();
                onTabChange(tab.key);
              }}
              className={`relative text-left p-4 rounded-2xl transition-all duration-200 border-2 flex items-start gap-3 shadow-xs ${
                isActive
                  ? 'bg-white border-[#1E3A2F] ring-4 ring-[#1E3A2F]/10 shadow-md scale-[1.01]'
                  : 'bg-white/80 border-[#E8E2D2] hover:bg-white hover:border-[#C4B89F]'
              }`}
            >
              {/* Icon container */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#1E3A2F] text-amber-300 shadow-xs'
                    : 'bg-[#F2ECE1] text-[#4A5D52]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3
                    className={`font-bold text-sm sm:text-base truncate font-sans ${
                      isActive ? 'text-[#1E3A2F]' : 'text-[#303E36]'
                    }`}
                  >
                    {tab.label}
                  </h3>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs text-[#617369] font-medium truncate">
                    {tab.subtitle}
                  </p>
                  {tab.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-[#EAE4D7] text-[#554C3D]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-4 right-4 h-1 bg-[#1E3A2F] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
