import { describe, expect, it } from "vitest";
import { StorageEngine, type CloudStorage } from "./engine";
import { accountSeed } from "./import";
import { DEMO_PROFILES } from "@/lib/demo/data";

function fixture() {
  const local = new Map<string, string>();
  const store = new StorageEngine(() => ({ getItem: k => local.get(k) ?? null, setItem: (k, v) => { local.set(k, v); }, removeItem: k => { local.delete(k); } }));
  return { store, local };
}
function deferred() { let done!: () => void; const promise = new Promise<void>(resolve => { done = resolve; }); return { promise, done }; }
describe("lưu dữ liệu theo tài khoản", () => {
  it("demo lưu đúng localStorage; dữ liệu cloud không đè bản trên máy", async () => {
    const { store, local } = fixture(); store.write("lm:chat:p", ["demo"]);
    const writes: unknown[] = [];
    store.activate({ "lm:chat:p": ["cloud"] }, { save: async (_, value) => { writes.push(value); }, remove: async () => {} });
    expect(store.read("lm:chat:p", [])).toEqual(["cloud"]);
    store.write("lm:chat:p", ["new"]); await store.flush();
    expect(writes).toEqual([["new"]]); expect(JSON.parse(local.get("lm:chat:p")!)).toEqual(["demo"]);
    store.activate(null, null); expect(store.read("lm:chat:p", [])).toEqual(["demo"]);
  });
  it("đổi tài khoản 10 vòng không lộ cache; callback cũ không ghi tài khoản mới", async () => {
    const { store } = fixture(); const saved: string[] = [];
    for (let i = 0; i < 10; i++) {
      const oldEpoch = store.epoch;
      store.activate({ "lm:chat:same": [i] }, { save: async () => { saved.push(String(i)); }, remove: async () => {} });
      store.write("lm:chat:same", ["stale"], oldEpoch);
      expect(store.read("lm:chat:same", [])).toEqual([i]);
    }
    await store.flush(); expect(saved).toEqual([]);
  });
  it("ghi nối tiếp giữ bản mới nhất khi request trước chậm", async () => {
    const { store } = fixture(), gate = deferred(); const values: unknown[] = [];
    store.activate({}, { save: async (_, value) => { values.push(value); if (value === 1) await gate.promise; }, remove: async () => {} });
    store.write("x", 1); store.write("x", 2); gate.done(); await store.flush();
    expect(values).toEqual([1, 2]); expect(store.read("x", 0)).toBe(2);
  });
  it("lỗi mạng giữ bản nháp và báo chưa lưu; thử lại thành công", async () => {
    const { store } = fixture(); let fail = true; let saved: unknown;
    store.activate({}, { save: async (_, value) => { if (fail) throw Error("offline"); saved = value; }, remove: async () => {} });
    store.write("x", 2); await store.flush(); expect(store.unsaved).toBe(true); expect(store.read("x", 0)).toBe(2);
    fail = false; await store.flush(); expect(saved).toBe(2); expect(store.unsaved).toBe(false);
  });
  it("xóa đợi ghi cũ xong rồi xóa server; callback đang xóa không khôi phục chat", async () => {
    const { store } = fixture(), gate = deferred(), deletion = deferred(); const ops: string[] = [];
    const remote: CloudStorage = { save: async () => { ops.push("save"); await gate.promise; }, remove: async () => { ops.push("delete"); await deletion.promise; } };
    store.activate({}, remote); store.write("chat", [1]); const removing = store.remove(["chat"]);
    gate.done(); await store.flush(); await Promise.resolve(); store.write("chat", [2]); deletion.done(); await removing;
    expect(ops).toEqual(["save", "delete"]); expect(store.read("chat", [])).toEqual([]);
  });
  it("xóa server lỗi không giả vờ đã xóa; ghi đang chạy ở tài khoản cũ không chạm tài khoản mới", async () => {
    const { store } = fixture(), gate = deferred();
    store.activate({ chat: [1] }, { save: () => gate.promise, remove: async () => { throw Error("offline"); } });
    await expect(store.remove(["chat"])).rejects.toThrow(); expect(store.read("chat", [])).toEqual([1]);
    store.write("chat", [2]); store.activate({ chat: [3] }, { save: async () => {}, remove: async () => {} });
    gate.done(); await Promise.resolve(); expect(store.read("chat", [])).toEqual([3]);
  });
  it("không đồng ý nhập thì không có hồ sơ/ghi chú demo; đồng ý chỉ sao chép khóa hợp lệ", () => {
    const own = { ...DEMO_PROFILES[0], id: "user-1" };
    const clean = accountSeed(own, null);
    expect(clean["lm:profiles"]).toEqual([own]); expect(clean[`lm:notes:${own.id}`]).toEqual([]);
    const local = { "lm:profiles": DEMO_PROFILES, "lm:chat:gv-mai-hoa": ["private"], "sb-auth-token": "must not copy" };
    const copied = accountSeed(own, local);
    expect(copied["lm:profiles"]).toHaveLength(4);
    expect(copied["lm:chat:gv-mai-hoa"]).toEqual(["private"]); expect(copied["sb-auth-token"]).toBeUndefined();
    expect(local["lm:chat:gv-mai-hoa"]).toEqual(["private"]);
  });
});
