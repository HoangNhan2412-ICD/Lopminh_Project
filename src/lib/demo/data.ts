import type { ClassInfo, Student, StudentNote, TeacherProfile, Timetable } from "@/lib/types";

/**
 * Dữ liệu mẫu cho CHẾ ĐỘ DEMO (chưa cấu hình Supabase).
 * Ba hồ sơ có giới tính khác nhau để kiểm tra xưng hô khi đổi tài khoản.
 */

export const DEMO_PROFILES: TeacherProfile[] = [
  {
    id: "gv-mai-hoa",
    fullName: "Nguyễn Thị Mai Hoa",
    callName: "Mai Hoa",
    gender: "nu",
    school: "THCS Chu Văn An, Hà Nội",
    team: "Tổ Tự nhiên",
    subject: "Toán",
    yearsTeaching: 24,
    teachingStyle: {
      summary: "Dạy chậm mà chắc, hay dùng hình ảnh đời thường để giải thích công thức.",
      tags: ["Bao dung", "Chậm mà chắc", "Dạy bằng hình ảnh"],
    },
    interests: ["Đọc sách lịch sử", "Trồng lan", "Cờ vua"],
    kpis: [
      { id: "k1", title: "Học sinh 9A đạt chuẩn môn Toán", current: 97, target: 100, unit: "%", note: "Còn 1 em đang được kèm" },
      { id: "k2", title: "Tiết dạy đổi mới phương pháp", current: 6, target: 8, unit: "tiết" },
      { id: "k3", title: "Học sinh khá giỏi lớp 9A", current: 72, target: 80, unit: "%" },
    ],
    accent: "bang",
    homeroomClassId: "9A",
  },
  {
    id: "gv-duc-nam",
    fullName: "Nguyễn Đức Nam",
    callName: "Nam",
    gender: "nam",
    school: "THPT Nguyễn Thị Minh Khai, TP.HCM",
    team: "Tổ Vật lý – Công nghệ",
    subject: "Vật lý",
    yearsTeaching: 12,
    teachingStyle: {
      summary: "Thích cho học sinh làm thí nghiệm trước rồi mới rút ra công thức.",
      tags: ["Thực hành trước", "Hài hước", "Thi đua nhóm"],
    },
    interests: ["Guitar điện", "Nhạc rock", "Chạy bộ"],
    kpis: [
      { id: "k1", title: "Học sinh 11A1 trên trung bình môn Lý", current: 88, target: 95, unit: "%" },
      { id: "k2", title: "Học sinh dự thi HSG cấp trường", current: 3, target: 5, unit: "em" },
    ],
    accent: "troi",
    homeroomClassId: "11A1",
  },
  {
    id: "gv-thu-phuong",
    fullName: "Lê Thu Phương",
    callName: "Phương",
    gender: "nu",
    school: "THCS Lê Lợi, Đà Nẵng",
    team: "Tổ Xã hội",
    subject: "Ngữ văn",
    yearsTeaching: 7,
    teachingStyle: {
      summary: "Khơi gợi cảm xúc trước, phân tích sau; hay cho học sinh đóng vai nhân vật.",
      tags: ["Truyền cảm hứng", "Đóng vai", "Lắng nghe"],
    },
    interests: ["Viết nhật ký", "Nấu ăn", "Phim tài liệu"],
    kpis: [
      { id: "k1", title: "Học sinh 7B đạt chuẩn đọc hiểu", current: 90, target: 95, unit: "%" },
    ],
    accent: "sen",
    homeroomClassId: "7B",
  },
];

function students(classId: string, list: [string, "nam" | "nu", string[]?][]): Student[] {
  return list.map(([fullName, gender, traits = []], i) => {
    const parts = fullName.split(" ");
    return {
      id: `${classId}-${i + 1}`,
      fullName,
      shortName: parts[parts.length - 1],
      gender,
      classId,
      traits,
    };
  });
}

export const DEMO_STUDENTS: Student[] = [
  ...students("9A", [
    ["Hoàng Minh An", "nam", ["Hay ốm vặt"]],
    ["Lê Thanh Bình", "nam", ["Tiếng Anh tốt", "Tiến bộ nhanh"]],
    ["Phạm Thu Chi", "nu", ["Hướng nội", "Cần khích lệ"]],
    ["Trần Tuấn Dũng", "nam", ["Thích vận động"]],
    ["Vũ Ngọc Hà", "nu"],
    ["Đỗ Đức Khang", "nam"],
    ["Ngô Bảo Linh", "nu", ["Lớp trưởng"]],
    ["Bùi Minh Tâm", "nam", ["Hổng kiến thức căn bậc hai"]],
  ]),
  ...students("9C", [
    ["Nguyễn Gia Huy", "nam"],
    ["Lý Thảo My", "nu"],
    ["Trịnh Quốc Bảo", "nam", ["Nợ bài kiểm tra 15 phút"]],
    ["Phan Khánh Vy", "nu"],
    ["Đặng Hữu Phúc", "nam"],
  ]),
  ...students("11A1", [
    ["Võ Minh Quân", "nam", ["Thi HSG Lý"]],
    ["Huỳnh Anh Thư", "nu"],
    ["Tạ Gia Bảo", "nam", ["Hay quên dụng cụ"]],
    ["Lâm Ngọc Trâm", "nu", ["Ngại phát biểu"]],
    ["Châu Thành Đạt", "nam"],
    ["Mai Phương Uyên", "nu"],
  ]),
  ...students("11A2", [
    ["Kiều Văn Long", "nam"],
    ["Hồ Diệu Linh", "nu", ["Dưới trung bình môn Lý"]],
    ["Dương Nhật Nam", "nam"],
    ["Tôn Nữ Bảo Ngọc", "nu"],
  ]),
  ...students("10A1", [
    ["La Hoàng Phát", "nam"],
    ["Quách Minh Thy", "nu"],
    ["Văn Tiến Lộc", "nam", ["Nợ bài thực hành"]],
  ]),
  ...students("7B", [
    ["Nguyễn Hải Đăng", "nam"],
    ["Trần Bảo Hân", "nu", ["Thích viết văn"]],
    ["Lê Gia Khiêm", "nam", ["Hiếu động"]],
    ["Phạm Mỹ Duyên", "nu"],
    ["Hà Tuấn Kiệt", "nam"],
  ]),
  ...students("6A", [
    ["Cao Minh Nhật", "nam"],
    ["Đinh Khả Hân", "nu"],
    ["Vương Anh Khoa", "nam"],
  ]),
];

const ids = (classId: string) => DEMO_STUDENTS.filter((s) => s.classId === classId).map((s) => s.id);

export const DEMO_CLASSES: Record<string, ClassInfo[]> = {
  "gv-mai-hoa": [
    { id: "9A", name: "9A", role: "chu-nhiem", subject: "Toán", studentIds: ids("9A") },
    { id: "9C", name: "9C", role: "bo-mon", subject: "Toán", studentIds: ids("9C") },
  ],
  "gv-duc-nam": [
    { id: "11A1", name: "11A1", role: "chu-nhiem", subject: "Vật lý", studentIds: ids("11A1") },
    { id: "11A2", name: "11A2", role: "bo-mon", subject: "Vật lý", studentIds: ids("11A2") },
    { id: "10A1", name: "10A1", role: "bo-mon", subject: "Vật lý", studentIds: ids("10A1") },
  ],
  "gv-thu-phuong": [
    { id: "7B", name: "7B", role: "chu-nhiem", subject: "Ngữ văn", studentIds: ids("7B") },
    { id: "6A", name: "6A", role: "bo-mon", subject: "Ngữ văn", studentIds: ids("6A") },
  ],
};

/** Giờ các tiết (buổi sáng). */
export const PERIOD_TIMES: [string, string][] = [
  ["07:00", "07:45"],
  ["07:50", "08:35"],
  ["08:50", "09:35"],
  ["09:40", "10:25"],
  ["10:30", "11:15"],
];

function day(classIds: (string | null)[]) {
  return classIds
    .map((classId, i) =>
      classId ? { index: i + 1, start: PERIOD_TIMES[i][0], end: PERIOD_TIMES[i][1], classId } : null,
    )
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export const DEMO_TIMETABLES: Record<string, Timetable> = {
  "gv-mai-hoa": {
    1: day(["9A", "9A", null, "9C", null]),
    2: day([null, "9C", "9A", null, "9A"]),
    3: day(["9A", null, "9C", "9C", null]),
    4: day(["9C", "9A", null, "9A", null]),
    5: day([null, "9A", "9C", null, "9A"]),
    6: day(["9A", null, null, null, null]),
  },
  "gv-duc-nam": {
    1: day(["11A1", "11A2", "10A1", null, "11A1"]),
    2: day([null, "11A1", "11A2", "11A2", null]),
    3: day(["10A1", null, "11A1", null, "11A2"]),
    4: day(["11A2", "11A1", null, "10A1", null]),
    5: day([null, "10A1", "11A1", "11A2", "11A2"]),
    6: day(["11A1", null, null, null, null]),
  },
  "gv-thu-phuong": {
    1: day(["7B", null, "6A", "6A", null]),
    2: day(["6A", "7B", null, null, "7B"]),
    3: day([null, "7B", "7B", "6A", null]),
    4: day(["7B", null, "6A", null, null]),
    5: day(["6A", "6A", null, "7B", null]),
    6: day(["7B", null, null, null, null]),
  },
};

export function demoNotes(profileId: string, today: string): StudentNote[] {
  const base = { source: "dong-bo" as const, createdAt: `${today}T06:45:00+07:00` };
  if (profileId === "gv-mai-hoa") {
    return [
      { id: "n1", studentId: "9A-1", rawName: "An", classId: "9A", kind: "suc-khoe", text: "Nghỉ ốm sốt, phụ huynh xin phép đến hết tuần", absentToday: true, ...base },
      { id: "n2", studentId: "9A-8", rawName: "Tâm", classId: "9A", kind: "hoc-tap", text: "Cần giảng lại công thức căn bậc hai", ...base },
      { id: "n3", studentId: "9C-3", rawName: "Bảo", classId: "9C", kind: "hoc-tap", text: "Nợ bài kiểm tra 15 phút chương 1", ...base },
    ];
  }
  if (profileId === "gv-duc-nam") {
    return [
      { id: "n1", studentId: "11A1-4", rawName: "Trâm", classId: "11A1", kind: "tam-ly", text: "Mấy hôm nay ít nói, chưa rõ lý do", ...base },
      { id: "n2", studentId: "11A2-2", rawName: "Linh", classId: "11A2", kind: "hoc-tap", text: "Dưới trung bình, cần gọi lên gỡ điểm", ...base },
    ];
  }
  return [
    { id: "n1", studentId: "7B-3", rawName: "Khiêm", classId: "7B", kind: "khac", text: "Làm vỡ bình hoa lớp, đã nhận lỗi", ...base },
  ];
}
