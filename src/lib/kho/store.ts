"use client";

import { useLocal } from "@/lib/local-store";

export const DOC_CATEGORIES = [
  { id: "sach", label: "Sách & chương trình", hint: "SGK, phân phối chương trình, giáo án cũ" },
  { id: "van-ban", label: "Văn bản chỉ đạo", hint: "Công văn, thông tư chuyên ngành" },
  { id: "ke-hoach", label: "Kế hoạch", hint: "Kế hoạch tổ, kế hoạch năm học, lịch sự kiện" },
  { id: "chi-tieu", label: "Chỉ tiêu", hint: "KPI, thi đua năm học" },
  { id: "khac", label: "Khác", hint: "Đề kiểm tra, ghi chú" },
] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number]["id"];

export interface KnowledgeDoc {
  id: string;
  name: string;
  category: DocCategory;
  size: number;
  addedAt: string;
  /** Chữ lấy được trên trình duyệt (tối đa 60.000 ký tự), null với PDF/ảnh. */
  text: string | null;
  /** Đã đưa lên Gemini File Search chưa. */
  remote: boolean;
}

const EMPTY: KnowledgeDoc[] = [];

export function useDocs(profileId: string) {
  return useLocal<KnowledgeDoc[]>(`lm:docs:${profileId}`, EMPTY);
}

export function useStoreName(profileId: string) {
  return useLocal<string | null>(`lm:filestore:${profileId}`, null);
}

/** Gói tài liệu gửi kèm khi soạn bài: tối đa ~12.000 ký tự, ưu tiên sách & kế hoạch. */
export function docsForLesson(docs: KnowledgeDoc[], topic: string): { name: string; text: string }[] {
  const order: DocCategory[] = ["sach", "ke-hoach", "van-ban", "chi-tieu", "khac"];
  const words = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const scored = docs
    .filter((d) => d.text)
    .map((d) => {
      const t = d.text!.toLowerCase();
      const hits = words.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
      return { d, score: hits * 10 - order.indexOf(d.category) };
    })
    .sort((a, b) => b.score - a.score);
  const out: { name: string; text: string }[] = [];
  let budget = 12_000;
  for (const { d } of scored) {
    if (budget <= 500) break;
    const t = d.text!;
    // lấy đoạn quanh từ khóa đầu tiên khớp, nếu có
    const idx = words.map((w) => t.toLowerCase().indexOf(w)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
    const slice = t.slice(Math.max(0, idx - 1500), Math.max(0, idx - 1500) + Math.min(budget, 5000));
    out.push({ name: d.name, text: slice });
    budget -= slice.length;
  }
  return out;
}
