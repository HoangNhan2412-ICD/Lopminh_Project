import { afterEach, expect, it, vi } from "vitest";
import { nfcJson } from "./text";
import { logAiError } from "./ai/errors";
afterEach(() => vi.restoreAllMocks());
it("chuẩn hóa chuỗi lồng nhau, giữ số/null/boolean và không đổi đầu vào", () => {
  const raw = { title: "Tiếng Việt".normalize("NFD"), nested: ["Cô".normalize("NFD"), null, 5, true] };
  expect(nfcJson(raw)).toEqual({ title: "Tiếng Việt", nested: ["Cô", null, 5, true] });
  expect(raw.title).not.toBe("Tiếng Việt");
});
it("lỗi SDK chứa nội dung riêng chỉ ghi mã và loại", () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  logAiError({ status: 403, message: "nội dung trò chuyện riêng", response: { text: "thư riêng" } });
  expect(log).toHaveBeenCalledExactlyOnceWith("[ai]", { status: 403, kind: "key" });
});
