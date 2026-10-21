import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ auth: true, calls: [] as unknown[][], rows: [{ key: "lm:chat:p", value: ["own"] }], rpc: vi.fn(async () => ({ error: null })) }));
vi.mock("@/lib/supabase/server", () => ({ authenticatedSupabase: async () => mock.auth ? {
  userId: "account-a", client: {
    rpc: mock.rpc,
    from: (table: string) => {
      mock.calls.push(["from", table]);
      const chain = {
        select: (fields: string) => { mock.calls.push(["select", fields]); return chain; },
        eq: (key: string, value: string) => { mock.calls.push(["eq", key, value]); return chain; },
        order: () => chain,
        range: async () => ({ data: mock.rows, error: null }),
        upsert: async (row: unknown) => { mock.calls.push(["upsert", row]); return { error: null }; },
        delete: () => chain,
        in: async (key: string, values: string[]) => { mock.calls.push(["in", key, values]); return { error: null }; },
      }; return chain;
    },
  },
} : null }));
import { GET, PUT, DELETE, POST } from "@/app/api/storage/route";
import { DEMO_PROFILES } from "@/lib/demo/data";
const req = (body: unknown, method = "PUT") => new Request("http://localhost/api/storage", { method, body: JSON.stringify(body) });
describe("API lưu trữ không tin userId từ trình duyệt", () => {
  beforeEach(() => { mock.auth = true; mock.calls = []; mock.rpc.mockClear(); });
  it("chưa đăng nhập không đọc/ghi/xóa được", async () => {
    mock.auth = false;
    expect((await GET()).status).toBe(401);
    expect((await PUT(req({}))).status).toBe(401);
    expect((await DELETE(req({}, "DELETE"))).status).toBe(401);
    expect(mock.calls).toEqual([]);
  });
  it("GET buộc lọc theo tài khoản đã xác minh và không cache", async () => {
    const res = await GET(); expect(res.headers.get("Cache-Control")).toContain("no-store");
    expect(mock.calls).toContainEqual(["eq", "user_id", "account-a"]);
    expect((await res.json()).state["lm:chat:p"]).toEqual(["own"]);
  });
  it("từ chối ghi từ callback của tài khoản cũ", async () => {
    expect((await PUT(req({ userId: "account-b", key: "lm:chat:p", value: [] }))).status).toBe(400);
    expect(mock.calls).toEqual([]);
  });
  it("xóa chỉ nhận khóa chat và gắn điều kiện chủ tài khoản", async () => {
    expect((await DELETE(req({ userId: "account-a", keys: ["lm:notes:p"] }, "DELETE"))).status).toBe(400);
    expect((await DELETE(req({ userId: "account-a", keys: ["lm:chat:p", "lm:chatmem:p"] }, "DELETE"))).status).toBe(200);
    expect(mock.calls).toContainEqual(["eq", "user_id", "account-a"]);
    expect(mock.calls).toContainEqual(["in", "key", ["lm:chat:p", "lm:chatmem:p"]]);
  });
  it("không nhận giới tính bị thiếu, giữ danh xưng người dùng đã chọn", async () => {
    const profile = { ...DEMO_PROFILES[0], id: "account-a", gender: "nam" };
    expect((await POST(req({ profile: { ...profile, gender: undefined }, state: {} }, "POST"))).status).toBe(400);
    const res = await POST(req({ profile, state: { "lm:profiles": [profile] } }, "POST"));
    expect(res.status).toBe(200);
    expect(mock.rpc).toHaveBeenCalledWith("initialize_account", expect.objectContaining({ p_profile: expect.objectContaining({ gender: "nam" }) }));
  });
});
