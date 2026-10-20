"use client";

import "driver.js/dist/driver.css";
import { CircleHelp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { speakVi } from "@/lib/speech";
import { useApp } from "@/lib/store/app-store";
import { toursFor } from "@/lib/tours";

const SEEN = "lm:tour-seen";

function routeKey(pathname: string) {
  const keys = ["/soan-bai", "/phong-quiz", "/hop-thu", "/kho-du-lieu", "/tam-tinh", "/song-ngu", "/ky-nang-so", "/ho-so"];
  return keys.find((k) => pathname.startsWith(k)) ?? "/";
}

/** Nút dấu hỏi trên đầu trang: mở tour của trang đang xem. Lần đầu vào app tự mở tour tổng quan. */
export function GuideTour() {
  const pathname = usePathname();
  const { profile, ready } = useApp();

  const start = useCallback(async () => {
    const { driver } = await import("driver.js");
    const steps = toursFor(profile)[routeKey(pathname)] ?? [];
    const visible = steps.filter((s) => !s.element || document.querySelector(s.element));
    if (!visible.length) return;
    const d = driver({
      showProgress: visible.length > 1,
      progressText: "{{current}}/{{total}}",
      nextBtnText: "Tiếp",
      prevBtnText: "Quay lại",
      doneBtnText: "Xong",
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      popoverClass: "lm-tour",
      steps: visible.map((s) => ({
        element: s.element,
        popover: { title: s.title, description: s.text },
      })),
      onPopoverRender: (popover, { state }) => {
        const step = visible[state.activeIndex ?? 0];
        const read = document.createElement("button");
        read.type = "button";
        read.className = "lm-tour-read";
        read.textContent = "Đọc to";
        read.onclick = () => speakVi(`${step.title}. ${step.text}`);
        const later = document.createElement("button");
        later.type = "button";
        later.className = "lm-tour-later";
        later.textContent = "Để sau";
        later.onclick = () => d.destroy();
        popover.footerButtons.prepend(read);
        popover.footer.prepend(later);
      },
      onDestroyed: () => window.speechSynthesis?.cancel(),
    });
    d.drive();
  }, [pathname, profile]);

  // Lần đầu dùng ứng dụng (trên trình duyệt này): tự mở tour tổng quan ở trang Hôm Nay
  useEffect(() => {
    if (!ready || pathname !== "/") return;
    let seen = true;
    try {
      seen = localStorage.getItem(SEEN) === "1";
      if (!seen) localStorage.setItem(SEEN, "1");
    } catch {
      /* bỏ qua */
    }
    if (!seen) {
      const t = setTimeout(() => void start(), 900);
      return () => clearTimeout(t);
    }
  }, [ready, pathname, start]);

  return (
    <button
      onClick={() => void start()}
      className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-primary hover:bg-surface-muted"
      aria-label="Hướng dẫn trang này"
      title="Hướng dẫn trang này"
    >
      <CircleHelp className="size-6" />
    </button>
  );
}
