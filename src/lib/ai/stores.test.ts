import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ userId: "account-a", configured: true }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ authenticatedSupabase: async () => ({ userId: state.userId }) }));
vi.mock("@/lib/supabase/config", () => ({ supabaseConfig: () => state.configured ? {} : null }));
import { privateStoreName, searchStores, signedStoreName } from "./stores";
describe("kho Gemini theo tài khoản", () => {
  beforeEach(() => { state.userId = "account-a"; state.configured = true; vi.stubEnv("GEMINI_API_KEY", "test-key-only"); vi.stubEnv("GEMINI_SHARED_STORE", "fileSearchStores/shared"); });
  it("không nhận tên kho tự gán hoặc chữ ký bị sửa", async () => {
    expect(await privateStoreName("fileSearchStores/private")).toBeNull();
    const token = await signedStoreName("fileSearchStores/private");
    expect(await privateStoreName(token)).toBe("fileSearchStores/private");
    expect(await privateStoreName(token.replace("private", "another"))).toBeNull();
  });
  it("chữ ký tài khoản A không cho B đọc hoặc ghi kho A", async () => {
    const token = await signedStoreName("fileSearchStores/private"); state.userId = "account-b";
    expect(await privateStoreName(token)).toBeNull(); expect(await searchStores(token)).toEqual(["fileSearchStores/shared"]);
  });
  it("demo giữ kho cũ; chỉ kho chung do server cấu hình được dùng chung", async () => {
    state.configured = false;
    expect(await searchStores("fileSearchStores/private")).toEqual(["fileSearchStores/shared", "fileSearchStores/private"]);
    expect(await searchStores("https://invalid.example")).toEqual(["fileSearchStores/shared"]);
  });
});
