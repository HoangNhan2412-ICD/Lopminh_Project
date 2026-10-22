import { afterEach, expect, it, vi } from "vitest";
import { z } from "zod";
const call = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/client", () => ({ getGemini: () => ({ models: { generateContent: call } }) }));
import { generateJson } from "./json";
afterEach(() => { vi.restoreAllMocks(); call.mockReset(); });
it("prompt và JSON trả về được chuẩn hóa NFC", async () => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  call.mockResolvedValue({ text: JSON.stringify({ title: "Tiếng Việt".normalize("NFD") }) });
  const output = await generateJson({ role: "fast", system: "Cô".normalize("NFD"), user: "Bài".normalize("NFD"), schema: z.object({ title: z.string() }), label: "test" });
  expect(output.title).toBe("Tiếng Việt");
  expect(call.mock.calls[0][0].config.systemInstruction).toBe("Cô");
  expect(call.mock.calls[0][0].contents[0].parts[0].text).toBe("Bài");
});
it("không thử lại khi ngân sách route không đủ cho lần sau", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  call.mockRejectedValue({ status: 503, message: "nội dung riêng" });
  await expect(generateJson({ role: "fast", system: "", user: "", schema: z.object({}), label: "test", totalTimeoutMs: 1000 })).rejects.toThrow("quá tải");
  expect(call).toHaveBeenCalledTimes(1);
});
