import type { ThemeKey } from "@/lib/lesson/types";

/*
  Bảng màu cho slide xuất ra (PowerPoint dùng mã hex thật, nên màu nằm ở đây thay vì trong CSS).
  Ba theme lấy từ cùng bộ màu của app: xanh bảng, giấy kem, tươi sáng (cho tiểu học).
*/

export interface SlideTheme {
  key: ThemeKey;
  label: string;
  bg: string;
  title: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  panel: string;
  panelText: string;
  line: string;
  /** Màu nhánh sơ đồ tư duy và bảng so sánh. */
  branch: string[];
  tray: boolean;
}

export const THEMES: Record<ThemeKey, SlideTheme> = {
  "bang-xanh": {
    key: "bang-xanh",
    label: "Bảng xanh",
    bg: "1E3A2F",
    title: "F3EFE2",
    text: "EAE6D8",
    muted: "A9B8AE",
    accent: "E8B04A",
    accentText: "1F2A24",
    panel: "2A4A3D",
    panelText: "F3EFE2",
    line: "5E7A6C",
    branch: ["E8B04A", "8FC1A9", "F2A7A0", "9CC3E6", "E6D28A", "C9B3E0"],
    tray: true,
  },
  "giay-kem": {
    key: "giay-kem",
    label: "Giấy kem",
    bg: "FAF7F0",
    title: "1E3A2F",
    text: "1F2A24",
    muted: "6B756F",
    accent: "B7791F",
    accentText: "FFFFFF",
    panel: "FFFFFF",
    panelText: "1F2A24",
    line: "E3DDD0",
    branch: ["1E3A2F", "B7791F", "2B6CB0", "B5476B", "2F7D4F", "6B5BA8"],
    tray: false,
  },
  "tuoi-sang": {
    key: "tuoi-sang",
    label: "Tươi sáng",
    bg: "FFFFFF",
    title: "2B6CB0",
    text: "1F2A24",
    muted: "5B6B7A",
    accent: "F2A93B",
    accentText: "1F2A24",
    panel: "EAF3FB",
    panelText: "1F2A24",
    line: "CFE0F0",
    branch: ["2B6CB0", "F2A93B", "E05A6E", "2F9E6E", "8A63D2", "E07B39"],
    tray: false,
  },
};

/** Bốn màu ô trắc nghiệm A-B-C-D, dễ phân biệt cả với người khó nhìn màu nhờ có chữ cái và hình. */
export const QUIZ_COLORS = ["C8423B", "2B6CB0", "D9921F", "2F7D4F"] as const;
export const QUIZ_LETTERS = ["A", "B", "C", "D"] as const;
