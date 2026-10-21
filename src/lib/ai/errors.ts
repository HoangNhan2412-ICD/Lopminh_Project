/** Chỉ trả thông tin cho phép hiển thị; không chuyển tiếp message thô của SDK. */
export function classifyAiError(error: unknown) {
  const obj = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const nested = obj.error && typeof obj.error === "object" ? obj.error as Record<string, unknown> : {};
  const candidate = Number(obj.status ?? obj.statusCode ?? nested.code ?? obj.code);
  const status = Number.isInteger(candidate) && candidate >= 400 && candidate <= 599 ? candidate : 0;
  const kind = [400, 401, 403].includes(status) ? "key"
    : status === 404 ? "model"
    : status === 429 ? "quota"
    : status >= 500 ? "overload" : "connection";
  const messages = {
    key: "Khóa Gemini sai hoặc chưa bật quyền dùng API. Nhờ người quản lý kiểm tra lại khóa nhé.",
    model: "Tên model Gemini không tồn tại hoặc chưa được hỗ trợ. Nhờ người quản lý kiểm tra cấu hình model nhé.",
    quota: "Gemini đã hết hạn mức hoặc nhận quá nhiều yêu cầu. Mình chờ một chút rồi thử lại nhé.",
    overload: "Máy chủ Google đang quá tải hoặc tạm gặp lỗi. Mình thử lại sau ít phút nhé.",
    connection: "Bé Bảng chưa kết nối được với Gemini. Mình kiểm tra mạng rồi thử lại nhé.",
  };
  return { status, kind, message: messages[kind], retryable: kind === "quota" || kind === "overload" };
}

export function logAiError(error: unknown) {
  const { status, kind } = classifyAiError(error);
  console.error("[ai]", { status, kind });
}

export class AiRequestError extends Error {
  readonly status: number;
  constructor(error: unknown) {
    const classified = classifyAiError(error);
    super(classified.message);
    this.name = "AiRequestError";
    this.status = classified.status;
  }
}
