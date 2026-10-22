import { describe, expect, it, vi } from "vitest";
import { AiRequestError, classifyAiError, logAiError } from "./errors";

describe("lỗi Gemini", () => {
  it.each([400, 401, 403])("mã %i chỉ ra khóa sai hoặc API chưa bật", (status) => {
    expect(classifyAiError({ status }).kind).toBe("key");
    expect(classifyAiError({ status }).message).toContain("Khóa Gemini sai");
  });
  it.each([[404, "model", false], [429, "quota", true], [500, "overload", true], [503, "overload", true], [502, "overload", true]])("mã %i", (status, kind, retryable) => {
    expect(classifyAiError({ status })).toMatchObject({ status, kind, retryable });
  });
  it("đọc mã có cấu trúc, không suy mã từ nội dung người dùng", () => {
    expect(classifyAiError({ error: { code: 429 } }).kind).toBe("quota");
    expect(classifyAiError(new Error("học sinh nhắc số 429" )).kind).toBe("connection");
    expect(classifyAiError(null).status).toBe(0);
  });
  it("không tiết lộ message SDK hoặc khóa qua log và lỗi ném lại", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = { status: 403, message: "NOI_DUNG_RIENG KEY_GIA" };
    logAiError(error);
    expect(spy).toHaveBeenCalledWith("[ai]", { status: 403, kind: "key" });
    expect(new AiRequestError(error).message).not.toContain("KEY_GIA");
    spy.mockRestore();
  });
});
