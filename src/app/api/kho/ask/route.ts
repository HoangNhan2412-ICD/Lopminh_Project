import { z } from "zod";
import { getGemini } from "@/lib/ai/client";
import { MODELS } from "@/lib/ai/models";
import { profileBlock } from "@/lib/ai/prompts";
import { fixAddress } from "@/lib/persona/honorific";
import type { TeacherProfile } from "@/lib/types";

export const maxDuration = 60;

const bodySchema = z.object({
  question: z.string().min(2).max(1000),
  storeName: z.string().startsWith("fileSearchStores/"),
  profile: z.custom<TeacherProfile>((v) => typeof v === "object" && v !== null && "gender" in v),
});

/** Hỏi đáp trên kho tài liệu riêng của giáo viên, có ghi nguồn. */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Câu hỏi hoặc kho chưa hợp lệ." }, { status: 400 });
  const ai = getGemini();
  if (!ai) return Response.json({ error: "Chưa có khóa Gemini." }, { status: 503 });
  const { question, storeName, profile } = parsed.data;
  try {
    const res = await ai.models.generateContent({
      model: MODELS.default,
      contents: [{ role: "user", parts: [{ text: question.normalize("NFC") }] }],
      config: {
        systemInstruction: `Bạn trả lời câu hỏi của giáo viên CHỈ dựa trên tài liệu trong kho được cung cấp. Không có trong tài liệu thì nói rõ là không tìm thấy, không bịa. Trả lời ngắn, rõ, tiếng Việt.\n${profileBlock(profile)}`,
        tools: [{ fileSearch: { fileSearchStoreNames: [storeName] } }],
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(55_000),
      },
    });
    const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = Array.from(new Set(chunks.map((c) => c.retrievedContext?.title).filter((t): t is string => Boolean(t))));
    return Response.json({ answer: fixAddress((res.text ?? "").trim(), profile), sources });
  } catch (err) {
    console.error("kho/ask lỗi:", (err as Error).message);
    return Response.json({ error: "Gemini đang bận, thử lại sau ít phút nhé." }, { status: 502 });
  }
}
