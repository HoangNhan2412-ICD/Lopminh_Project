import { logAiError } from "@/lib/ai/errors";
import { nfcJson } from "@/lib/text";
import { z } from "zod";
import { getGemini } from "@/lib/ai/client";
import { MODELS } from "@/lib/ai/models";
import { profileBlock } from "@/lib/ai/prompts";
import { fixAddress } from "@/lib/persona/honorific";
import type { TeacherProfile } from "@/lib/types";

export const maxDuration = 60;

const bodySchema = z.object({
  profile: z.custom<TeacherProfile>((v) => typeof v === "object" && v !== null && "gender" in v),
  mail: z.object({ from: z.string(), subject: z.string(), body: z.string().max(6000) }),
  intent: z.string().max(500),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(nfcJson(await req.json().catch(() => null)));
  if (!parsed.success) return Response.json({ error: "Thiếu nội dung thư." }, { status: 400 });
  const { profile, mail, intent } = parsed.data;
  const ai = getGemini();
  if (!ai) return Response.json({ error: "Chưa có khóa Gemini nên Bé Bảng chưa viết nháp được." }, { status: 503 });

  try {
    const res = await ai.models.generateContent({
      model: MODELS.default,
      contents: [
        {
          role: "user",
          parts: [{ text: `Thư nhận được:\nTừ: ${mail.from}\nTiêu đề: ${mail.subject}\n${mail.body}\n\nÝ giáo viên muốn trả lời: ${intent || "trả lời lịch sự, xác nhận đã nhận"}` }],
        },
      ],
      config: {
        systemInstruction: `Bạn viết NHÁP thư trả lời thay cho giáo viên, để giáo viên đọc lại rồi tự gửi.
Viết ở ngôi của chính giáo viên (xưng "tôi" với cấp trên/đồng nghiệp, xưng "cô"/"thầy" theo đúng danh xưng của giáo viên khi viết cho phụ huynh).
Ngắn gọn, lịch sự, đúng mực trường học Việt Nam; không hứa điều giáo viên chưa nói; chỉ trả về phần thân thư.
${profileBlock(profile)}`,
        temperature: 0.5,
        abortSignal: AbortSignal.timeout(50_000),
      },
    });
    return Response.json({ draft: fixAddress((res.text ?? "").trim(), profile) });
  } catch (err) {
    logAiError(err);
    return Response.json({ error: "Gemini đang bận, thử lại sau ít phút nhé." }, { status: 502 });
  }
}
