/**
 * Tên model Gemini, gom một chỗ. Đọc từ biến môi trường để đổi model không cần sửa code.
 * Giá trị mặc định theo changelog ai.google.dev tháng 10/2026 — kiểm tra lại trước khi đổi.
 */
export const MODELS = {
  /** Phân loại, bóc tách JSON, lọc email: nhanh và rẻ. */
  fast: process.env.GEMINI_MODEL_FAST ?? "gemini-3.5-flash-lite",
  /** Chat, Co-Pilot, góc tâm tình. */
  default: process.env.GEMINI_MODEL_DEFAULT ?? "gemini-3.8-flash",
  /** Lập dàn ý giáo án, việc cần suy nghĩ nhiều bước. */
  heavy: process.env.GEMINI_MODEL_HEAVY ?? "gemini-3.8-flash",
} as const;

export type ModelRole = keyof typeof MODELS;
