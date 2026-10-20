'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KatexFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const KatexFormula: React.FC<KatexFormulaProps> = ({
  formula,
  displayMode = true,
  className = ''
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        output: 'html'
      });
    } catch (err) {
      console.error('KaTeX rendering error:', err);
      return `<span class="text-rose-600 font-mono text-xs">${formula}</span>`;
    }
  }, [formula, displayMode]);

  return (
    <div
      className={`overflow-x-auto py-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const MathFormulaGallery: React.FC<{
  onSelectFormula?: (formula: string) => void;
}> = ({ onSelectFormula }) => {
  const sampleFormulas = [
    {
      title: 'Hệ phương trình bậc nhất hai ẩn (Toán 9)',
      formula: '\\begin{cases} ax + by = c \\\\ a\'x + b\'y = c\' \\end{cases}'
    },
    {
      title: 'Công thức nghiệm phương trình bậc hai (Toán 9)',
      formula: 'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad (\\Delta = b^2 - 4ac \\ge 0)'
    },
    {
      title: 'Định luật Ôm & Công suất điện (KHTN / Vật lý 9)',
      formula: 'I = \\frac{U}{R} \\implies P = U \\cdot I = I^2 \\cdot R = \\frac{U^2}{R}'
    },
    {
      title: 'Phương trình hóa học phản ứng trao đổi (Hóa 9)',
      formula: '\\text{BaCl}_2 + \\text{Na}_2\\text{SO}_4 \\longrightarrow \\text{BaSO}_4 \\downarrow + 2\\text{NaCl}'
    }
  ];

  return (
    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
      <div className="flex items-center justify-between">
        <strong className="text-xs font-bold text-[#1E3A2F] uppercase tracking-wider">
          Công thức Toán - KHTN chuẩn KaTeX (Không lỗi phông chữ)
        </strong>
        <span className="text-[11px] text-[#8C7A68]">Bấm để chèn vào giáo án</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sampleFormulas.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectFormula && onSelectFormula(item.formula)}
            className="p-3 rounded-xl bg-white border border-[#E8E2D2] hover:border-[#1E3A2F] cursor-pointer transition-all shadow-xs"
          >
            <div className="text-[11px] font-bold text-[#55695C] mb-1">
              {item.title}
            </div>
            <KatexFormula formula={item.formula} displayMode={true} />
          </div>
        ))}
      </div>
    </div>
  );
};
