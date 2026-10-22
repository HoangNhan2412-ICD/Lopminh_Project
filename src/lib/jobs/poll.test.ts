// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/components/account/AccountProvider", () => ({ useAccount: () => ({ userId: "owner" }) }));
import { LessonJobs } from "@/components/lesson/LessonJobs";
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it("mất mạng rồi có mạng: tìm lại kết quả khi mở trang, không tạo job mới", async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn().mockRejectedValueOnce(Error("offline")).mockResolvedValue({ ok: true, json: async () => ({ jobs: [{ id: "one", status: "xong", progress: 100, step: "Đã xong", result: { id: "bai", title: "Bài đã soạn" } }] }) });
  vi.stubGlobal("fetch", fetcher);
  await act(async () => { render(createElement(LessonJobs, { profileId: "p", refresh: 0, onOpen: () => {} })); });
  expect(screen.getByText(/Tạm mất kết nối/)).toBeTruthy();
  await act(async () => { await vi.advanceTimersByTimeAsync(2500); });
  expect(screen.getByRole("button", { name: /Xem và lưu giáo án/ })).toBeTruthy();
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls.every(call => call[0].startsWith("/api/jobs/lesson?profileId="))).toBe(true);
});
