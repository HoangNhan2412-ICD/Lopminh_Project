'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Sparkles, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Heart, 
  Award,
  Filter,
  Search,
  X,
  Download,
  BarChart3,
  PartyPopper,
  Camera,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Student, AcademicLevel } from '@/types/student';
import { TeacherProfile } from '@/types/teacher';
import { initialTeacherProfile } from '@/data/defaultTeacher';
import { ClassAnalyticsModal } from './ClassAnalyticsModal';
import Fuse from 'fuse.js';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { SoundService } from '@/lib/soundService';

interface StudentTrackerProps {
  students: Student[];
  teacher?: TeacherProfile;
  onToggleAttendance: (studentId: string) => void;
  onAddBehaviorLog: (studentId: string, text: string) => void;
  onSelectStudentForPlan: (student: Student) => void;
}

export const StudentTracker: React.FC<StudentTrackerProps> = ({
  students,
  teacher = initialTeacherProfile,
  onToggleAttendance,
  onAddBehaviorLog,
  onSelectStudentForPlan
}) => {
  // Multi-Class Management: GVCN vs GVBM
  const assignedClass = teacher.assignedClass || '9A';
  const subjectClasses = teacher.subjectClasses && teacher.subjectClasses.length > 0
    ? teacher.subjectClasses
    : ['9B', '9C'];

  const classOptions = useMemo(() => [
    { id: assignedClass, name: `Lớp ${assignedClass}`, role: 'GVCN (Chủ nhiệm)', isGVCN: true },
    ...subjectClasses.map((sc) => ({
      id: sc,
      name: `Lớp ${sc}`,
      role: 'GVBM (Bộ môn)',
      isGVCN: false
    }))
  ], [assignedClass, subjectClasses]);

  const [selectedClass, setSelectedClass] = useState<string>(assignedClass);
  const [filterType, setFilterType] = useState<'all' | 'absent' | 'standout' | 'needHelp'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<Student | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [exportingStudentId, setExportingStudentId] = useState<string | null>(null);

  // Filter students for the active class
  const currentClassStudents = useMemo(() => {
    const matched = students.filter((s) => (s.classRoom || assignedClass) === selectedClass);
    return matched.length > 0 ? matched : students;
  }, [students, selectedClass, assignedClass]);

  // Fuse.js fuzzy search engine (Vietnamese diacritic tolerant)
  const fuse = useMemo(() => {
    return new Fuse(currentClassStudents, {
      keys: [
        'fullName',
        'personalityTraits',
        'academicLevel',
        'notesForNextLesson',
        'currentStatusBadge.text',
        'behavioralLogs.text'
      ],
      threshold: 0.35,
      ignoreLocation: true
    });
  }, [currentClassStudents]);

  // Apply search query first, then filter type
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentClassStudents;
    }
    return fuse.search(searchQuery.trim()).map((res) => res.item);
  }, [searchQuery, currentClassStudents, fuse]);

  const filteredStudents = useMemo(() => {
    return searchResults.filter((s) => {
      if (filterType === 'absent') return !s.isPresent;
      if (filterType === 'standout') return s.differentiatedTierRecommendation === 2;
      if (filterType === 'needHelp') return s.academicLevel === 'CanHoTro';
      return true;
    });
  }, [searchResults, filterType]);

  const totalCount = currentClassStudents.length;
  const presentCount = currentClassStudents.filter((s) => s.isPresent).length;
  const absentCount = totalCount - presentCount;
  const tier2Count = currentClassStudents.filter((s) => s.differentiatedTierRecommendation === 2).length;

  const currentClassMeta = classOptions.find((c) => c.id === selectedClass) || classOptions[0];

  const getAcademicBadge = (level: AcademicLevel) => {
    switch (level) {
      case 'Gioi':
        return { text: 'Học lực: Giỏi', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'Kha':
        return { text: 'Học lực: Khá', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'TrungBinh':
        return { text: 'Học lực: Đạt', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'CanHoTro':
        return { text: 'Cần hỗ trợ', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  const handleSaveNote = () => {
    if (selectedStudentForNote && noteInput.trim()) {
      onAddBehaviorLog(selectedStudentForNote.id, noteInput.trim());
      toast.success(`Đã lưu nhật ký cho em ${selectedStudentForNote.fullName}`, {
        description: 'Thông tin được cập nhật tức thì vào sổ theo dõi sư phạm.'
      });
      setNoteInput('');
      setSelectedStudentForNote(null);
    }
  };

  // Switch class with friendly notification
  const handleSelectClass = (classId: string, className: string, isGVCN: boolean) => {
    setSelectedClass(classId);
    setSearchQuery('');
    setFilterType('all');
    SoundService.playSoftPop();
    toast.info(`Đang mở ${className} • ${isGVCN ? 'Lớp Chủ Nhiệm' : 'Lớp Bộ Môn'}`, {
      description: `Đã tải ${classId === assignedClass ? totalCount : 'danh sách'} học sinh và phân tầng bài dạy.`
    });
  };

  // Export student card using html-to-image
  const handleExportCard = async (student: Student) => {
    setExportingStudentId(student.id);
    try {
      const node = document.getElementById(`student-card-${student.id}`);
      if (!node) {
        toast.error('Không tìm thấy thẻ học sinh trên màn hình để xuất ảnh');
        return;
      }

      const dataUrl = await toPng(node, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `TheHocSinh_${student.fullName.replace(/\s+/g, '_')}_${selectedClass}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      SoundService.playSuccessChime();
      toast.success(`Đã xuất ảnh thẻ học sinh em ${student.fullName}!`, {
        description: 'File PNG chất lượng cao sẵn sàng gửi phụ huynh qua Zalo hoặc in ấn.'
      });
    } catch (err) {
      console.error('Export card error:', err);
      toast.error('Có lỗi khi tạo ảnh thẻ học sinh. Vui lòng thử lại.');
    } finally {
      setExportingStudentId(null);
    }
  };

  // Celebrate full attendance or achievement
  const handleCelebrateAttendance = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    SoundService.playSuccessChime();
    toast.success('🎉 Chúc mừng lớp học!', {
      description: 'Cả lớp phấn khởi, phong trào học tập thi đua sôi nổi!'
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Multi-Class Switcher Bar (GVCN vs GVBM) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border-2 border-[#E8E2D2] shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1E3A2F] block">
              Chọn Lớp Giảng Dạy &amp; Theo Dõi:
            </span>
            <span className="text-[11px] text-[#617369]">
              {teacher.salutation} {teacher.fullName} • {currentClassMeta.role}
            </span>
          </div>
        </div>

        {/* Class Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {classOptions.map((cls) => {
            const isSelected = selectedClass === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls.id, cls.name, cls.isGVCN)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#1E3A2F] text-amber-300 border-[#14271F] shadow-xs scale-[1.02]'
                    : 'bg-[#F9F7F2] text-[#4A5D52] border-[#E8E2D2] hover:bg-amber-50'
                }`}
              >
                <span>{cls.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    cls.isGVCN
                      ? isSelected
                        ? 'bg-amber-400 text-[#14271F]'
                        : 'bg-emerald-100 text-emerald-800'
                      : isSelected
                      ? 'bg-white/20 text-amber-200'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {cls.isGVCN ? '⭐ GVCN' : 'GVBM'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Real-time Classroom Overview & Impact Engine Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#1E3A2F] to-[#14271F] text-white p-5 rounded-3xl shadow-md border-2 border-amber-600/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-emerald-700/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-amber-100 flex items-center gap-2">
                <span>{currentClassMeta.name} Hôm Nay: Bảng Giám Sát Động</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {currentClassMeta.role}
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200">
              Sĩ số: <strong>{totalCount}</strong> học sinh • Hiện diện: <strong className="text-amber-300">{presentCount}</strong> • Vắng: <strong className="text-rose-300">{absentCount}</strong> • Phân hóa Tier 2: <strong className="text-emerald-300">{tier2Count}</strong>
            </p>
          </div>

          {/* Quick Actions: Analytics Modal Trigger & Celebration */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                SoundService.playSoftPop();
                setIsAnalyticsOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#14271F] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
              title="Mở biểu đồ phân tích học lực và phân tầng năng lực Recharts"
            >
              <BarChart3 className="w-4 h-4 text-[#14271F]" />
              <span>Phân Tích Sư Phạm (Recharts)</span>
            </button>

            <button
              onClick={handleCelebrateAttendance}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105"
              title="Khen thưởng và chúc mừng không khí thi đua"
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Khen Thưởng Lớp</span>
            </button>
          </div>
        </div>

        {/* Dynamic Impact Engine Notice */}
        <div className="mt-3 flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15 text-xs sm:text-sm">
          <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0 animate-spin" />
          <div className="leading-relaxed">
            <strong className="text-amber-200">Động cơ tác động sư phạm (Impact Engine): </strong>
            <span>
              {absentCount > 0
                ? `Hôm nay có ${absentCount} em vắng -> Giáo án chuẩn 5512 đã tự động chuẩn bị Phiếu bù bài và video tự học.`
                : 'Cả lớp hiện diện đầy đủ 100% chuyên cần.'}
              {' '}
              {tier2Count > 0 && `Đồng thời kích hoạt ${tier2Count} phiếu bài tập mở rộng cho các em bứt phá năng lực.`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Fuse.js Fuzzy Search Bar & Quick Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8E2D2]">
        {/* Fuse.js Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm thông minh (tên học sinh, đặc điểm, học lực, ghi chú...)"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D2] text-xs sm:text-sm text-[#1E2922] placeholder-gray-400 focus:outline-none focus:border-[#1E3A2F]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-[#1E3A2F] text-amber-300'
                : 'bg-gray-100 text-[#4A5D52] hover:bg-gray-200'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            onClick={() => setFilterType('absent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'absent'
                ? 'bg-rose-500 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Nghỉ / Ốm ({absentCount})
          </button>
          <button
            onClick={() => setFilterType('standout')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'standout'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Bứt phá Tier 2 ({tier2Count})
          </button>
          <button
            onClick={() => setFilterType('needHelp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'needHelp'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Cần hỗ trợ ({currentClassStudents.filter(s => s.academicLevel === 'CanHoTro').length})
          </button>
        </div>
      </div>

      {/* 4. Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-[#E8E2D2]">
          <p className="text-sm font-semibold text-gray-500">
            Không tìm thấy học sinh nào phù hợp với từ khóa &ldquo;{searchQuery}&rdquo; hoặc bộ lọc hiện tại.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A2F] text-amber-300 hover:bg-[#2A4F40]"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const academicBadge = getAcademicBadge(student.academicLevel);
            const isExporting = exportingStudentId === student.id;

            return (
              <div
                key={student.id}
                id={`student-card-${student.id}`}
                className={`bg-white rounded-2xl p-4 sm:p-5 border-2 transition-all duration-200 shadow-sm flex flex-col justify-between ${
                  !student.isPresent
                    ? 'border-rose-300 bg-rose-50/30'
                    : student.differentiatedTierRecommendation === 2
                    ? 'border-emerald-300 hover:border-emerald-500'
                    : 'border-[#E8E2D2] hover:border-[#C4B89F]'
                }`}
              >
                {/* Card Header: Avatar & Info */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Chibi friendly avatar badge */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border-2 shadow-xs ${
                          student.gender === 'nu'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {student.avatarSeed.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#8C7A68]">
                            #{student.orderNumber}
                          </span>
                          <h4 className="font-bold text-base text-[#1E3A2F] font-sans leading-tight">
                            {student.fullName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${academicBadge.bg}`}>
                            {academicBadge.text}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            {student.classRoom || selectedClass}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Present / Absent Toggle Button */}
                    <button
                      onClick={() => onToggleAttendance(student.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        student.isPresent
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                      }`}
                      title={student.isPresent ? 'Đang có mặt (Bấm để báo vắng)' : 'Đang vắng (Bấm để báo có mặt)'}
                    >
                      {student.isPresent ? (
                        <UserCheck className="w-5 h-5" />
                      ) : (
                        <UserX className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Real-time Status Badge */}
                  {student.currentStatusBadge && (
                    <div
                      className={`text-xs font-semibold px-2.5 py-1 rounded-xl mb-3 border flex items-center gap-1.5 ${
                        student.currentStatusBadge.variant === 'danger'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : student.currentStatusBadge.variant === 'success'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : student.currentStatusBadge.variant === 'warning'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}
                    >
                      {student.currentStatusBadge.variant === 'danger' && <AlertCircle className="w-3.5 h-3.5" />}
                      {student.currentStatusBadge.variant === 'success' && <Award className="w-3.5 h-3.5 text-emerald-700" />}
                      <span>{student.currentStatusBadge.text}</span>
                    </div>
                  )}

                  {/* Personality Traits Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {student.personalityTraits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#4A5D52]"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  {/* Differentiated Tier Badge */}
                  <div className="text-xs font-medium text-[#4D6155] mb-3 flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-200/60">
                    <span>Khuyến nghị bài dạy:</span>
                    <strong className={`font-bold ${
                      student.differentiatedTierRecommendation === 2 ? 'text-emerald-800' : 'text-[#7C5A14]'
                    }`}>
                      {student.differentiatedTierRecommendation === 2 ? 'Tier 2 (Nâng cao / Bứt phá)' : 'Tier 1 (Cốt lõi / Giàn giáo)'}
                    </strong>
                  </div>

                  {/* Latest Behavioral Log Snippet */}
                  {student.behavioralLogs.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D2] text-xs text-[#38483F] mb-3">
                      <div className="flex items-center gap-1 text-[11px] text-[#8C7A68] font-semibold mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{student.behavioralLogs[0].timestamp}</span>
                      </div>
                      <p className="line-clamp-2 italic leading-relaxed">
                        &ldquo;{student.behavioralLogs[0].text}&rdquo;
                      </p>
                      {student.behavioralLogs[0].impactNote && (
                        <p className="mt-1 text-[11px] font-semibold text-emerald-800">
                          ↳ {student.behavioralLogs[0].impactNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-[#F0EAE0] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedStudentForNote(student)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1E3A2F] bg-amber-100 hover:bg-amber-200 transition-colors flex items-center gap-1"
                      title="Ghi nhật ký sư phạm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nhật ký</span>
                    </button>

                    <button
                      onClick={() => handleExportCard(student)}
                      disabled={isExporting}
                      className="p-1.5 rounded-lg text-xs font-semibold text-[#526358] hover:bg-gray-100 border border-[#E8E2D2] transition-colors"
                      title="Xuất thẻ học sinh dạng ảnh PNG chất lượng cao (html-to-image)"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectStudentForPlan(student)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    Gợi ý giáo án
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Quick Modal for Adding Behavioral Note */}
      {selectedStudentForNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-[#8B4513] animate-fadeIn">
            <h3 className="font-sans font-bold text-lg text-[#1E3A2F] mb-1">
              Ghi chú nhanh cho em {selectedStudentForNote.fullName}
            </h3>
            <p className="text-xs text-[#526358] mb-4">
              Ghi lại sự việc, thái độ hay tiến bộ nào để AI cập nhật vào kế hoạch bài dạy chuẩn 5512.
            </p>

            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Ví dụ: Em đã tự giải được bài toán điểm 9, hoặc Em cần cô giảng lại quy tắc cộng đại số..."
              rows={4}
              className="w-full p-3 text-sm rounded-xl border-2 border-[#E8E2D2] focus:border-[#1E3A2F] focus:outline-hidden mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedStudentForNote(null);
                  setNoteInput('');
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteInput.trim()}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#1E3A2F] text-amber-300 hover:bg-[#2A4F40] disabled:opacity-50"
              >
                Lưu vào sổ theo dõi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Class Analytics Modal (Recharts) */}
      <ClassAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        students={currentClassStudents}
        teacher={teacher}
        currentClassName={selectedClass}
      />
    </div>
  );
};
