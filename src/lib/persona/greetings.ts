import type { ClassInfo, Period, Student, StudentNote, TeacherProfile } from "@/lib/types";
import { addressOf, getHonorific, honorificLower } from "@/lib/persona/honorific";

interface GreetingInput {
  profile: TeacherProfile;
  hour: number;
  classes: ClassInfo[];
  students: Student[];
  notes: StudentNote[];
  next: Period | null;
  live: Period | null;
}

function partOfDay(hour: number) {
  if (hour < 11) return "buổi sáng";
  if (hour < 13) return "buổi trưa";
  if (hour < 18) return "buổi chiều";
  return "buổi tối";
}

/**
 * Lời chào của Bé Bảng, dựng từ dữ liệu thật của hồ sơ đang mở.
 * Không có tên giáo viên, tên lớp hay tên học sinh nào được viết cứng ở đây.
 */
export function greetingLines(i: GreetingInput): { title: string; body: string } {
  const addr = addressOf(i.profile);
  const h = honorificLower(i.profile);
  const title = `Chào ${addr}, chúc ${h} ${partOfDay(i.hour)} nhẹ nhàng.`;

  const nameOf = (id: string | null, raw: string) => i.students.find((s) => s.id === id)?.shortName ?? raw;
  const homeroom = i.classes.find((c) => c.role === "chu-nhiem");
  const absent = i.notes.filter((n) => n.absentToday && (!homeroom || n.classId === homeroom.id));

  const parts: string[] = [];
  if (homeroom && absent.length > 0) {
    const names = absent.map((n) => nameOf(n.studentId, n.rawName)).join(", ");
    parts.push(`Lớp ${homeroom.name} hôm nay có ${absent.length} em nghỉ: ${names}.`);
  } else if (homeroom) {
    parts.push(`Lớp ${homeroom.name} hôm nay có em nào vắng hay có chuyện gì mới không ${h}?`);
  }

  if (i.live) {
    const c = i.classes.find((x) => x.id === i.live!.classId);
    parts.push(`${getHonorific(i.profile)} đang dạy tiết ${i.live.index} lớp ${c?.name ?? i.live.classId}, có gì cứ nói để em ghi lại.`);
  } else if (i.next) {
    const c = i.classes.find((x) => x.id === i.next!.classId);
    parts.push(`Tiết tới là tiết ${i.next.index} lớp ${c?.name ?? i.next.classId}, lúc ${i.next.start}.`);
  } else if (i.hour >= 11) {
    parts.push(`Hết tiết rồi, ${h} nhớ uống nước và nghỉ một chút nhé.`);
  }

  return { title, body: parts.join(" ") };
}
