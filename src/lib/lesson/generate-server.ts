import "server-only";
import { z } from "zod";
import { getGemini, isAiConfigured } from "@/lib/ai/client";
import { MODELS } from "@/lib/ai/models";
import { generateJson } from "@/lib/ai/json";
import { fallbackPlan, polishPlan } from "@/lib/lesson/build";
import { lessonSystemPrompt, lessonUserPrompt } from "@/lib/lesson/prompt";
import { lessonPlanSchema, type LessonRequest } from "@/lib/lesson/types";
import { profileInput } from "@/lib/storage/schema";
import { nfc } from "@/lib/text";
import { findTextbookLesson } from "@/content/thu-vien/catalog";
import { searchStores } from "@/lib/ai/stores";
import { logAiError } from "@/lib/ai/errors";

export const lessonInputSchema = z.object({
  request: z.object({
    textbook: z.object({ bookId: z.string().max(100), lessonId: z.string().max(100) }).optional(),
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
  profile: profileInput,
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
async function retrieveFromStore(storeNames: string[], topic: string): Promise<string> {
  const ai = getGemini();
  if (!ai) return "";
  try {
    const res = await ai.models.generateContent({
      model: MODELS.fast,
      contents: [{ role: "user", parts: [{ text: `Trích nguyên văn các đoạn trong tài liệu liên quan tới bài "${topic}" (kiến thức, ví dụ, phân phối chương trình, kế hoạch tổ). Ghi tên tài liệu trước mỗi đoạn. Tối đa 1500 chữ.` }] }],
      config: { tools: [{ fileSearch: { fileSearchStoreNames: storeNames } }], temperature: 0, abortSignal: AbortSignal.timeout(40_000) },
    });
    return (res.text ?? "").slice(0, 9000);
  } catch (err) {
    logAiError(err);
    return "";
  }
}

export type LessonInput = z.infer<typeof lessonInputSchema>;
export function parseLessonInput(raw: unknown): LessonInput {
  const parsed = lessonInputSchema.safeParse(JSON.parse(nfc(JSON.stringify(raw ?? null))));
  if (!parsed.success) throw Error("Yêu cầu soạn bài chưa đủ thông tin.");
  const r = parsed.data.request;
  if (r.textbook) {
    const selected = findTextbookLesson(r.textbook.bookId, r.textbook.lessonId);
    if (!selected || selected.book.mon !== r.subject || selected.book.lop !== Number(r.grade.match(/\d+/)?.[0])) throw Error("Bài SGK chưa được đối chiếu hoặc không khớp môn/lớp.");
    r.topic = selected.lesson.ten;
  }
  return parsed.data;
}
export async function generateLesson(input: LessonInput, progress: (step: string, pct: number) => Promise<void> = async () => {}) {
  const { request, profile, context, redo, avoidImages, knowledge } = input;
  const r = request as LessonRequest;


  if (!isAiConfigured()) {
    await progress("Dựng giáo án khung demo", 70);
    return { mode: "demo" as const, plan: polishPlan(fallbackPlan(r), r) };
  }

  try {
    await progress("Đọc tài liệu tham khảo", 10);
    const stores = await searchStores(knowledge?.storeName);
    const fromStore = stores.length ? await retrieveFromStore(stores, r.topic) : "";
    const kho = [
      fromStore,
      ...(knowledge?.docs ?? []).map((d) => `[${d.name}]\n${d.text}`),
    ]
      .filter(Boolean)
      .join("\n\n");
    const khoBlock = kho
      ? `\n\nTÀI LIỆU CỦA GIÁO VIÊN (ưu tiên bám theo, ghi tên tài liệu trong notes của slide khi dùng):\n${kho.slice(0, 20_000)}`
      : "";
    await progress("Soạn giáo án, slide và câu hỏi", 25);
    const raw = await generateJson({
      role: "heavy",
      label: "lesson/generate",
      system: lessonSystemPrompt(profile),
      user: lessonUserPrompt(r, context, { previousTitle: redo?.previousTitle, more: redo?.more, avoidImages }) + khoBlock,
      schema: lessonPlanSchema,
      temperature: 0.7,
      timeoutMs: 170_000,
      totalTimeoutMs: 180_000,
    });
    await progress("Kiểm tra nội dung và dàn trang", 85);
    return { mode: "ai" as const, plan: polishPlan(JSON.parse(nfc(JSON.stringify(raw))), r) };
  } catch (err) {
    logAiError(err);
    return {
      mode: "fallback" as const,
      plan: polishPlan(fallbackPlan(r), r),
      warning: "Gemini đang bận hoặc trả lời chưa đúng mẫu, Bé Bảng tạm dùng giáo án khung. Thầy cô bấm Soạn lại sau ít phút nhé.",
    };
  }
}
