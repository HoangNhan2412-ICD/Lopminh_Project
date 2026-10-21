import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_PROFILES } from "@/lib/demo/data";

vi.mock("@/lib/ai/client", () => ({ getGemini: vi.fn() }));
import { getGemini } from "@/lib/ai/client";
import { POST } from "./route";

afterEach(() => vi.restoreAllMocks());

describe("chat xử lý lỗi trước và trong luồng", () => {
  const request = () => new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ profile: DEMO_PROFILES[0], load: null, todayContext: "", history: [], message: "Xin chào" }) });
  it("khóa sai: lỗi chunk đầu trả HTTP 400 và lời nhắn an toàn", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getGemini).mockReturnValue({ models: { generateContentStream: async function* () { throw { status: 400, message: "KEY_GIA" }; } } } as unknown as NonNullable<ReturnType<typeof getGemini>>);
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.stringContaining("Khóa Gemini sai"), code: "key" });
  });
  it("lỗi giữa luồng giữ chữ đã nhận và hiện nguyên nhân", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getGemini).mockReturnValue({ models: { generateContentStream: async function* () { yield { text: "Chào mình. " }; throw { status: 429 }; } } } as unknown as NonNullable<ReturnType<typeof getGemini>>);
    const response = await POST(request());
    expect(await response.text()).toContain("Chào mình. \n\nGemini đã hết hạn mức");
  });
});
