import { z } from "zod";
import { isAiConfigured } from "@/lib/ai/client";
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
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Yêu cầu soạn bài chưa đủ thông tin." }, { status: 400 });
  const { request, profile, context, redo, avoidImages } = parsed.data;
  const r = request as LessonRequest;

  if (!isAiConfigured()) {
    return Response.json({ mode: "demo", plan: polishPlan(fallbackPlan(r), r) });
  }

  try {
    const raw = await generateJson({
      role: "heavy",
      label: "lesson/generate",
      system: lessonSystemPrompt(profile),
      user: lessonUserPrompt(r, context, { previousTitle: redo?.previousTitle, more: redo?.more, avoidImages }),
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
