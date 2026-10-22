import { logAiError } from "@/lib/ai/errors";
import { nfcJson } from "@/lib/text";
import { z } from "zod";
import { isAiConfigured } from "@/lib/ai/client";
import { generateJson } from "@/lib/ai/json";
import { classifiedSchema, classifyFallback, type Classified } from "@/lib/mail/classify";

export const maxDuration = 60;

const mailSchema = z.object({
  id: z.string(),
  from: z.string().max(200),
  subject: z.string().max(300),
  body: z.string().max(6000),
  receivedAt: z.string(),
  source: z.enum(["email", "zalo"]),
});

const bodySchema = z.object({
  mails: z.array(mailSchema).min(1).max(30),
  classes: z.array(z.object({ id: z.string(), name: z.string(), role: z.enum(["chu-nhiem", "bo-mon"]) })).max(20),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const SYSTEM = `Bạn lọc thư công việc cho một giáo viên phổ thông Việt Nam.
Với MỖI thư, trả về một phần tử theo đúng thứ tự thư đầu vào:
- label: khan (Ban giám hiệu, Phòng/Sở GD, thanh tra, dự giờ, hạn nộp gấp) | chu-nhiem (việc lớp chủ nhiệm) | bo-mon (lớp bộ môn: bài tập, điểm, gỡ điểm) | phu-huynh (thư của phụ huynh về con) | hanh-chinh (công văn, báo cáo, lương, bảo hiểm không gấp) | khong-lien-quan (quảng cáo, khuyến mãi, thư rác).
- classId: id lớp trong danh sách nếu thư nói về lớp đó, không thì null.
- summary: một câu ngắn nói thư cần gì, không chào hỏi.
- deadline: hạn chót dạng YYYY-MM-DD nếu có, không thì null.
- todo: việc giáo viên cần làm (bắt đầu bằng động từ), không có thì null.
Không bịa thông tin không có trong thư.`;

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(nfcJson(await req.json().catch(() => null)));
  if (!parsed.success) return Response.json({ error: "Thư gửi lên chưa đúng." }, { status: 400 });
  const { mails, classes, today } = parsed.data;
  const fallback = () => mails.map((m) => ({ ...classifyFallback(m, classes, today), mode: "tu-khoa" as const }));

  if (!isAiConfigured()) return Response.json({ results: fallback() });

  try {
    const out = await generateJson({
      role: "fast",
      label: "mail/classify",
      system: SYSTEM,
      user: `Hôm nay: ${today}. Các lớp: ${classes.map((c) => `${c.id} (${c.name}, ${c.role === "chu-nhiem" ? "chủ nhiệm" : "bộ môn"})`).join("; ")}.\n\n${mails
        .map((m, i) => `--- THƯ ${i + 1} ---\nTừ: ${m.from}\nTiêu đề: ${m.subject}\n${m.body.slice(0, 2500)}`)
        .join("\n\n")}`,
      schema: z.object({ items: z.array(classifiedSchema) }),
      temperature: 0.1,
      timeoutMs: 55_000,
    });
    const ids = new Set(classes.map((c) => c.id));
    const results = mails.map((m, i) => {
      const r: Classified | undefined = out.items[i];
      if (!r) return { ...classifyFallback(m, classes, today), mode: "tu-khoa" as const };
      return { ...r, classId: r.classId && ids.has(r.classId) ? r.classId : null, mode: "ai" as const };
    });
    return Response.json({ results });
  } catch (err) {
    logAiError(err);
    return Response.json({ results: fallback() });
  }
}
