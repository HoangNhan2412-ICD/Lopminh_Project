import { connection } from "next/server";
import { getGemini } from "@/lib/ai/client";
import { classifyAiError, logAiError } from "@/lib/ai/errors";
import { MODELS } from "@/lib/ai/models";

export const maxDuration = 20;

/** Đi qua proxy như mọi API. Chỉ kiểm tra cấu hình, không trả giá trị bí mật. */
export async function GET() {
  await connection();
  const ai = getGemini();
  let ping: "ok" | "not-configured" | number = "not-configured";
  if (ai) {
    try {
      await ai.models.generateContent({
        model: MODELS.fast,
        contents: "ping",
        config: { maxOutputTokens: 5, abortSignal: AbortSignal.timeout(10_000) },
      });
      ping = "ok";
    } catch (error) {
      logAiError(error);
      ping = classifyAiError(error).status || 502;
    }
  }
  return Response.json({
    ai: Boolean(ai), models: MODELS,
    supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    gate: Boolean(process.env.SITE_PASSWORD), ping,
  }, { headers: { "Cache-Control": "no-store" } });
}
