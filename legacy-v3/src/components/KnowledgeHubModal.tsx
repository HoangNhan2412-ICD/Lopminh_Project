'use client';

import React, { useState } from 'react';
import { 
  X, 
  BookOpenCheck, 
  UploadCloud, 
  Search, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Layers, 
  ArrowRight
} from 'lucide-react';
import { initialKnowledgeBase } from '@/data/mockKnowledge';
import { KnowledgeChunk } from '@/types/knowledge';

interface KnowledgeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeHubModal: React.FC<KnowledgeHubModalProps> = ({
  isOpen,
  onClose
}) => {
  const [chunks, setChunks] = useState<KnowledgeChunk[]>(initialKnowledgeBase);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  if (!isOpen) return null;

  const filteredChunks = chunks.filter(c => 
    c.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.textSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSimulatedUpload = (fileType: string) => {
    setIsUploading(true);
    setUploadSuccess('');

    setTimeout(() => {
      const newChunk: KnowledgeChunk = {
        id: `kn-upload-${Date.now()}`,
        source: 'CUSTOM_UPLOAD',
        documentTitle: `Tài liệu tải lên: Kế hoạch giáo dục nhà trường (${fileType})`,
        chapterOrSection: 'Chuyên đề đổi mới sinh hoạt chuyên môn theo hướng nghiên cứu bài học',
        subject: 'Toán học & KHTN',
        gradeLevel: 'Khối 9',
        tags: ['Tải lên mới', 'Vector Indexing', 'Gemini Grounding'],
        textSnippet: 'Đã phân mảnh (chunking) 12 đoạn văn bản và đánh chỉ mục vector thành công. AI sẽ tự động tham chiếu tài liệu này khi biên soạn kế hoạch bài dạy 5512.'
      };

      setChunks(prev => [newChunk, ...prev]);
      setIsUploading(false);
      setUploadSuccess(`Đã nạp và trích xuất chỉ mục vector thành công cho tài liệu ${fileType}!`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border-4 border-[#8B4513] my-8 max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shadow-xs">
              <BookOpenCheck className="w-7 h-7 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-xl sm:text-2xl text-[#1E3A2F]">
                  Kho Tri Thức Số & RAG Vector Hub
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  NotebookLM Engine
                </span>
              </div>
              <p className="text-xs text-[#5C6E64]">
                Tích hợp sẵn Công văn 5512, Thông tư 22, và 3 bộ SGK (Kết nối tri thức, Chân trời sáng tạo, Cánh Diều).
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
          {/* File Ingestion Dropzone */}
          <div className="p-6 rounded-3xl bg-[#FAF8F5] border-2 border-dashed border-[#C4B89F] text-center">
            <UploadCloud className="w-10 h-10 text-[#1E3A2F] mx-auto mb-2 opacity-70" />
            <h4 className="font-sans font-bold text-base text-[#1E3A2F] mb-1">
              Tải Lên Giáo Trình, Đề Cương, Hoặc Thông Tư Của Trường
            </h4>
            <p className="text-xs text-[#526358] max-w-md mx-auto mb-4">
              Hệ thống tự động cắt đoạn (chunking), trích xuất chuẩn GDPT 2018 và nhúng vector để grounding chính xác từng câu hỏi.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handleSimulatedUpload('Phụ lục 5512')}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A2F] text-amber-300 hover:bg-[#2A4F40] transition-colors"
              >
                + Tải mẫu Công văn 5512
              </button>
              <button
                onClick={() => handleSimulatedUpload('SGK Toán 9 KNTT')}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#1E3A2F] border border-[#C4B89F] hover:bg-amber-50 transition-colors"
              >
                + Nạp SGK Kết Nối Tri Thức
              </button>
              <button
                onClick={() => handleSimulatedUpload('Quy chế thi THPT 2026')}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#1E3A2F] border border-[#C4B89F] hover:bg-amber-50 transition-colors"
              >
                + Nạp Quy chế thi mới
              </button>
            </div>

            {isUploading && (
              <div className="mt-3 text-xs text-amber-800 font-semibold animate-pulse flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Đang phân tích đoạn văn bản và lập chỉ mục pgvector...</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>

          {/* Search Knowledge Base */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhanh trong kho thông tư và sách giáo khoa..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E8E2D2] text-sm text-[#1E3A2F] focus:border-[#1E3A2F] focus:outline-hidden"
            />
          </div>

          {/* Document Chunks List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#4B5E53]">
              Tài Liệu Đã Nạp Trong Hệ Thống ({filteredChunks.length})
            </h4>

            {filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D2] hover:border-emerald-300 transition-all space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1E3A2F] flex-shrink-0" />
                    <strong className="text-sm font-bold text-[#1E3A2F]">
                      {chunk.documentTitle}
                    </strong>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 self-start sm:self-auto">
                    {chunk.chapterOrSection}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#405046] whitespace-pre-line leading-relaxed pl-6 border-l-2 border-emerald-300">
                  {chunk.textSnippet}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-6">
                  {chunk.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E8E2D2] text-[#6B7D72]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#F0EAE0] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E3A2F] text-amber-300 hover:bg-[#2A4F40]"
          >
            Đóng Kho Tri Thức
          </button>
        </div>
      </div>
    </div>
  );
};
