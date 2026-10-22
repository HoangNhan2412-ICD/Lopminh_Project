import {
  BookOpen,
  CalendarCheck,
  Coffee,
  FolderOpen,
  FileOutput,
  Languages,
  Mail,
  MonitorSmartphone,
  QrCode,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  id: string;
  label: string;
  short: string;
  items: NavItem[];
}

/** Ba trụ cột của Lớp Mình (SPEC mục 0). */
export const NAV: NavGroup[] = [
  {
    id: "giam-sat",
    label: "Giám sát & Nhập liệu",
    short: "Lớp học",
    items: [
      { href: "/", label: "Lớp Mình Hôm Nay", icon: CalendarCheck },
      { href: "/hop-thu", label: "Hộp Thư Công Việc", icon: Mail },
      { href: "/kho-du-lieu", label: "Kho Dữ Liệu", icon: FolderOpen },
    ],
  },
  {
    id: "soan-giang",
    label: "Soạn Giảng Số",
    short: "Soạn giảng",
    items: [
      { href: "/soan-bai", label: "Soạn Bài", icon: BookOpen },
      { href: "/xuong-hoc-lieu", label: "Xưởng học liệu", icon: FileOutput },
      { href: "/phong-quiz", label: "Phòng Quiz", icon: QrCode },
    ],
  },
  {
    id: "goc-thay-co",
    label: "Góc Thầy Cô",
    short: "Góc riêng",
    items: [
      { href: "/tam-tinh", label: "Tâm Tình", icon: Coffee },
      { href: "/song-ngu", label: "Song Ngữ", icon: Languages },
      { href: "/ky-nang-so", label: "Kỹ Năng Số", icon: MonitorSmartphone },
    ],
  },
];

export function groupOf(pathname: string): NavGroup {
  return NAV.find((g) => g.items.some((i) => (i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)))) ?? NAV[0];
}
