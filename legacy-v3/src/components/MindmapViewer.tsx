'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Maximize2, 
  Minimize2,
  Sparkles,
  Check
} from 'lucide-react';
import { LessonPlan5512 } from '@/types/lessonPlan';
import { SoundService } from '@/lib/soundService';
import { normalizeNFC } from '@/lib/unicodeUtils';

interface MindmapViewerProps {
  plan: LessonPlan5512;
}

export const MindmapViewer: React.FC<MindmapViewerProps> = ({ plan }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate markdown structure from Lesson Plan with Unicode NFC normalization
  const markdownContent = normalizeNFC(`
# ${plan.title} (${plan.subject} ${plan.gradeLevel})
## I. Mục Tiêu Cần Đạt (CV 5512)
### 1. Kiến thức cốt lõi
${plan.objectives.knowledge.map(k => `- ${k}`).join('\n')}
### 2. Năng lực
- Năng lực chung: ${plan.objectives.competencies.general.join(', ')}
- Năng lực đặc thù: ${plan.objectives.competencies.specific.join(', ')}
### 3. Phẩm chất chủ yếu
${plan.objectives.qualities.map(q => `- ${q}`).join('\n')}
## II. Tiến Trình 4 Hoạt Động (CV 5512)
### HĐ 1: Khởi động (${plan.phases[0]?.durationMinutes || 7}p)
- Mục tiêu: ${plan.phases[0]?.objective.slice(0, 80)}...
- Sản phẩm: ${plan.phases[0]?.product.slice(0, 60)}...
### HĐ 2: Hình thành kiến thức (${plan.phases[1]?.durationMinutes || 18}p)
- Mục tiêu: ${plan.phases[1]?.objective.slice(0, 80)}...
- Tổ chức: Thảo luận nhóm & Chuẩn hóa kiến thức
### HĐ 3: Luyện tập (${plan.phases[2]?.durationMinutes || 12}p)
- Làm bài tập cá nhân & trắc nghiệm Quizizz
- Khắc sâu phương pháp và sửa bài mẫu
### HĐ 4: Vận dụng (${plan.phases[3]?.durationMinutes || 8}p)
- Giải quyết bài toán thực tế đời sống
- Giao nhiệm vụ tự học mở rộng
## III. Dạy Học Phân Hóa (2 Tầng)
### Tầng 1: Cốt lõi (Chuẩn đạt)
- Đối tượng: ${plan.differentiation.tier1Core.targetAudience}
- Biện pháp: Giàn giáo gợi ý từng bước
### Tầng 2: Mở rộng (Nâng cao)
- Đối tượng: ${plan.differentiation.tier2Advanced.targetAudience}
- Thử thách: Bài toán vận dụng cao & dự án tự chủ
## IV. Học Liệu Tương Tác
- Quizizz Live: ${plan.interactiveResources.quizizz.title} (Mã: ${plan.interactiveResources.quizizz.gameCode || 'LIVE'})
- Slide bài giảng điện tử phong cách bảng phấn
  `.trim());

  useEffect(() => {
    if (!svgRef.current) return;

    try {
      const transformer = new Transformer();
      const { root } = transformer.transform(markdownContent);

      if (markmapRef.current) {
        markmapRef.current.setData(root);
        markmapRef.current.fit();
      } else {
        markmapRef.current = Markmap.create(svgRef.current, {
          autoFit: true,
          duration: 300,
          style: (id: string) => `
            .${id} text {
              font-family: var(--font-be-vietnam-pro), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }
          `,
          color: (node: unknown) => {
            const colors = ['#1E3A2F', '#D97706', '#2563EB', '#059669', '#7C3AED'];
            const n = node as { depth?: number; state?: { depth?: number } };
            const depth = n.depth ?? n.state?.depth ?? 0;
            return colors[depth % colors.length];
          }
        }, root);
      }
    } catch (e) {
      console.error('Markmap render error:', e);
    }
  }, [markdownContent]);

  const handleZoomIn = () => {
    if (markmapRef.current) {
      markmapRef.current.rescale(1.25);
      SoundService.playSoftPop();
    }
  };

  const handleZoomOut = () => {
    if (markmapRef.current) {
      markmapRef.current.rescale(0.8);
      SoundService.playSoftPop();
    }
  };

  const handleResetFit = () => {
    if (markmapRef.current) {
      markmapRef.current.fit();
      SoundService.playSoftPop();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (markmapRef.current) {
        markmapRef.current.fit();
      }
    }, 200);
    SoundService.playSoftPop();
  };

  /**
   * Tải file ảnh Vector SVG độc lập
   * Nhúng trực tiếp font Be Vietnam Pro và background trắng để mở trong Word / PowerPoint / Trình duyệt không bao giờ bị vỡ dấu
   */
  const handleDownloadSvg = () => {
    if (!svgRef.current) return;

    try {
      // Clone SVG node to manipulate without affecting DOM
      const clonedSvg = svgRef.current.cloneNode(true) as SVGSVGElement;
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      // Inject standalone font and background styling
      const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleElement.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        * {
          font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif !important;
        }
        text {
          font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif !important;
        }
      `;
      clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);

      // Add a clean solid background rectangle for embedding into Word/PowerPoint
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', '#FAF8F5');
      clonedSvg.insertBefore(bgRect, clonedSvg.children[1] || null);

      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      const sanitizedTitle = normalizeNFC(plan.title).replace(/\s+/g, '_').replace(/[\\/:*?"<>|]/g, '');
      downloadLink.download = `SoDoTuDuy_${plan.subject}_${sanitizedTitle}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      SoundService.playSuccessChime();
    } catch (e) {
      console.error('Error exporting mindmap SVG:', e);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-3xl border-2 border-[#E8E2D2] bg-white transition-all overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 p-6 flex flex-col bg-[#FDFBF7]'
          : 'p-5 sm:p-6 shadow-sm mb-6'
      }`}
    >
      {/* Mindmap Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-3 border-b border-[#F0EAE0]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Network className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h4 className="font-bold text-base text-[#1E3A2F] flex items-center gap-2">
              <span>Sơ Đồ Tư Duy Tương Tác (Interactive Mindmap)</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Chuẩn Be Vietnam Pro
              </span>
            </h4>
            <p className="text-xs text-[#5C6E64]">
              Chiếu lên màn hình hoặc bảng tương tác: Nhấp chuột vào các nút tròn để mở rộng/thu gọn nhánh bài dạy.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#E8E2D2]">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl text-gray-700 hover:bg-white hover:text-[#1E3A2F] transition-colors"
            title="Phóng to sơ đồ"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl text-gray-700 hover:bg-white hover:text-[#1E3A2F] transition-colors"
            title="Thu nhỏ sơ đồ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetFit}
            className="p-2 rounded-xl text-gray-700 hover:bg-white hover:text-[#1E3A2F] transition-colors"
            title="Vừa vặn khung hình"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadSvg}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-transform hover:scale-105 ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#1E3A2F] text-amber-300'
            }`}
            title="Tải ảnh vector SVG đã nhúng font chữ chuẩn tiếng Việt"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {downloadSuccess ? 'Đã tải SVG!' : 'Tải ảnh SVG'}
            </span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-gray-700 hover:bg-white hover:text-[#1E3A2F] transition-colors"
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình giảng dạy'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className={`relative w-full rounded-2xl bg-[#FAF8F5] border border-[#E8E2D2] overflow-hidden ${
        isFullscreen ? 'flex-1 h-full' : 'h-[460px]'
      }`}>
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing font-sans"
          style={{ minHeight: '100%' }}
        />
        <div className="absolute bottom-3 left-3 text-[11px] text-[#8C7A68] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E8E2D2]">
          Kéo thả để di chuyển • Lăn chuột để thu phóng • Nhấp nút tròn mở rộng • File SVG xuất ra có nhúng font tiếng Việt
        </div>
      </div>
    </div>
  );
};
