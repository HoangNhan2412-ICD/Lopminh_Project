import "server-only";
/** Chỉ nhận tên kho, không nhận URL tùy ý. Kho chung do quản trị cấu hình. */
export function searchStores(privateStore?: string | null) {
  return [...new Set([process.env.GEMINI_SHARED_STORE, privateStore].filter((s): s is string => Boolean(s && /^fileSearchStores\/[a-zA-Z0-9_-]+$/.test(s))))];
}
