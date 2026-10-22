import { beforeEach, describe, expect, it, vi } from "vitest";
import { jobExpired } from "./types";
const state = vi.hoisted(() => ({ auth: true, after: [] as (() => Promise<void>)[], updates: [] as Record<string, unknown>[], generate: vi.fn(), duplicate: false }));
vi.mock("next/server", () => ({ after: (fn: () => Promise<void>) => state.after.push(fn) }));
vi.mock("@/lib/lesson/generate-server", () => ({ parseLessonInput: (v: unknown) => v, generateLesson: state.generate }));
vi.mock("@/lib/supabase/server", () => ({ authenticatedSupabase: async () => state.auth ? {
  userId: "owner", client: { from: (table: string) => {
    let patch: Record<string, unknown> | null = null;
    const chain = {
      update: (v: Record<string, unknown>) => { patch = v; return chain; },
      eq: (field: string) => { if (field === "user_id" && patch) state.updates.push(patch); return chain; },
      in: () => chain, lt: async () => ({ error: null }), select: () => chain,
      insert: () => chain,
      single: async () => state.duplicate ? { data: null, error: { code: "23505" } } : { data: { id: "job-1" }, error: null },
      maybeSingle: async () => ({ data: table === "app_state" ? { value: [{ id: "profile-1" }] } : { id: "job-1" }, error: null }),
    }; return chain;
  } },
} : null }));
import { POST } from "@/app/api/jobs/lesson/route";
const request = () => new Request("http://localhost/api/jobs/lesson", { method: "POST", body: JSON.stringify({ input: { profile: { id: "profile-1" }, request: { topic: "Bài thử" } }, meta: { requestId: "11111111-1111-4111-8111-111111111111", lessonId: "bai-1", theme: "bang-xanh", tiers: { coBan: [], nangCao: [] } } }) });
describe("job soạn bài", () => {
  beforeEach(() => { state.auth = true; state.after = []; state.updates = []; state.duplicate = false; state.generate.mockReset(); });
  it("trả 202 trước khi soạn; callback tiếp tục ghi kết quả không cần client", async () => {
    state.generate.mockImplementation(async (_input, progress) => { await progress("Đang soạn", 25); return { mode: "demo", plan: { title: "Bài thử" } }; });
    const response = await POST(request()); expect(response.status).toBe(202); expect(state.generate).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({ jobId: "job-1" });
    await state.after[0]();
    expect(state.updates.some(p => p.progress === 25)).toBe(true);
    expect(state.updates.at(-1)).toMatchObject({ status: "xong", progress: 100, result: { id: "bai-1", title: "Bài thử" } });
  });
  it("request gửi lại lấy job cũ, không soạn lần hai", async () => {
    state.duplicate = true; expect((await POST(request())).status).toBe(202); expect(state.after).toHaveLength(0);
  });
  it("lỗi worker trả thông báo an toàn, không lưu nội dung lỗi thô", async () => {
    state.generate.mockRejectedValue(Error("sensitive text")); await POST(request()); await state.after[0]();
    expect(state.updates.at(-1)?.status).toBe("loi"); expect(JSON.stringify(state.updates)).not.toContain("sensitive text");
  });
  it("không có tài khoản thì không tạo job", async () => {
    state.auth = false; expect((await POST(request())).status).toBe(401); expect(state.after).toHaveLength(0);
  });
  it("chỉ job còn chờ/chạy hơn 5 phút mới quá hạn", () => {
    const created_at = "2026-10-21T00:00:00Z", now = Date.parse(created_at) + 300001;
    expect(jobExpired({ status: "dang-chay", created_at }, now)).toBe(true);
    expect(jobExpired({ status: "cho", created_at }, now - 2)).toBe(false);
    expect(jobExpired({ status: "xong", created_at }, now)).toBe(false);
  });
});
