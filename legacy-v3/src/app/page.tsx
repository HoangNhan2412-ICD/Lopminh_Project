'use client';

import React, { useState, useEffect } from 'react';
import { Header, FontScale } from '@/components/Header';
import { MascotBebang } from '@/components/MascotBebang';
import { MacroNavigation, MacroTabKey } from '@/components/MacroNavigation';
import { StudentTracker } from '@/components/StudentTracker';
import { VoiceQuickInput } from '@/components/VoiceQuickInput';
import { LessonPlanner } from '@/components/LessonPlanner';
import { ZaloUnifiedFeed } from '@/components/ZaloUnifiedFeed';
import { UnbuttoningSpace } from '@/components/UnbuttoningSpace';
import { BilingualHub } from '@/components/BilingualHub';
import { DigitalSkillsGuide } from '@/components/DigitalSkillsGuide';
import { TeacherProfileModal } from '@/components/TeacherProfileModal';
import { KnowledgeHubModal } from '@/components/KnowledgeHubModal';
import { BebangGuideModal, GuideTopicKey } from '@/components/BebangGuideModal';
import { AuthModal } from '@/components/AuthModal';
import { TenantManager } from '@/lib/tenantManager';
import { initialTeacherProfile } from '@/data/defaultTeacher';
import { initialStudents } from '@/data/mockStudents';
import { TeacherProfile } from '@/types/teacher';
import { Student } from '@/types/student';
import { LessonPlan5512 } from '@/types/lessonPlan';
import { ParsedVoiceAction } from '@/lib/voiceParser';
import { Sparkles, HeartHandshake, Languages, Laptop, Clock, ArrowRight } from 'lucide-react';
import { SoundService } from '@/lib/soundService';
import { SpeechService } from '@/lib/speechService';
import { startSpotlightTour } from '@/lib/onboardingTour';
import { toast } from 'sonner';

export default function Home() {
  const [currentTenantId, setCurrentTenantId] = useState<string>('teacher-mai-hoa');
  const [teacher, setTeacher] = useState<TeacherProfile>(initialTeacherProfile);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [activeTab, setActiveTab] = useState<MacroTabKey>('today-class');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<FontScale>('100');
  
  // Modals state
  const [isTeacherProfileOpen, setIsTeacherProfileOpen] = useState<boolean>(false);
  const [isKnowledgeHubOpen, setIsKnowledgeHubOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [guideTopic, setGuideTopic] = useState<GuideTopicKey>('quizizz');

  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan5512 | null>(null);
  const [sanctuarySubTab, setSanctuarySubTab] = useState<'chat' | 'bilingual' | 'skills'>('chat');
  const [mascotVoiceTriggerSignal, setMascotVoiceTriggerSignal] = useState(false);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Initialize SpeechSynthesis voices, Multi-Tenant partition data, and listen for warnings
  useEffect(() => {
    SpeechService.initializeVoices();
    const unsubscribe = SpeechService.onVoiceWarning((warningMsg) => {
      setRecentNotification(warningMsg);
    });

    // Load active tenant data from isolated partition
    const tenantId = TenantManager.getActiveTenantId();
    setCurrentTenantId(tenantId);
    const tenantData = TenantManager.loadFullTenantData(tenantId);
    setTeacher(tenantData.teacher);
    setStudents(tenantData.students);
    setActiveLessonPlan(tenantData.initialLessonPlan);

    return unsubscribe;
  }, []);

  // Handle switching to another teacher account (Multi-Tenant Isolation)
  const handleSwitchTenant = (newTenantId: string) => {
    TenantManager.setActiveTenantId(newTenantId);
    setCurrentTenantId(newTenantId);
    const data = TenantManager.loadFullTenantData(newTenantId);
    setTeacher(data.teacher);
    setStudents(data.students);
    setActiveLessonPlan(data.initialLessonPlan);

    toast.success(`Đã chuyển sang tài khoản ${data.teacher.salutation} ${data.teacher.fullName}`, {
      description: `${data.teacher.schoolName} • Đã kích hoạt dữ liệu học sinh & giáo án phân vùng độc lập.`
    });

    setRecentNotification(
      `Đã chuyển sang tài khoản ${data.teacher.salutation} ${data.teacher.fullName} (${data.teacher.schoolName}) - Toàn bộ dữ liệu lớp học đã được cách ly độc lập.`
    );
    setTimeout(() => {
      setRecentNotification(null);
    }, 5000);
  };

  // Update teacher profile and persist to tenant partition
  const handleUpdateTeacher = (updatedProfile: TeacherProfile) => {
    setTeacher(updatedProfile);
    TenantManager.saveTeacherProfile(currentTenantId, updatedProfile);
  };

  // Apply font scale and contrast classes on body
  useEffect(() => {
    document.body.classList.remove('font-scale-100', 'font-scale-125', 'font-scale-150');
    document.body.classList.add(`font-scale-${fontScale}`);

    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [fontScale, isHighContrast]);

  const handleOpenGuide = (topic: GuideTopicKey = 'quizizz') => {
    setGuideTopic(topic);
    setIsGuideModalOpen(true);
    SoundService.playSoftPop();
  };

  // Handle voice action applied
  const handleApplyVoiceAction = (action: ParsedVoiceAction) => {
    setStudents((prevStudents) => {
      const nextStudents = prevStudents.map((s) => {
        const isTarget =
          (action.matchedStudent && s.id === action.matchedStudent.id) ||
          (action.detectedStudentName && s.fullName.toLowerCase().includes(action.detectedStudentName.toLowerCase()));

        if (!isTarget) return s;

        const updatedBadge = {
          text: action.suggestedBadgeText,
          variant: action.suggestedBadgeVariant
        };

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: 'Vừa ghi nhận qua giọng nói',
          category: action.category,
          text: action.rawTranscript,
          impactNote: action.suggestedImpact,
          resolved: false
        };

        return {
          ...s,
          isPresent: action.shouldMarkAbsent ? false : s.isPresent,
          currentStatusBadge: updatedBadge,
          differentiatedTierRecommendation: action.recommendedTier,
          behavioralLogs: [newLog, ...s.behavioralLogs]
        };
      });

      TenantManager.saveStudents(currentTenantId, nextStudents);
      return nextStudents;
    });

    SoundService.playSuccessChime();
    toast.success(`Đã cập nhật tình hình em ${action.detectedStudentName || 'học sinh'}`, {
      description: 'Đã phân tích qua giọng nói và đồng bộ vào Kế hoạch bài dạy chuẩn 5512.'
    });
    setRecentNotification(
      `Đã cập nhật tình hình em ${action.detectedStudentName || 'học sinh'} và đồng bộ vào Kế hoạch bài dạy!`
    );

    setTimeout(() => {
      setRecentNotification(null);
    }, 6000);
  };

  // Sync notice from Zalo feed to student tracker
  const handleSyncStudentNotice = (studentName: string, actionNote: string) => {
    setStudents((prev) => {
      const nextStudents = prev.map((s) => {
        if (s.fullName.toLowerCase().includes(studentName.toLowerCase())) {
          return {
            ...s,
            isPresent: false,
            currentStatusBadge: {
              text: 'Nghỉ có phép qua Zalo',
              variant: 'danger' as const
            },
            notesForNextLesson: actionNote
          };
        }
        return s;
      });

      TenantManager.saveStudents(currentTenantId, nextStudents);
      return nextStudents;
    });

    toast.info(`Đã đồng bộ thông tin em ${studentName} từ Zalo`, {
      description: actionNote
    });
    setRecentNotification(`Đã đồng bộ thông tin em ${studentName} từ Zalo vào sổ theo dõi lớp.`);
    SoundService.playSuccessChime();
    setTimeout(() => setRecentNotification(null), 5000);
  };

  // Toggle single student attendance
  const handleToggleAttendance = (studentId: string) => {
    setStudents((prev) => {
      const nextStudents = prev.map((s) => {
        if (s.id !== studentId) return s;
        const newStatus = !s.isPresent;
        return {
          ...s,
          isPresent: newStatus,
          currentStatusBadge: newStatus
            ? { text: 'Có mặt tại lớp', variant: 'info' as const }
            : { text: 'Báo vắng hôm nay', variant: 'danger' as const }
        };
      });

      TenantManager.saveStudents(currentTenantId, nextStudents);
      return nextStudents;
    });
    SoundService.playSoftPop();
  };

  // Add behavioral log manually
  const handleAddBehaviorLog = (studentId: string, text: string) => {
    setStudents((prev) => {
      const nextStudents = prev.map((s) => {
        if (s.id !== studentId) return s;
        const newLog = {
          id: `manual-log-${Date.now()}`,
          timestamp: 'Hôm nay',
          category: 'academic' as const,
          text: text,
          impactNote: 'Đã lưu vào nhật ký sư phạm của cô',
          resolved: false
        };
        return {
          ...s,
          behavioralLogs: [newLog, ...s.behavioralLogs]
        };
      });

      TenantManager.saveStudents(currentTenantId, nextStudents);
      return nextStudents;
    });
    SoundService.playSuccessChime();
  };

  // Select student to trigger customized lesson plan
  const handleSelectStudentForPlan = (student: Student) => {
    setActiveTab('lesson-planner');
    SoundService.playSoftPop();
  };

  const unresolvedNotesCount = students.reduce(
    (acc, s) => acc + s.behavioralLogs.filter((l) => !l.resolved).length,
    0
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2922] flex flex-col font-sans selection:bg-amber-200 selection:text-[#1E3A2F]">
      {/* 1. Accessible Global Header with Multi-Tenant & Google OAuth Support */}
      <Header
        teacher={teacher}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        fontScale={fontScale}
        onChangeFontScale={setFontScale}
        onOpenTeacherProfile={() => setIsTeacherProfileOpen(true)}
        onOpenKnowledgeHub={() => setIsKnowledgeHubOpen(true)}
        onOpenGuideModal={() => handleOpenGuide('quizizz')}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onStartTour={startSpotlightTour}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Dynamic Notification Toast */}
        {recentNotification && (
          <div className="p-4 rounded-2xl bg-emerald-700 text-amber-200 border-2 border-amber-300 shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
              <span>{recentNotification}</span>
            </div>
            <button
              onClick={() => setRecentNotification(null)}
              className="text-xs px-3 py-1 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900"
            >
              Đóng
            </button>
          </div>
        )}

        {/* 2. Virtual Mascot "Bé Bảng" Hero Banner */}
        <MascotBebang
          teacher={teacher}
          onVoiceTrigger={() => {
            setActiveTab('today-class');
            setMascotVoiceTriggerSignal((prev) => !prev);
          }}
          onOpenGuideModal={() => handleOpenGuide('quizizz')}
        />

        {/* 3. Accessible Macro Navigation (4 Big Workspace Tabs) */}
        <MacroNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unresolvedCount={unresolvedNotesCount}
          zaloUrgentCount={2}
        />

        {/* 4. Tab 1: Lớp Mình Hôm Nay (Smart Context Hub & Voice Logger) */}
        {activeTab === 'today-class' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Zalo Morning Summary Capsule inside Tab 1 */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-amber-950">
                <Clock className="w-5 h-5 text-amber-700 flex-shrink-0" />
                <span>
                  <strong>Bản tin nhanh Zalo lớp {teacher.assignedClass}: </strong>
                  Đã lọc sạch các tin nhắn chào hỏi rác. Đang theo dõi sát sao tình hình chuyên cần và nề nếp.
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('zalo-feed');
                  SoundService.playSoftPop();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors self-end sm:self-auto"
              >
                <span>Mở bảng tin Zalo chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vietnamese Hands-Free Voice Quick Logger */}
            <VoiceQuickInput
              students={students}
              onApplyAction={handleApplyVoiceAction}
              externalTrigger={mascotVoiceTriggerSignal}
            />

            {/* Real-time Dynamic Student Cards */}
            <StudentTracker
              students={students}
              teacher={teacher}
              onToggleAttendance={handleToggleAttendance}
              onAddBehaviorLog={handleAddBehaviorLog}
              onSelectStudentForPlan={handleSelectStudentForPlan}
            />
          </div>
        )}

        {/* 5. Tab 2: Soạn Bài Số (Digital Workflow Circular 5512) */}
        {activeTab === 'lesson-planner' && (
          <div className="animate-fadeIn">
            <LessonPlanner
              teacher={teacher}
              students={students}
              initialPlan={activeLessonPlan}
              onOpenGuideModal={handleOpenGuide}
            />
          </div>
        )}

        {/* 6. Tab 3: Bộ Lọc Zalo Thông Minh (Zalo Tri-Platform Noise Reduction) */}
        {activeTab === 'zalo-feed' && (
          <div className="animate-fadeIn">
            <ZaloUnifiedFeed
              onSyncStudentNotice={handleSyncStudentNotice}
            />
          </div>
        )}

        {/* 7. Tab 4: Góc Cởi Bỏ Chiếc Áo Giáo Viên (Pedagogical Sanctuary) */}
        {activeTab === 'teacher-sanctuary' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Sanctuary Sub-navigation */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#F4EFE6] rounded-2xl border border-[#E3DAC8] w-fit">
              <button
                onClick={() => {
                  setSanctuarySubTab('chat');
                  SoundService.playSoftPop();
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  sanctuarySubTab === 'chat'
                    ? 'bg-[#1E3A2F] text-amber-300 shadow-sm'
                    : 'text-[#4A5D52] hover:bg-white/60'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Tâm Tình &amp; Giảm Tải Stress</span>
              </button>

              <button
                onClick={() => {
                  setSanctuarySubTab('bilingual');
                  SoundService.playSoftPop();
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  sanctuarySubTab === 'bilingual'
                    ? 'bg-[#1E3A2F] text-amber-300 shadow-sm'
                    : 'text-[#4A5D52] hover:bg-white/60'
                }`}
              >
                <Languages className="w-4 h-4" />
                <span>Trạm Song Ngữ Lớp Học</span>
              </button>

              <button
                onClick={() => {
                  setSanctuarySubTab('skills');
                  SoundService.playSoftPop();
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  sanctuarySubTab === 'skills'
                    ? 'bg-[#1E3A2F] text-amber-300 shadow-sm'
                    : 'text-[#4A5D52] hover:bg-white/60'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Kỹ Năng Số 2 Phút</span>
              </button>
            </div>

            {/* Sub-tab Views */}
            {sanctuarySubTab === 'chat' && <UnbuttoningSpace teacher={teacher} />}
            {sanctuarySubTab === 'bilingual' && <BilingualHub />}
            {sanctuarySubTab === 'skills' && <DigitalSkillsGuide />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 bg-[#14271F] text-amber-100/80 border-t-4 border-[#8B4513]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#14271F] flex items-center justify-center font-bold font-sans text-lg">
              LM
            </div>
            <div>
              <p className="font-bold text-white text-base font-sans">
                Lớp Mình (lopminhedu.vn)
              </p>
              <p className="text-emerald-300 text-xs">
                Nền tảng trợ lý sư phạm thấu cảm dành riêng cho thầy cô giáo Việt Nam
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-[#A3B8AC]">
            <p>Tuân thủ Công văn 5512/BGDĐT-GDTrH &amp; Chương trình GDPT 2018</p>
            <p className="text-amber-400 font-semibold mt-0.5">
              &ldquo;Thấu hiểu từng học sinh, đồng hành cùng người gieo chữ&rdquo;
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TeacherProfileModal
        isOpen={isTeacherProfileOpen}
        onClose={() => setIsTeacherProfileOpen(false)}
        teacher={teacher}
        onUpdateTeacher={handleUpdateTeacher}
      />

      <KnowledgeHubModal
        isOpen={isKnowledgeHubOpen}
        onClose={() => setIsKnowledgeHubOpen(false)}
      />

      <BebangGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        initialTopic={guideTopic}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentTenantId={currentTenantId}
        onSwitchTenant={handleSwitchTenant}
      />
    </div>
  );
}
