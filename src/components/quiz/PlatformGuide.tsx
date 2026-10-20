"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { speakVi } from "@/lib/speech";
import { cn } from "@/lib/text";

/*
  Hướng dẫn từng bước cho thầy cô lớn tuổi. Tên nút trên các trang có thể đổi chút theo phiên bản,
  nên câu chữ tả nút bằng cả tên tiếng Việt lẫn tiếng Anh. Ảnh chụp màn hình nhóm sẽ bổ sung
  vào public/guides/<nen-tang>/<buoc>.png rồi thêm trường `image` cho từng bước.
*/

type Platform = "wayground" | "kahoot" | "quizlet";

const GUIDES: Record<Platform, { name: string; steps: string[] }> = {
  wayground: {
    name: "Wayground (Quizizz)",
    steps: [
      "Bấm nút “Tải file Wayground” ở trên. File Excel sẽ nằm trong thư mục Tải về của máy.",
      "Mở trang wayground.com và đăng nhập bằng tài khoản giáo viên (có thể dùng tài khoản Google).",
      "Bấm nút “Tạo” (Create), chọn “Bài đánh giá” hoặc “Quiz”.",
      "Chọn cách tạo “Nhập từ bảng tính” (Spreadsheet / Import), rồi chọn file Excel vừa tải.",
      "Xem lại câu hỏi, bấm “Xuất bản” (Publish). Muốn chơi cả lớp thì bấm “Bắt đầu trực tiếp” (Live) để lấy link phòng.",
      "Chép link phòng, dán vào ô “Link phòng quiz” ở dưới. Lớp Mình sẽ làm mã QR to để chiếu cho học sinh quét.",
    ],
  },
  kahoot: {
    name: "Kahoot",
    steps: [
      "Bấm nút “Tải file Kahoot” ở trên để lấy file Excel.",
      "Mở trang kahoot.com, đăng nhập, bấm “Tạo” (Create) rồi chọn “Kahoot”.",
      "Bấm “Thêm câu hỏi” (Add question), chọn “Nhập bảng tính” (Import spreadsheet), rồi kéo file Excel vào.",
      "Kiểm tra câu hỏi và đáp án đúng, bấm “Xong” (Done) để lưu.",
      "Bấm “Bắt đầu” (Start), chọn chế độ cổ điển. Màn hình hiện mã PIN; học sinh vào kahoot.it nhập mã, hoặc thầy cô chép link dán vào ô dưới để làm mã QR.",
    ],
  },
  quizlet: {
    name: "Quizlet",
    steps: [
      "Bấm nút “Chép cho Quizlet” ở trên. Câu hỏi và đáp án đã được chép sẵn.",
      "Mở trang quizlet.com, đăng nhập, bấm “Tạo” rồi chọn “Học phần” (Flashcard set).",
      "Bấm “+ Nhập” (Import), bấm vào ô trống rồi dán (Ctrl + V).",
      "Ở phần cách tách, chọn “Tab” giữa thuật ngữ và định nghĩa, “Dòng mới” giữa các thẻ, rồi bấm “Nhập”.",
      "Đặt tên học phần, bấm “Tạo”. Học sinh dùng chế độ “Học” hoặc “Kiểm tra”; muốn chơi cả lớp thì chọn “Quizlet Live”.",
    ],
  },
};

export function PlatformGuide() {
  const [tab, setTab] = useState<Platform>("wayground");
  const g = GUIDES[tab];
  return (
    <div>
      <div role="tablist" aria-label="Chọn nền tảng" className="flex gap-1 overflow-x-auto rounded-xl bg-surface-muted p-1">
        {(Object.keys(GUIDES) as Platform[]).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={tab === p}
            onClick={() => setTab(p)}
            className={cn("min-h-11 shrink-0 rounded-lg px-4 font-semibold", tab === p ? "bg-surface text-primary shadow-[var(--shadow-card)]" : "text-ink-muted")}
          >
            {GUIDES[p].name}
          </button>
        ))}
      </div>
      <ol className="mt-4 space-y-3">
        {g.steps.map((s, i) => (
          <li key={s} className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-fg">{i + 1}</span>
            <p className="pt-1.5 text-lg leading-relaxed">{s}</p>
          </li>
        ))}
      </ol>
      <Button variant="ghost" size="sm" className="mt-3" onClick={() => speakVi(g.steps.map((s, i) => `Bước ${i + 1}. ${s}`).join(" "))}>
        <Volume2 className="size-5" aria-hidden /> Đọc to các bước
      </Button>
    </div>
  );
}
