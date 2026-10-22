import { z } from "zod";
import type { WorkshopVisual } from "@/lib/workshop/visual";

/* Mô hình giáo án dùng chung cho: AI sinh ra, xem trước trên web, xuất PowerPoint và Word 5512. */

export const ACTIVITY_KEYS = ["khoi-dong", "hinh-thanh", "luyen-tap", "van-dung"] as const;
export type ActivityKey = (typeof ACTIVITY_KEYS)[number];

export const ACTIVITY_NAMES: Record<ActivityKey, string> = {
  "khoi-dong": "Hoạt động 1: Khởi động",
  "hinh-thanh": "Hoạt động 2: Hình thành kiến thức mới",
  "luyen-tap": "Hoạt động 3: Luyện tập",
  "van-dung": "Hoạt động 4: Vận dụng",
};

export const SLIDE_LAYOUTS = [
  "bia",
  "muc-tieu",
  "khoi-dong",
  "hai-cot",
  "quy-trinh",
  "so-sanh",
  "noi-bat",
  "cong-thuc",
  "nhom",
  "trac-nghiem",
  "ma-qr",
  "so-do",
  "dan-do",
] as const;
export type SlideLayout = (typeof SLIDE_LAYOUTS)[number];

export const LAYOUT_LABEL: Record<SlideLayout, string> = {
  bia: "Bìa",
  "muc-tieu": "Mục tiêu",
  "khoi-dong": "Khởi động",
  "hai-cot": "Chữ và hình",
  "quy-trinh": "Quy trình",
  "so-sanh": "So sánh",
  "noi-bat": "Ý nổi bật",
  "cong-thuc": "Công thức",
  nhom: "Hoạt động nhóm",
  "trac-nghiem": "Trắc nghiệm",
  "ma-qr": "Mã QR",
  "so-do": "Sơ đồ tư duy",
  "dan-do": "Dặn dò",
};

export const ICON_KEYS = [
  "sach",
  "bong-den",
  "nhom",
  "dong-ho",
  "muc-tieu",
  "cau-hoi",
  "cong-thuc",
  "thi-nghiem",
  "trai-dat",
  "bieu-do",
  "but",
  "cup",
  "la",
  "tim",
] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export const slideSchema = z.object({
  id: z.string(),
  layout: z.enum(SLIDE_LAYOUTS),
  title: z.string(),
  /** Gạch ý chính, tối đa 6 dòng ngắn. */
  bullets: z.array(z.string()).default([]),
  /** Cho bố cục so sánh: tiêu đề hai bên. */
  leftTitle: z.string().optional(),
  rightTitle: z.string().optional(),
  left: z.array(z.string()).optional(),
  right: z.array(z.string()).optional(),
  /** Bố cục nổi bật/công thức: con số, định nghĩa hay công thức lớn. */
  highlight: z.string().optional(),
  caption: z.string().optional(),
  /** Bố cục nhóm: thời gian (phút) và sản phẩm. */
  minutes: z.number().optional(),
  product: z.string().optional(),
  /** Bố cục trắc nghiệm. */
  question: z
    .object({
      q: z.string(),
      options: z.array(z.string()).length(4),
      answer: z.number().int().min(0).max(3),
    })
    .optional(),
  icon: z.enum(ICON_KEYS).default("bong-den"),
  /** Câu lệnh tạo hình để dán vào Canva/Google Slides/model sinh ảnh. */
  imagePrompt: z.string().default(""),
  /** Lời giảng chi tiết cho giáo viên (ghi chú trình chiếu). */
  notes: z.string().default(""),
  /** Khẩu lệnh song ngữ nhỏ ở góc slide (khi bật tích hợp song ngữ). */
  englishCue: z.string().optional(),
});
export type Slide = z.infer<typeof slideSchema> & { visual?: WorkshopVisual };

export const activitySchema = z.object({
  key: z.enum(ACTIVITY_KEYS),
  minutes: z.number(),
  goal: z.string(),
  content: z.string(),
  product: z.string(),
  steps: z.object({
    giao: z.string(),
    thucHien: z.string(),
    baoCao: z.string(),
    ketLuan: z.string(),
  }),
  /** Nhiệm vụ hai tầng, có ở Luyện tập và Vận dụng. */
  coBan: z.string().optional(),
  nangCao: z.string().optional(),
});
export type Activity = z.infer<typeof activitySchema>;

export const quizItemSchema = z.object({
  q: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.number().int().min(0).max(3),
  explain: z.string().default(""),
});
export type QuizItem = z.infer<typeof quizItemSchema>;

export const lessonPlanSchema = z.object({
  title: z.string(),
  objectives: z.object({
    kienThuc: z.array(z.string()),
    nangLuc: z.array(z.string()),
    phamChat: z.array(z.string()),
  }),
  materials: z.array(z.string()),
  activities: z.array(activitySchema).length(4),
  slides: z.array(slideSchema).min(4).max(20),
  quiz: z.array(quizItemSchema).min(3).max(15),
  worksheet: z.object({ coBan: z.array(z.string()), nangCao: z.array(z.string()) }),
  homework: z.string(),
});
export type LessonPlanContent = z.infer<typeof lessonPlanSchema>;

export type ThemeKey = "bang-xanh" | "giay-kem" | "tuoi-sang";

export interface LessonRequest {
  textbook?: { bookId: string; lessonId: string };
  topic: string;
  subject: string;
  grade: string;
  classId: string;
  className: string;
  minutes: number;
  wishes: string;
  energy: "soi-noi" | "tram-lang" | "tiet-cuoi";
  focus: "game" | "thao-luan" | "go-diem";
  tone: "than-thien" | "chuan-muc" | "song-ngu";
}

export interface LessonPlan extends LessonPlanContent {
  slides: Slide[];
  id: string;
  request: LessonRequest;
  theme: ThemeKey;
  /** Học sinh theo tầng: id học sinh. */
  tiers: { coBan: string[]; nangCao: string[] };
  createdAt: string;
  updatedAt: string;
  mode: "ai" | "demo" | "fallback";
  /** Lịch sử câu lệnh tạo hình đã dùng, để các bài sau không lặp. */
  usedImagePrompts?: string[];
}
