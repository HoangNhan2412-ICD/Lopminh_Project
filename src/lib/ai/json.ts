import "server-only";
import { z } from "zod";
import { getGemini } from "@/lib/ai/client";
import { MODELS, type ModelRole } from "@/lib/ai/models";
import { AiRequestError, classifyAiError, logAiError } from "@/lib/ai/errors";

/** Bỏ các khóa Gemini không cần ($schema, default) khỏi JSON Schema sinh từ zod. */
export function toGeminiSchema(schema: z.ZodType): Record<string, unknown> {
  const clean = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === "object") {
      return Object.fromEntries(
        Object.entries(v)
          .filter(([k]) => k !== "$schema" && k !== "default")
          .map(([k, x]) => [k, clean(x)]),
      );
    }
    return v;
  };
  return clean(z.toJSONSchema(schema, { io: "input" })) as Record<string, unknown>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Gọi Gemini lấy JSON đúng schema. Phần system (cố định) đặt trước để Gemini tự cache.
 * Thử lại 2 lần khi quá tải. Ghi số token (không ghi nội dung) ra log để theo dõi chi phí.
 */
export async function generateJson<T>(opts: {
  role: ModelRole;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  temperature?: number;
  timeoutMs?: number;
  totalTimeoutMs?: number;
  label: string;
}): Promise<T> {
  const ai = getGemini();
  if (!ai) throw new Error("NO_KEY");
  const jsonSchema = toGeminiSchema(opts.schema);
  let lastErr: unknown;
  const deadline = opts.totalTimeoutMs ? Date.now() + opts.totalTimeoutMs : Infinity;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (Date.now() >= deadline) break;
    try {
      const started = Date.now();
      const res = await ai.models.generateContent({
        model: MODELS[opts.role],
        contents: [{ role: "user", parts: [{ text: opts.user }] }],
        config: {
          systemInstruction: opts.system,
          responseMimeType: "application/json",
          responseJsonSchema: jsonSchema,
          temperature: opts.temperature ?? 0.6,
          abortSignal: AbortSignal.timeout(Math.max(1, Math.min(opts.timeoutMs ?? 120_000, deadline - Date.now()))),
        },
      });
      const u = res.usageMetadata;
      console.info(
        `[ai] ${opts.label} ${MODELS[opts.role]} ${Date.now() - started}ms in=${u?.promptTokenCount ?? "?"} cached=${u?.cachedContentTokenCount ?? 0} out=${u?.candidatesTokenCount ?? "?"}`,
      );
      return opts.schema.parse(JSON.parse(res.text ?? "{}"));
    } catch (err) {
      lastErr = err;
      if (attempt < 2 && classifyAiError(err).retryable && Date.now() + 1500 * (attempt + 1) < deadline) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      break;
    }
  }
  logAiError(lastErr);
  throw new AiRequestError(lastErr);
}
