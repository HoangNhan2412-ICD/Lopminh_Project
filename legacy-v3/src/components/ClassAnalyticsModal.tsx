'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  BarChart3, 
  X, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import { Student } from '@/types/student';
import { TeacherProfile } from '@/types/teacher';

interface ClassAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  teacher: TeacherProfile;
  currentClassName: string;
}

const TIER_COLORS = ['#0D47A1', '#1B5E20'];
const ACADEMIC_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export const ClassAnalyticsModal: React.FC<ClassAnalyticsModalProps> = ({
  isOpen,
  onClose,
  students,
  teacher,
  currentClassName
}) => {
  if (!isOpen) return null;

  const totalStudents = students.length;
  const presentCount = students.filter(s => s.isPresent).length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 100;

  // Dữ liệu phân bố học lực
  const academicCounts = {
    Gioi: students.filter(s => s.academicLevel === 'Gioi').length,
    Kha: students.filter(s => s.academicLevel === 'Kha').length,
    TrungBinh: students.filter(s => s.academicLevel === 'TrungBinh').length,
    CanHoTro: students.filter(s => s.academicLevel === 'CanHoTro').length
  };

  const academicData = [
    { name: 'Giỏi / Tốt', value: academicCounts.Gioi, fill: '#10B981' },
    { name: 'Khá', value: academicCounts.Kha, fill: '#3B82F6' },
    { name: 'Đạt / TB', value: academicCounts.TrungBinh, fill: '#F59E0B' },
    { name: 'Cần Hỗ Trợ', value: academicCounts.CanHoTro, fill: '#EF4444' }
  ];

  // Dữ liệu phân hóa 2 tầng năng lực
  const tier1Count = students.filter(s => s.differentiatedTierRecommendation === 1).length;
  const tier2Count = students.filter(s => s.differentiatedTierRecommendation === 2).length;

  const tierData = [
    { name: 'Tầng 1: Chuẩn đạt (Cốt lõi)', value: tier1Count },
    { name: 'Tầng 2: Vận dụng cao (Bứt phá)', value: tier2Count }
  ];

  const todayFormatted = format(new Date(), "EEEE, 'ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FDFBF7] rounded-3xl border-2 border-[#E8E2D2] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#1E3A2F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#14271F] flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5 text-[#1E3A2F]" />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-amber-200 flex items-center gap-2">
                <span>Thống Kê Sư Phạm Đa Chiều: Lớp {currentClassName}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200">
                  {teacher.primarySubject}
                </span>
              </h3>
              <p className="text-xs text-emerald-200 capitalize">
                {todayFormatted} • Giáo viên: {teacher.salutation} {teacher.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border-2 border-[#E8E2D2] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#5C6E64] font-medium">Sĩ số hiện diện</p>
                <p className="text-xl font-bold text-[#1E3A2F]">
                  {presentCount}/{totalStudents} <span className="text-xs font-normal text-gray-500">({attendanceRate}%)</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-[#E8E2D2] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#5C6E64] font-medium">Học sinh Tier 2 (Bứt phá)</p>
                <p className="text-xl font-bold text-emerald-800">
                  {tier2Count} em <span className="text-xs font-normal text-gray-500">({totalStudents > 0 ? Math.round((tier2Count/totalStudents)*100) : 0}%)</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-[#E8E2D2] shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#5C6E64] font-medium">Học sinh cần hỗ trợ</p>
                <p className="text-xl font-bold text-rose-800">
                  {academicCounts.CanHoTro} em
                </p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Academic Breakdown */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#E8E2D2] shadow-xs">
              <h4 className="font-bold text-[#1E3A2F] text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Phân Bố Học Lực Lớp Học</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={academicData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: any) => [`${value} học sinh`, 'Số lượng']}
                      contentStyle={{ backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px solid #E8E2D2' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Differentiated Tier Breakdown */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#E8E2D2] shadow-xs">
              <h4 className="font-bold text-[#1E3A2F] text-sm mb-3 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-700" />
                <span>Tỉ Lệ Phân Hóa Năng Lực 2 Tầng</span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {tierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} học sinh`, 'Số lượng']}
                      contentStyle={{ backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px solid #E8E2D2' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E2D2] flex items-center justify-between text-xs text-[#5C6E64]">
          <span>Dữ liệu được cập nhật tức thời theo sổ theo dõi và giọng nói tiếng Việt</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
