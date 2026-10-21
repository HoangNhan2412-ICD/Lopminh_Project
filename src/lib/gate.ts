/*
  Cổng mật khẩu cho bản chạy thử trên mạng (khi chưa có đăng nhập Google qua Supabase).
  Đặt SITE_PASSWORD trong biến môi trường là bật; để trống là tắt.
  Mục đích: người lạ không vào dùng ké khóa Gemini của nhóm.
*/

export const GATE_COOKIE = "lm_gate";

export async function gateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`lopminh-gate:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
