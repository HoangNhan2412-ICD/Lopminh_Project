import { z } from "zod";
import { getGemini, isAiConfigured } from "@/lib/ai/client";
import { MODELS } from "@/lib/ai/models";
import { generateJson } from "@/lib/ai/json";
import { fallbackPlan, polishPlan } from "@/lib/lesson/build";
import { lessonSystemPrompt, lessonUserPrompt } from "@/lib/lesson/prompt";
import { lessonPlanSchema, type LessonRequest } from "@/lib/lesson/types";
import type { TeacherProfile } from "@/lib/types";

export const maxDuration = 180;

const bodySchema = z.object({
  request: z.object({
    topic: z.string().min(2).max(300),
    subject: z.string().max(60),
    grade: z.string().max(40),
    classId: z.string(),
    className: z.string(),
    minutes: z.number().int().min(20).max(180),
    wishes: z.string().max(1500),
    energy: z.enum(["soi-noi", "tram-lang", "tiet-cuoi"]),
    focus: z.enum(["game", "thao-luan", "go-diem"]),
    tone: z.enum(["than-thien", "chuan-muc", "song-ngu"]),
  }),
  profile: z.custom<TeacherProfile>((v) => typeof v === "object" && v !== null && "gender" in v && "callName" in v),
  context: z.string().max(4000),
  redo: z.object({ previousTitle: z.string(), more: z.string().max(1500) }).optional(),
  avoidImages: z.array(z.string()).max(40).optional(),
  knowledge: z
    .object({
      docs: z.array(z.object({ name: z.string().max(200), text: z.string().max(13_000) })).max(10),
      storeName: z.string().nullable().optional(),
    })
    .optional(),
});

/** Lấy đoạn liên quan trong kho Gemini File Search của giáo viên (nếu có), để đưa vào prompt soạn bài. */
async function retrieveFromStore(storeName: string, topic: string): Promise<string> {
  const ai = getGemini();
  if (!ai) return "";
  try {
    const res = await ai.models.generateContent({
      model: MODELS.fast,
      contents: [{ role: "user", parts: [{ text: `Trích nguyên văn các đoạn trong tài liệu liên quan tới bài "${topic}" (kiến thức, ví dụ, phân phối chương trình, kế hoạch tổ). Ghi tên tài liệu trước mỗi đoạn. Tối đa 1500 chữ.` }] }],
      config: { tools: [{ fileSearch: { fileSearchStoreNames: [storeName] } }], temperature: 0, abortSignal: AbortSignal.timeout(40_000) },
    });
    return (res.text ?? "").slice(0, 9000);
  } catch (err) {
    console.error("lesson/generate: không lấy được đoạn từ kho", (err as Error).message);
    return "";
  }
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Yêu cầu soạn bài chưa đủ thông tin." }, { status: 400 });
  const { request, profile, context, redo, avoidImages, knowledge } = parsed.data;
  const r = request as LessonRequest;

  if (!isAiConfigured()) {
    return Response.json({ mode: "demo", plan: polishPlan(fallbackPlan(r), r) });
  }

  try {
    const fromStore = knowledge?.storeName?.startsWith("fileSearchStores/") ? await retrieveFromStore(knowledge.storeName, r.topic) : "";
    const kho = [
      fromStore,
      ...(knowledge?.docs ?? []).map((d) => `[${d.name}]\n${d.text}`),
    ]
      .filter(Boolean)
      .join("\n\n");
    const khoBlock = kho
      ? `\n\nTÀI LIỆU CỦA GIÁO VIÊN (ưu tiên bám theo, ghi tên tài liệu trong notes của slide khi dùng):\n${kho.slice(0, 20_000)}`
      : "";
    const raw = await generateJson({
      role: "heavy",
      label: "lesson/generate",
      system: lessonSystemPrompt(profile),
      user: lessonUserPrompt(r, context, { previousTitle: redo?.previousTitle, more: redo?.more, avoidImages }) + khoBlock,
      schema: lessonPlanSchema,
      temperature: 0.7,
      timeoutMs: 170_000,
    });
    return Response.json({ mode: "ai", plan: polishPlan(raw, r) });
  } catch (err) {
    console.error("lesson/generate lỗi:", (err as Error).message);
    return Response.json({
      mode: "fallback",
      plan: polishPlan(fallbackPlan(r), r),
      warning: "Gemini đang bận hoặc trả lời chưa đúng mẫu, Bé Bảng tạm dùng giáo án khung. Thầy cô bấm Soạn lại sau ít phút nhé.",
    });
  }
}
