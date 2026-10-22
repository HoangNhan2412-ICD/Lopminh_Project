/** Chuẩn hóa tiếng Việt về dạng dựng sẵn (NFC) — tránh lỗi "văng dấu". */
export function nfc(s: string): string {
  return s.normalize("NFC");
}

/** Chỉ dùng cho dữ liệu JSON; chuẩn hóa chuỗi lồng nhau trước khi lưu/gọi AI. */
export function nfcJson<T>(value: T): T {
  if (typeof value === "string") return nfc(value) as T;
  if (Array.isArray(value)) return value.map(nfcJson) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, nfcJson(v)])) as T;
  return value;
}

/** Bỏ dấu để tìm kiếm/so khớp: "Tâm" → "tam", "Đạt" → "dat". */
export function stripDiacritics(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Viết hoa chữ đầu câu: "cô" → "Cô". */
export function capFirst(s: string): string {
  return s ? s.charAt(0).toLocaleUpperCase("vi") + s.slice(1) : s;
}
