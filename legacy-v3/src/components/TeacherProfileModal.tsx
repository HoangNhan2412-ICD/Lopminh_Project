'use client';

import React, { useState } from 'react';
import { 
  X, 
  UserCircle2, 
  Sparkles, 
  Award, 
  Calendar, 
  HeartHandshake, 
  Smile, 
  SunMedium, 
  ShieldAlert, 
  Check, 
  Target
} from 'lucide-react';
import { TeacherProfile, PsychologicalLoadLevel } from '@/types/teacher';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherProfile;
  onUpdateTeacher: (updated: TeacherProfile) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onUpdateTeacher
}) => {
  const [profile, setProfile] = useState<TeacherProfile>(teacher);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleLoadChange = (level: PsychologicalLoadLevel) => {
    setProfile((prev) => ({ ...prev, psychologicalLoad: level }));
  };

  const handleSave = () => {
    onUpdateTeacher(profile);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border-4 border-[#8B4513] my-8 max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1E3A2F] text-amber-300 flex items-center justify-center font-bold text-xl shadow-xs">
              <UserCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xl sm:text-2xl text-[#1E3A2F]">
                Hồ Sơ Thấu Hiểu Bản Thân
              </h3>
              <p className="text-xs text-[#5C6E64]">
                AI Memory: Tự động điều chỉnh tông giọng và khối lượng công việc phù hợp với mức độ tải tâm lý của cô.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="py-6 space-y-6">
          {/* Section 1: AI Memory & Psychological Load Balancer */}
          <div className="p-5 rounded-3xl bg-amber-50/70 border-2 border-amber-300">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-700" />
              <h4 className="font-bold text-base text-[#1E3A2F] font-sans">
                Mức Độ Tải Tâm Lý Hôm Nay (Psychological Load)
              </h4>
            </div>
            <p className="text-xs text-[#4E6155] mb-4">
              Bé Bảng sẽ đọc chỉ số này để biết khi nào cần nói chậm lại, động viên cô nhiều hơn và tự động tinh gọn khối lượng giáo án.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { level: 'light' as PsychologicalLoadLevel, label: 'Thư Thái', desc: 'Sẵn sàng sáng tạo', icon: Smile, color: 'emerald' },
                { level: 'moderate' as PsychologicalLoadLevel, label: 'Ổn Định', desc: 'Tiến độ bình thường', icon: SunMedium, color: 'blue' },
                { level: 'strained' as PsychologicalLoadLevel, label: 'Căng Thẳng', desc: 'Nhiều áp lực thi đua', icon: HeartHandshake, color: 'amber' },
                { level: 'overloaded' as PsychologicalLoadLevel, label: 'Quá Tải', desc: 'Cần nghỉ ngơi ngay', icon: ShieldAlert, color: 'rose' }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = profile.psychologicalLoad === item.level;

                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => handleLoadChange(item.level)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'bg-white border-[#1E3A2F] ring-3 ring-[#1E3A2F]/15 shadow-sm'
                        : 'bg-white/60 border-amber-200 hover:bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 text-${item.color}-600`} />
                    <div className="font-bold text-xs sm:text-sm text-[#1E3A2F]">{item.label}</div>
                    <div className="text-[11px] text-[#6B7D72]">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4B5E53] uppercase mb-1">
                Họ và Tên Giáo Viên
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E8E2D2] text-sm font-semibold text-[#1E3A2F] focus:border-[#1E3A2F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B5E53] uppercase mb-1">
                Trường & Tổ Chuyên Môn
              </label>
              <input
                type="text"
                value={`${profile.schoolName} - ${profile.department}`}
                onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E8E2D2] text-sm text-[#1E3A2F] focus:border-[#1E3A2F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B5E53] uppercase mb-1">
                Thâm niên nghề giáo
              </label>
              <input
                type="number"
                value={profile.seniorityYears}
                onChange={(e) => setProfile({ ...profile, seniorityYears: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E8E2D2] text-sm font-semibold text-[#1E3A2F] focus:border-[#1E3A2F] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4B5E53] uppercase mb-1">
                Phong cách giảng dạy
              </label>
              <input
                type="text"
                value={profile.teachingStyle}
                onChange={(e) => setProfile({ ...profile, teachingStyle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E8E2D2] text-sm text-[#1E3A2F] focus:border-[#1E3A2F] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 3: School Context & KPIs */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E8E2D2]">
            <h4 className="font-bold text-sm text-[#1E3A2F] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-700" />
              <span>Chỉ Tiêu Thi Đua & KPI Năm Học 2026</span>
            </h4>

            <div className="space-y-2.5">
              {profile.kpis.map((kpi) => (
                <div key={kpi.id} className="p-3 rounded-xl bg-white border border-[#E8E2D2] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-[#1E3A2F]">{kpi.title}</strong>
                    <span className="font-bold text-emerald-800">{kpi.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden mb-1">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${kpi.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[#6B7D72] text-[11px]">
                    <span>Mục tiêu: {kpi.target}</span>
                    <span>Hiện tại: {kpi.current}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Upcoming Events */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#E8E2D2]">
            <h4 className="font-bold text-sm text-[#1E3A2F] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span>Lịch Sự Kiện Chuyên Môn Sắp Tới</span>
            </h4>

            <div className="space-y-2">
              {profile.upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3 rounded-xl bg-white border border-[#E8E2D2] text-xs flex items-center justify-between">
                  <div>
                    <strong className="text-[#1E3A2F] block">{evt.title}</strong>
                    <span className="text-[#6B7D72]">{evt.location}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold border border-blue-200">
                    {evt.date} • {evt.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[#F0EAE0] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1E3A2F] hover:bg-[#2A4F40] text-amber-300 flex items-center gap-2 shadow-md transition-all"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSaved ? 'Đã lưu thành công!' : 'Lưu Hồ Sơ Thấu Hiểu'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
