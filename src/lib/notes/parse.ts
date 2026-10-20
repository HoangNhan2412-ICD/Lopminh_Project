import { z } from "zod";
import type { NoteKind, Student } from "@/lib/types";
import { nfc, stripDiacritics } from "@/lib/text";

export const NOTE_KINDS: Record<NoteKind, string> = {
  "chuyen-can": "Chuyên cần",
  "suc-khoe": "Sức khỏe",
  "tam-ly": "Tâm lý",
  "hoc-tap": "Học tập",
  "khen-thuong": "Khen thưởng",
  khac: "Khác",
};

export const parsedNoteSchema = z.object({
  rawName: z.string(),
  studentId: z.string().nullable(),
  kind: z.enum(["chuyen-can", "suc-khoe", "tam-ly", "hoc-tap", "khen-thuong", "khac"]),
  text: z.string().min(1),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  absentToday: z.boolean().optional(),
});

export type ParsedNote = z.infer<typeof parsedNoteSchema>;

/** Tách đoạn văn giáo viên gõ/nói thành từng ý (xuống dòng, chấm phẩy, dấu chấm). */
export function splitSegments(input: string): string[] {
  return nfc(input)
    .split(/[\n;]+|(?<=[.!?])\s+/)
    .map((s) => s.trim().replace(/[.!?]+$/, ""))
    .filter((s) => s.length > 2);
}

const KIND_RULES: [NoteKind, RegExp][] = [
  ["suc-khoe", /\b(om|sot|benh|dau|cum|nhap vien|kham)\b/],
  ["khen-thuong", /\b(khen|tien bo|but pha|dat giai|giai nhat|giai nhi|diem cao|ielts|xuat sac|gioi)\b/],
  ["tam-ly", /\b(buon|khoc|khong tap trung|it noi|cang thang|so|lo lang|tram)\b/],
  ["chuyen-can", /\b(vang|nghi|di muon|tre|bo tiet|tron)\b/],
  ["hoc-tap", /\b(diem|bai|giang lai|kiem tra|no|cong thuc|on|hong|yeu|kem)\b/],
];

export function guessKind(segment: string): NoteKind {
  const s = stripDiacritics(segment);
  for (const [kind, re] of KIND_RULES) if (re.test(s)) return kind;
  return "khac";
}

/** Tìm học sinh được nhắc tới trong câu. Trả về null nếu không có hoặc có nhiều em trùng tên. */
export function matchStudent(segment: string, roster: Student[]): { student: Student | null; rawName: string } {
  const s = ` ${stripDiacritics(segment).replace(/[^a-z0-9 ]/g, " ")} `;
  // Ưu tiên khớp họ tên đầy đủ, rồi tên gọi.
  for (const st of roster) {
    if (s.includes(` ${stripDiacritics(st.fullName)} `)) return { student: st, rawName: st.shortName };
  }
  const hits = roster.filter((st) => s.includes(` ${stripDiacritics(st.shortName)} `));
  if (hits.length === 1) return { student: hits[0], rawName: hits[0].shortName };
  // Không khớp: lấy chữ viết hoa sau "em"/"bạn" làm tên thô.
  const m = nfc(segment).match(/(?:\bem|\bbạn|\bcháu)\s+(\p{Lu}\p{Ll}*(?:\s\p{Lu}\p{Ll}*)?)/u);
  return { student: null, rawName: m?.[1] ?? (hits[0]?.shortName ?? "") };
}

/** Ngày thứ Bảy của tuần chứa `today` (YYYY-MM-DD). */
function endOfWeek(today: string): string {
  const d = new Date(`${today}T12:00:00Z`);
  const add = (6 - d.getUTCDay() + 7) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

/**
 * Bộ bóc tách dự phòng không cần AI. Dùng khi chưa có GEMINI_API_KEY
 * hoặc khi gọi Gemini lỗi, để giáo viên vẫn ghi chép được.
 */
export function parseNotesFallback(input: string, roster: Student[], today: string): ParsedNote[] {
  return splitSegments(input).map((seg) => {
    const { student, rawName } = matchStudent(seg, roster);
    const kind = guessKind(seg);
    const plain = stripDiacritics(seg);
    const absentToday = /\b(nghi|vang)\b/.test(plain) || undefined;
    const until = /het tuan/.test(plain) ? endOfWeek(today) : undefined;
    const text = nfc(seg)
      .replace(/^(?:em|bạn|cháu)\s+/i, "")
      .replace(student ? new RegExp(`^${student.shortName}\\s*`, "u") : /^$/, "")
      .trim();
    return {
      rawName,
      studentId: student?.id ?? null,
      kind,
      text: text.charAt(0).toLocaleUpperCase("vi") + text.slice(1),
      until,
      absentToday,
    };
  });
}
