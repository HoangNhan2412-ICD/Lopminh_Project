import { z } from "zod";
import { stripDiacritics } from "@/lib/text";

export const MAIL_LABELS = ["khan", "chu-nhiem", "bo-mon", "phu-huynh", "hanh-chinh", "khong-lien-quan"] as const;
export type MailLabel = (typeof MAIL_LABELS)[number];

export const LABEL_TEXT: Record<MailLabel, string> = {
  khan: "BGH, khẩn",
  "chu-nhiem": "Chủ nhiệm",
  "bo-mon": "Bộ môn",
  "phu-huynh": "Phụ huynh",
  "hanh-chinh": "Hành chính",
  "khong-lien-quan": "Không liên quan",
};

export const classifiedSchema = z.object({
  label: z.enum(MAIL_LABELS),
  classId: z.string().nullable(),
  summary: z.string(),
  deadline: z.string().nullable(),
  todo: z.string().nullable(),
});
export type Classified = z.infer<typeof classifiedSchema>;

export interface RawMail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  source: "email" | "zalo";
}

export interface MailItem extends RawMail, Classified {
  done: boolean;
  mode: "ai" | "tu-khoa";
}

/* ---------- Bộ lọc theo từ khóa (chạy khi chưa có khóa Gemini, và để chấm nhanh trước) ---------- */

const RULES: { label: MailLabel; re: RegExp }[] = [
  { label: "khong-lien-quan", re: /(khuyen mai|giam gia|uu dai|qua tang|trung thuong|vay von|flash sale|voucher|dang ky ngay|quang cao|unsubscribe)/ },
  { label: "khan", re: /(khan|hoa toc|ban giam hieu|bgh|hieu truong|thanh tra|du gio|hop hoi dong|han chot|han nop|truoc \d+h|ngay mai nop)/ },
  { label: "phu-huynh", re: /(phu huynh|xin phep|con em|chau |me cua|bo cua|gia dinh)/ },
  { label: "hanh-chinh", re: /(cong van|ke hoach|bao cao|thong bao|so lieu|bang luong|bao hiem|hoc phi|lich cong tac)/ },
];

const DATE_RE = /(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?/;

function guessDeadline(text: string, today: string): string | null {
  const t = stripDiacritics(text);
  const m = t.match(DATE_RE);
  const year = Number(today.slice(0, 4));
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = m[3] ? Number(m[3].length === 2 ? `20${m[3]}` : m[3]) : year;
    if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  if (/ngay mai/.test(t)) {
    const dt = new Date(`${today}T00:00:00Z`);
    dt.setUTCDate(dt.getUTCDate() + 1);
    return dt.toISOString().slice(0, 10);
  }
  return null;
}

export function classifyFallback(m: RawMail, classNames: { id: string; name: string; role: "chu-nhiem" | "bo-mon" }[], today: string): Classified {
  const text = `${m.from} ${m.subject} ${m.body}`;
  const t = stripDiacritics(text);
  let label: MailLabel = "hanh-chinh";
  for (const r of RULES) {
    if (r.re.test(t)) {
      label = r.label;
      break;
    }
  }
  const cls = classNames.find((c) => new RegExp(`(^|[^a-z0-9])${stripDiacritics(c.name)}([^a-z0-9]|$)`).test(t));
  if (cls && (label === "hanh-chinh" || label === "phu-huynh")) {
    if (label === "hanh-chinh") label = cls.role === "chu-nhiem" ? "chu-nhiem" : "bo-mon";
  }
  // Bỏ câu chào ("Dạ em chào cô ạ.", "Kính gửi…") để tóm tắt vào thẳng việc
  const sentences = m.body.split(/(?<=[.!?])\s+/).filter((x) => !/^(da |em chao|chao |kinh gui|thua )/.test(stripDiacritics(x.trim())));
  const firstSentence = (sentences[0] ?? m.subject).slice(0, 160);
  const deadline = label === "khong-lien-quan" ? null : guessDeadline(text, today);
  return {
    label,
    classId: cls?.id ?? null,
    summary: firstSentence,
    deadline,
    todo: deadline ? "Có hạn chót, cần xử lý" : null,
  };
}
