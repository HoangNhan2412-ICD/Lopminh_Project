export type Gender = "nam" | "nu";

export type LoadLevel = "thu-thai" | "on-dinh" | "cang-thang" | "qua-tai";

export type AccentKey = "bang" | "phan" | "sen" | "troi" | "la";

export interface Kpi {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: "%" | "tiết" | "em";
  note?: string;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  /** Tên dùng để gọi, ví dụ "Mai Hoa". Bé Bảng gọi "Cô Mai Hoa". */
  callName: string;
  gender: Gender;
  /** Danh xưng riêng nếu người dùng muốn, ví dụ "Cô giáo". Để trống thì theo giới tính. */
  honorificOverride?: string;
  school: string;
  team: string;
  subject: string;
  yearsTeaching: number;
  teachingStyle: { summary: string; tags: string[] };
  interests: string[];
  kpis: Kpi[];
  accent: AccentKey;
  homeroomClassId?: string;
}

export type ClassRole = "chu-nhiem" | "bo-mon";

export interface ClassInfo {
  id: string;
  name: string;
  role: ClassRole;
  subject: string;
  studentIds: string[];
}

export interface Student {
  id: string;
  fullName: string;
  /** Tên gọi trong lớp, thường là chữ cuối. */
  shortName: string;
  gender: Gender;
  classId: string;
  traits: string[];
  hocLuc?: "gioi" | "kha" | "trung-binh" | "yeu";
  noiBat?: { loai: "thanh-tich" | "can-ho-tro"; text: string };
}

export type NoteKind = "chuyen-can" | "suc-khoe" | "tam-ly" | "hoc-tap" | "khen-thuong" | "khac";

export interface StudentNote {
  id: string;
  studentId: string | null;
  /** Tên như giáo viên gõ/nói, giữ lại khi chưa khớp được học sinh nào. */
  rawName: string;
  classId: string;
  kind: NoteKind;
  text: string;
  /** Ngày hết hiệu lực, dạng YYYY-MM-DD. */
  until?: string;
  absentToday?: boolean;
  source: "giong-noi" | "go-tay" | "dong-bo";
  createdAt: string;
  /** Ảnh JPEG đã thu nhỏ, chỉ lưu trên máy trong giai đoạn thử nghiệm. */
  evidence?: string[];
}

export interface Period {
  index: number;
  start: string; // "07:00"
  end: string; // "07:45"
  classId: string;
}

/** Thời khóa biểu theo thứ: 1 = Thứ Hai … 6 = Thứ Bảy. */
export type Timetable = Record<number, Period[]>;
