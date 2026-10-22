'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  QrCode, 
  Copy, 
  Check, 
  Layers, 
  BookOpen, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tv,
  Network,
  HelpCircle,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LessonPlan5512, TextbookEdition } from '@/types/lessonPlan';
import { TeacherProfile } from '@/types/teacher';
import { Student } from '@/types/student';
import { GeminiService } from '@/lib/geminiService';
import { exportLessonPlanToDocx, downloadBlobAsFile } from '@/lib/docxExport';
import { exportQuizizzExcel } from '@/lib/quizizzExcelExport';
import { exportLessonPlanToPptx } from '@/lib/pptxExport';
import { MindmapViewer } from './MindmapViewer';
import { KatexFormula, MathFormulaGallery } from './KatexFormula';
import { SoundService } from '@/lib/soundService';

interface LessonPlannerProps {
  teacher: TeacherProfile;
  students: Student[];
  initialPlan?: LessonPlan5512 | null;
  onOpenGuideModal?: (topic?: 'quizizz' | 'zalo' | 'pptx_mindmap') => void;
}

export const LessonPlanner: React.FC<LessonPlannerProps> = ({
  teacher,
  students,
  initialPlan,
  onOpenGuideModal
}) => {
  const [topic, setTopic] = useState('Giải hệ hai phương trình bậc nhất hai ẩn');
  const [subject, setSubject] = useState(teacher.primarySubject || 'Toán học');
  const [gradeLevel, setGradeLevel] = useState(teacher.gradeLevel || 'Lớp 9');
  const [textbook, setTextbook] = useState<TextbookEdition>('KNTT');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [activePlan, setActivePlan] = useState<LessonPlan5512 | null>(initialPlan || null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [expandedPhaseIndex, setExpandedPhaseIndex] = useState<number | null>(1);
  const [showMindmap, setShowMindmap] = useState(true);
  const [showMathGallery, setShowMathGallery] = useState(false);

  // Generate or regenerate plan
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    SoundService.playSoftPop();
    try {
      const generated = await GeminiService.generateLessonPlan({
        topic,
        subject,
        gradeLevel,
        textbookEdition: textbook,
        teacher,
        students
      });
      setActivePlan(generated);
      setExpandedPhaseIndex(1);
      SoundService.playSchoolBell();
    } catch (err) {
      console.error('Error generating lesson plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export to .docx
  const handleExportWord = async () => {
    if (!activePlan) return;
    setIsExportingWord(true);
    SoundService.playSoftPop();
    try {
      const blob = await exportLessonPlanToDocx(activePlan);
      const filename = `GiaoAn_5512_${activePlan.subject}_${activePlan.title.replace(/\s+/g, '_')}.docx`;
      downloadBlobAsFile(blob, filename);
    } catch (err) {
      console.error('Word export error:', err);
    } finally {
      setIsExportingWord(false);
    }
  };

  // Export to .pptx
  const handleExportPptx = async () => {
    if (!activePlan) return;
    setIsExportingPptx(true);
    SoundService.playSoftPop();
    try {
      await exportLessonPlanToPptx(activePlan);
    } catch (err) {
      console.error('PPTX export error:', err);
    } finally {
      setIsExportingPptx(false);
    }
  };

  // Export Quizizz Excel
  const handleExportQuizizzExcel = () => {
    if (!activePlan) return;
    SoundService.playSoftPop();
    exportQuizizzExcel(activePlan);
  };

  const handleCopyPrompt = () => {
    if (activePlan?.interactiveResources.canvaSlidePrompt) {
      navigator.clipboard.writeText(activePlan.interactiveResources.canvaSlidePrompt.copyReadyPrompt);
      setCopiedPrompt(true);
      SoundService.playSuccessChime();
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Action Control Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E8E2D2] shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#F0EAE0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <FileSpreadsheet className="w-5 h-5 text-[#8B4513]" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-[#1E3A2F]">
                Soạn Bài Số Chuẩn Công Văn 5512 &amp; Đa Xuất Bản
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C6E64]">
              Tự động tích hợp 4 hoạt động bắt buộc, phân hóa 2 tầng, xuất Word in ấn, Slide PowerPoint 16:9, Sơ đồ tư duy và Quizizz Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-2xl bg-[#1E3A2F] hover:bg-[#2A4F40] text-amber-300 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'AI đang soạn bài...' : 'Tạo Giáo Án Số Mới'}</span>
            </button>
          </div>
        </div>

        {/* Input Parameters Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-[#4B5E53] uppercase mb-1.5">
              Tên bài học / Chủ đề
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập tên bài học..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E8E2D2] text-sm text-[#1E3A2F] font-medium focus:border-[#1E3A2F] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5E53] uppercase mb-1.5">
              Bộ môn
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E8E2D2] text-sm text-[#1E3A2F] font-medium focus:border-[#1E3A2F] focus:outline-hidden bg-white"
            >
              <option value="Toán học">Toán học</option>
              <option value="Khoa học Tự nhiên">Khoa học Tự nhiên</option>
              <option value="Vật lý">Vật lý</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Sinh học">Sinh học</option>
              <option value="Ngữ văn">Ngữ văn</option>
              <option value="Lịch sử &amp; Địa lý">Lịch sử &amp; Địa lý</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5E53] uppercase mb-1.5">
              Khối lớp
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E8E2D2] text-sm text-[#1E3A2F] font-medium focus:border-[#1E3A2F] focus:outline-hidden bg-white"
            >
              <option value="Lớp 6">Lớp 6</option>
              <option value="Lớp 7">Lớp 7</option>
              <option value="Lớp 8">Lớp 8</option>
              <option value="Lớp 9">Lớp 9</option>
              <option value="Lớp 10">Lớp 10</option>
              <option value="Lớp 11">Lớp 11</option>
              <option value="Lớp 12">Lớp 12</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4B5E53] uppercase mb-1.5">
              Bộ Sách Giáo Khoa
            </label>
            <select
              value={textbook}
              onChange={(e) => setTextbook(e.target.value as TextbookEdition)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E8E2D2] text-sm text-[#1E3A2F] font-medium focus:border-[#1E3A2F] focus:outline-hidden bg-white"
            >
              <option value="KNTT">Kết nối tri thức với cuộc sống</option>
              <option value="CTST">Chân trời sáng tạo</option>
              <option value="CanhDieu">Cánh Diều</option>
            </select>
          </div>
        </div>

        {/* 4 Multi-Repo Export Buttons Bar */}
        {activePlan && (
          <div className="pt-3 border-t border-[#F0EAE0] flex flex-wrap items-center gap-2.5">
            {/* Button 1: Word 5512 */}
            <button
              onClick={handleExportWord}
              disabled={isExportingWord}
              className="px-4 py-2.5 rounded-xl bg-[#1E3A2F] hover:bg-[#2A4F40] text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50"
              title="Xuất tệp Word .docx chuẩn căn lề hành chính Nghị định 30/2020/NĐ-CP"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isExportingWord ? 'Đang tạo Word...' : '1. Xuất File Word 5512'}</span>
            </button>

            {/* Button 2: PowerPoint .pptx */}
            <button
              onClick={handleExportPptx}
              disabled={isExportingPptx}
              className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-transform hover:scale-105 disabled:opacity-50"
              title="Xuất slide bài giảng điện tử PowerPoint 16:9 4 hoạt động"
            >
              <Tv className="w-4 h-4" />
              <span>{isExportingPptx ? 'Đang tạo Slide...' : '2. Xuất Slide PowerPoint (.pptx)'}</span>
            </button>

            {/* Button 3: Toggle Mindmap */}
            <button
              onClick={() => {
                setShowMindmap(!showMindmap);
                SoundService.playSoftPop();
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition-all ${
                showMindmap
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Mở sơ đồ tư duy tương tác Markmap"
            >
              <Network className="w-4 h-4" />
              <span>3. {showMindmap ? 'Ẩn Sơ Đồ Tư Duy' : 'Xem Sơ Đồ Tư Duy (Mindmap)'}</span>
            </button>

            {/* Button 4: Quizizz Excel */}
            <button
              onClick={handleExportQuizizzExcel}
              className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-transform hover:scale-105"
              title="Tải tệp Excel đúng mẫu cột để nạp 1 chạm vào Quizizz / Blooket"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>4. Tải File Excel Quizizz</span>
            </button>

            {/* Toggle Math / KaTeX Formula Gallery */}
            <button
              onClick={() => {
                setShowMathGallery(!showMathGallery);
                SoundService.playSoftPop();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#1E3A2F] border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors ml-auto"
            >
              <Calculator className="w-4 h-4 text-amber-700" />
              <span>{showMathGallery ? 'Ẩn KaTeX' : 'Xem Công Thức KaTeX'}</span>
            </button>
          </div>
        )}
      </div>

      {/* KaTeX Math Gallery (If toggled) */}
      {showMathGallery && (
        <div className="animate-fadeIn">
          <MathFormulaGallery />
        </div>
      )}

      {/* Main Lesson Plan Body */}
      {activePlan ? (
        <div className="space-y-6">
          {/* Header Preview Banner */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 border-2 border-[#E8E2D2] shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D2]">
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1E3A2F] text-amber-300">
                  {activePlan.textbookName} • {activePlan.gradeLevel}
                </span>
                <h3 className="text-2xl font-bold font-sans text-[#1E3A2F] mt-2">
                  {activePlan.title}
                </h3>
                <p className="text-xs text-[#5C6E64] mt-1">
                  Người thực hiện: <strong>{activePlan.teacherName}</strong> ({activePlan.department} - {activePlan.schoolName}) • Thời lượng: {activePlan.timeAllocation}
                </p>
              </div>

              {/* Classroom Context Realtime Adaptations Notice */}
              {activePlan.realtimeClassroomAdaptations.length > 0 && (
                <div className="bg-amber-100/70 p-3 rounded-2xl border border-amber-300 text-xs text-amber-950 max-w-sm">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Điều chỉnh theo tình hình lớp:</span>
                  </div>
                  <ul className="space-y-1 list-disc list-inside">
                    {activePlan.realtimeClassroomAdaptations.map((ad, idx) => (
                      <li key={idx} className="line-clamp-2">
                        <strong>{ad.studentName}</strong>: {ad.actionInPlan}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Objectives Summary */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D2]">
                <h4 className="font-bold text-[#1E3A2F] mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>1. Về Kiến Thức</span>
                </h4>
                <ul className="space-y-1 text-[#45574D]">
                  {activePlan.objectives.knowledge.map((k, i) => (
                    <li key={i}>• {k}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D2]">
                <h4 className="font-bold text-[#1E3A2F] mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span>2. Về Năng Lực</span>
                </h4>
                <p className="text-[#45574D] font-medium mb-1">Chung: {activePlan.objectives.competencies.general.join(', ')}</p>
                <p className="text-[#45574D] font-medium">Đặc thù: {activePlan.objectives.competencies.specific.join(', ')}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D2]">
                <h4 className="font-bold text-[#1E3A2F] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>3. Về Phẩm Chất</span>
                </h4>
                <ul className="space-y-1 text-[#45574D]">
                  {activePlan.objectives.qualities.map((q, i) => (
                    <li key={i}>• {q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Mindmap (Markmap SVG) */}
          {showMindmap && (
            <div className="animate-fadeIn">
              <MindmapViewer plan={activePlan} />
            </div>
          )}

          {/* 4 Mandatory Phases (Công văn 5512) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#E8E2D2] shadow-sm">
            <h3 className="text-xl font-bold font-sans text-[#1E3A2F] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1E3A2F] text-amber-300 flex items-center justify-center text-sm font-bold">
                IV
              </span>
              <span>Tiến Trình Dạy Học (4 Hoạt Động Bắt Buộc Chuẩn 5512)</span>
            </h3>

            <div className="space-y-3">
              {activePlan.phases.map((phase) => {
                const isExpanded = expandedPhaseIndex === phase.phaseIndex;

                return (
                  <div
                    key={phase.phaseIndex}
                    className="border-2 border-[#E8E2D2] rounded-2xl overflow-hidden transition-all bg-[#FDFBF7]"
                  >
                    <button
                      onClick={() => setExpandedPhaseIndex(isExpanded ? null : phase.phaseIndex)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-amber-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-sm">
                          HĐ {phase.phaseIndex}
                        </span>
                        <div>
                          <h4 className="font-bold text-base text-[#1E3A2F]">
                            {phase.title}
                          </h4>
                          <span className="text-xs text-[#6B7D72]">
                            Thời lượng: {phase.durationMinutes} phút
                          </span>
                        </div>
                      </div>

                      <div className="text-gray-500">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-5 pt-1 border-t border-[#E8E2D2] bg-white space-y-4 text-xs sm:text-sm">
                        <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60">
                          <strong className="text-[#1E3A2F] block mb-1">a) Mục tiêu:</strong>
                          <p className="text-[#3E4F44] leading-relaxed">{phase.objective}</p>
                        </div>

                        <div>
                          <strong className="text-[#1E3A2F] block mb-1">b) Nội dung:</strong>
                          <p className="text-[#3E4F44] whitespace-pre-line leading-relaxed">{phase.content}</p>
                        </div>

                        <div>
                          <strong className="text-[#1E3A2F] block mb-1">c) Sản phẩm:</strong>
                          <p className="text-[#3E4F44] leading-relaxed">{phase.product}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                          <strong className="text-emerald-950 block mb-1.5">
                            d) Tổ chức thực hiện (4 bước Sư phạm):
                          </strong>
                          <div className="text-emerald-900 whitespace-pre-line leading-relaxed pl-2 border-l-2 border-emerald-400">
                            {phase.implementation}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Differentiated Instruction Tiers (2 Tầng Năng Lực) */}
          <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F2EFE8] rounded-3xl p-6 border-2 border-amber-300 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                ★
              </span>
              <h3 className="text-xl font-bold font-sans text-[#1E3A2F]">
                Dạy Học Phân Hóa (2 Tầng Năng Lực Dựa Trên Lớp Học)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tier 1 Core Card */}
              <div className="p-5 rounded-2xl bg-white border-2 border-blue-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                    Tầng 1: Cốt Lõi (Chuẩn Đạt)
                  </span>
                  <span className="text-xs text-[#526358] font-medium">Toàn lớp &amp; Cần trợ giúp</span>
                </div>
                <h4 className="font-bold text-sm text-[#1E3A2F] mb-1">
                  Đối tượng: {activePlan.differentiation.tier1Core.targetAudience}
                </h4>
                <p className="text-xs text-[#405046] mb-3 leading-relaxed">
                  <strong>Chiến lược: </strong>{activePlan.differentiation.tier1Core.strategy}
                </p>
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                  <strong className="text-blue-950 block mb-1">Bài tập nền tảng:</strong>
                  <p className="text-blue-900">{activePlan.differentiation.tier1Core.sampleExercise}</p>
                </div>
              </div>

              {/* Tier 2 Advanced Card */}
              <div className="p-5 rounded-2xl bg-white border-2 border-emerald-300 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                    Tầng 2: Mở Rộng (Nâng Cao)
                  </span>
                  <span className="text-xs text-[#526358] font-medium">Khá giỏi &amp; Bứt phá</span>
                </div>
                <h4 className="font-bold text-sm text-[#1E3A2F] mb-1">
                  Đối tượng: {activePlan.differentiation.tier2Advanced.targetAudience}
                </h4>
                <p className="text-xs text-[#405046] mb-3 leading-relaxed">
                  <strong>Chiến lược: </strong>{activePlan.differentiation.tier2Advanced.strategy}
                </p>
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                  <strong className="text-emerald-950 block mb-1">Thử thách độc lập:</strong>
                  <p className="text-emerald-900">{activePlan.differentiation.tier2Advanced.sampleExercise}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Resource Embedding (Live QR & Canva Prompts) with Bé Bảng Guide Callout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Scannable QR Code for Quizizz */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-5 border-2 border-[#E8E2D2] shadow-sm flex flex-col justify-between items-center text-center">
              <div className="w-full">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-3">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Trắc Nghiệm Tương Tác Live</span>
                </div>
                <h4 className="font-bold text-base text-[#1E3A2F] font-sans mb-1">
                  {activePlan.interactiveResources.quizizz.title}
                </h4>
                <p className="text-xs text-[#526358] mb-4">
                  Học sinh dùng điện thoại hoặc máy tính bảng quét mã để làm bài củng cố ngay tại lớp.
                </p>

                {/* Live QR Code Box */}
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border-2 border-dashed border-purple-300 inline-block mb-3 shadow-inner">
                  <QRCodeSVG
                    value={activePlan.interactiveResources.quizizz.qrPayload}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                  <div className="mt-2 text-xs font-mono font-bold text-purple-900 tracking-wider">
                    MÃ PHÒNG: {activePlan.interactiveResources.quizizz.gameCode}
                  </div>
                </div>

                {/* Bé Bảng Contextual Callout */}
                {onOpenGuideModal && (
                  <button
                    onClick={() => onOpenGuideModal('quizizz')}
                    className="w-full mt-2 p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[11px] text-[#1E3A2F] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Cô chưa biết cách nạp Quizizz? Bấm xem Bé Bảng chỉ</span>
                  </button>
                )}
              </div>

              <div className="w-full flex items-center justify-center gap-2 pt-3 border-t border-[#F0EAE0]">
                <a
                  href={activePlan.interactiveResources.quizizz.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở phòng Quizizz</span>
                </a>
              </div>
            </div>

            {/* Visual Aid Slide Prompts for Canva / PowerPoint */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E8E2D2] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gợi Ý Trợ Lý Thiết Kế Slide Canva / PPT</span>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#1E3A2F] border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedPrompt ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPrompt ? 'Đã sao chép prompt!' : 'Sao chép Prompt AI'}</span>
                  </button>
                </div>

                <h4 className="font-bold text-base text-[#1E3A2F] font-sans mb-2">
                  {activePlan.interactiveResources.canvaSlidePrompt.promptTitle}
                </h4>

                <p className="text-xs text-[#526358] mb-3">
                  <strong>Phối màu khuyến nghị: </strong>
                  {activePlan.interactiveResources.canvaSlidePrompt.colorPaletteSuggestion}
                </p>

                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D2] text-xs font-mono text-[#38483F] leading-relaxed mb-3">
                  {activePlan.interactiveResources.canvaSlidePrompt.copyReadyPrompt}
                </div>

                <div className="text-xs text-[#526358]">
                  <strong>Bố cục 5 slide trọng tâm:</strong>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    {activePlan.interactiveResources.canvaSlidePrompt.slideBreakdown.map((sb, idx) => (
                      <li key={idx}>{sb}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF8F5] rounded-3xl p-12 text-center border-2 border-dashed border-[#D4CBB8]">
          <BookOpen className="w-12 h-12 text-[#1E3A2F] mx-auto mb-3 opacity-60" />
          <h3 className="font-sans font-bold text-xl text-[#1E3A2F] mb-1">
            Chưa có giáo án nào được hiển thị
          </h3>
          <p className="text-sm text-[#5C6E64] max-w-md mx-auto mb-4">
            Thầy cô hãy bấm nút <strong>&ldquo;Tạo Giáo Án Số Mới&rdquo;</strong> ở trên để AI tự động biên soạn bài học theo chuẩn Công văn 5512.
          </p>
          <button
            onClick={handleGeneratePlan}
            className="px-6 py-2.5 rounded-xl bg-[#1E3A2F] text-amber-300 font-bold text-sm shadow-md hover:bg-[#2A4F40] transition-transform hover:scale-105"
          >
            Bắt đầu tạo ngay
          </button>
        </div>
      )}
    </div>
  );
};
