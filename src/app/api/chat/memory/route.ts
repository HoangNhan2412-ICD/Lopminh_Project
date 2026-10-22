import { nfcJson } from "@/lib/text";
import { z } from "zod";
import { ThinkingLevel } from "@google/genai";
import { getGemini } from "@/lib/ai/client";
import { logAiError } from "@/lib/ai/errors";
import { MODELS } from "@/lib/ai/models";
import { MEMORY_RULES } from "@/lib/ai/prompts";

export const maxDuration = 30;

const bodySchema = z.object({
  memory: z.string().max(2000),
  recent: z.array(z.object({ role: z.enum(["user", "model"]), text: z.string().max(4000) })).max(12),
});

/** Cập nhật sổ ghi nhớ của Góc Tâm Tình bằng model nhanh, chạy ngầm sau vài lượt trò chuyện. */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(nfcJson(await req.json().catch(() => null)));
  if (!parsed.success) return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  const ai = getGemini();
  if (!ai) return Response.json({ memory: parsed.data.memory });
  const { memory, recent } = parsed.data;
  try {
    const res = await ai.models.generateContent({
      model: MODELS.fast,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `SỔ CŨ:\n${memory || "(trống)"}\n\nĐOẠN TRÒ CHUYỆN MỚI:\n${recent
                .map((m) => `${m.role === "user" ? "Giáo viên" : "Bé Bảng"}: ${m.text}`)
                .join("\n")}\n\nTrả về SỔ MỚI.`,
            },
          ],
        },
      ],
      config: { systemInstruction: MEMORY_RULES, temperature: 0.2, maxOutputTokens: 400, thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }, abortSignal: AbortSignal.timeout(25_000) },
    });
    const next = (res.text ?? "").trim().normalize("NFC").slice(0, 2000);
    return Response.json({ memory: next || memory });
  } catch (err) {
    logAiError(err);
    return Response.json({ memory });
  }
}
