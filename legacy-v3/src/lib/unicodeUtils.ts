/**
 * LỚP MÌNH (lopminhedu.vn) - UNICODE VIETNAMESE NORMALIZATION UTILITIES
 * 
 * Chuẩn hóa Unicode tiếng Việt sang dạng Canonical Composition (NFC - Dựng sẵn).
 * Ngăn chặn triệt để hiện tượng vỡ dấu thanh (ví dụ: "Số ́", "Xuâ ́ t" bị văng dấu ra ngoài)
 * do lỗi bàn phím Unikey/EVKey tổ hợp NFD hoặc clipboard sao chép từ các nguồn khác nhau.
 */

export function normalizeNFC(str: string | null | undefined): string {
  if (!str) return '';
  return str.normalize('NFC');
}

/**
 * Chuẩn hóa đệ quy toàn bộ chuỗi ký tự trong object sang Unicode NFC
 */
export function deepNormalizeNFC<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return obj.normalize('NFC') as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepNormalizeNFC(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const copy = { ...obj } as Record<string, unknown>;
    for (const key of Object.keys(copy)) {
      copy[key] = deepNormalizeNFC(copy[key]);
    }
    return copy as T;
  }
  return obj;
}
