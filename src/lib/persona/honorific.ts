import type { Gender, TeacherProfile } from "@/lib/types";

/**
 * Nơi DUY NHẤT quyết định Bé Bảng gọi giáo viên là "Thầy" hay "Cô".
 * Không viết cứng "Thầy"/"Cô" kèm tên ở bất kỳ chỗ nào khác (xem CLAUDE.md).
 */

type HonorificSource = Pick<TeacherProfile, "gender" | "honorificOverride">;

export function honorificFor(gender: Gender): "Thầy" | "Cô" {
  return gender === "nam" ? "Thầy" : "Cô";
}

export function getHonorific(p: HonorificSource): string {
  const custom = p.honorificOverride?.trim();
  return custom ? custom.normalize("NFC") : honorificFor(p.gender);
}

/** Danh xưng viết thường, dùng giữa câu: "…cho cô nhé". */
export function honorificLower(p: HonorificSource): string {
  return getHonorific(p).toLocaleLowerCase("vi");
}

/** "Cô Mai Hoa", "Thầy Đức Nam". */
export function addressOf(p: HonorificSource & Pick<TeacherProfile, "callName">): string {
  return `${getHonorific(p)} ${p.callName}`.normalize("NFC");
}

/** Tên gọi mặc định từ họ tên đầy đủ: lấy chữ cuối ("Nguyễn Thị Mai Hoa" → "Hoa"). */
export function defaultCallName(fullName: string): string {
  const parts = fullName.normalize("NFC").trim().split(/\s+/);
  return parts[parts.length - 1] ?? fullName;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Lớp bảo vệ cuối cho chữ do AI sinh ra: nếu model lỡ gọi sai danh xưng
 * với đúng tên của giáo viên (ví dụ "Thầy Mai Hoa" cho một cô giáo), sửa lại.
 * Chỉ đụng tới cụm có tên giáo viên, không đụng tên học sinh hay người khác.
 */
export function fixAddress(
  text: string,
  p: HonorificSource & Pick<TeacherProfile, "callName" | "fullName">,
): string {
  const right = getHonorific(p);
  const wrongWords = ["Thầy", "Cô", "thầy", "cô"].filter(
    (w) => w.toLocaleLowerCase("vi") !== right.toLocaleLowerCase("vi"),
  );
  const names = Array.from(
    new Set([p.callName, defaultCallName(p.fullName), p.fullName].map((n) => n.normalize("NFC"))),
  ).sort((a, b) => b.length - a.length);

  let out = text.normalize("NFC");
  for (const wrong of wrongWords) {
    for (const name of names) {
      const re = new RegExp(`(^|[^\\p{L}])${escapeRegExp(wrong)}(\\s+)${escapeRegExp(name)}(?![\\p{L}])`, "gu");
      out = out.replace(re, (_m, pre: string, space: string) => {
        const isLower = wrong[0] === wrong[0].toLocaleLowerCase("vi");
        const fixed = isLower ? right.toLocaleLowerCase("vi") : right;
        return `${pre}${fixed}${space}${name}`;
      });
    }
  }
  return out;
}
