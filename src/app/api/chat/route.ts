import { nfcJson } from "@/lib/text";
import { z } from "zod";
import { ThinkingLevel } from "@google/genai";
import { getGemini } from "@/lib/ai/client";
import { classifyAiError, logAiError } from "@/lib/ai/errors";
import { MODELS } from "@/lib/ai/models";
import { sanctuarySystemPrompt } from "@/lib/ai/prompts";
import { addressOf, honorificLower } from "@/lib/persona/honorific";
import { nfc } from "@/lib/text";
import type { TeacherProfile } from "@/lib/types";

const profileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  callName: z.string(),
  gender: z.enum(["nam", "nu"]),
  honorificOverride: z.string().optional(),
  school: z.string(),
  team: z.string(),
  subject: z.string(),
  yearsTeaching: z.number(),
  teachingStyle: z.object({ summary: z.string(), tags: z.array(z.string()) }),
  interests: z.array(z.string()),
  kpis: z.array(z.any()),
  accent: z.string(),
  homeroomClassId: z.string().optional(),
});

const bodySchema = z.object({
  profile: profileSchema,
  load: z.enum(["thu-thai", "on-dinh", "cang-thang", "qua-tai"]).nullable(),
  todayContext: z.string().max(600),
  /** Chỉ gửi vài lượt gần nhất để tiết kiệm token (SPEC mục 15). */
  history: z.array(z.object({ role: z.enum(["user", "model"]), text: z.string().max(4000) })).max(8),
  message: z.string().min(1).max(4000),
  memory: z.string().max(2000).default(""),
});

const encoder = new TextEncoder();

function textStream(gen: AsyncIterable<string>, mode: string) {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const piece of gen) controller.enqueue(encoder.encode(piece));
      } catch (err) {
        logAiError(err);
        controller.enqueue(encoder.encode(`\n\n${classifyAiError(err).message}`));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-LM-Mode": mode },
  });
}

/** Câu trả lời mẫu khi chưa có GEMINI_API_KEY, để giao diện vẫn thử được. */
async function* demoReply(p: TeacherProfile, message: string) {
  const h = honorificLower(p);
  const short = message.length > 60 ? `${message.slice(0, 57)}…` : message;
  const reply = `Em nghe ${h} kể rồi: "${short}". Nghe thôi mà em thấy ${h} đã gồng nhiều lắm. Hôm nay chuyện nào làm ${addressOf(p)} mệt nhất ạ?`;
  for (const word of reply.split(/(\s+)/)) {
    yield word;
    await new Promise((r) => setTimeout(r, 18));
  }
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(nfcJson(await req.json().catch(() => null)));
  if (!parsed.success) {
    return Response.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }
  const { load, todayContext, history, message, memory } = parsed.data;
  const profile = parsed.data.profile as TeacherProfile;

  const ai = getGemini();
  if (!ai) return textStream(demoReply(profile, nfc(message)), "demo");

  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: nfc(m.text) }] })),
    { role: "user", parts: [{ text: nfc(message) }] },
  ];

  try {
    const stream = await ai.models.generateContentStream({
      model: MODELS.default,
      contents,
      config: {
        systemInstruction: sanctuarySystemPrompt(profile, load, todayContext, memory),
        temperature: 0.85,
        maxOutputTokens: 700,
        // Trò chuyện cần nhanh: tin ngắn thì gần như không suy nghĩ để chữ đầu tiên hiện ngay,
        // tin dài/nặng nề thì cho suy nghĩ ít để trả lời chín chắn hơn.
        thinkingConfig: { thinkingLevel: message.length < 160 && load !== "qua-tai" ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW },
      },
    });
    // SDK có thể chỉ báo lỗi khi đọc chunk đầu: đọc trước để còn trả đúng HTTP.
    const iterator = stream[Symbol.asyncIterator]();
    const first = await iterator.next();
    async function* pieces() {
      let chunk = first;
      while (!chunk.done) {
        if (chunk.value.text) yield nfc(chunk.value.text);
        chunk = await iterator.next();
      }
    }
    return textStream(pieces(), "ai");
  } catch (err) {
    logAiError(err);
    const error = classifyAiError(err);
    return Response.json(
      { error: error.message, code: error.kind },
      { status: error.status || 502 },
    );
  }
}
