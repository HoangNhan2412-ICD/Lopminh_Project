import { z } from "zod";
import { isAiConfigured } from "@/lib/ai/client";
import { generateJson } from "@/lib/ai/json";
import { profileBlock } from "@/lib/ai/prompts";
import { SLIDE_RULES } from "@/lib/lesson/prompt";
import { slideSchema } from "@/lib/lesson/types";
import type { TeacherProfile } from "@/lib/types";

export const maxDuration = 60;

const bodySchema = z.object({
  profile: z.custom<TeacherProfile>((v) => typeof v === "object" && v !== null && "gender" in v),
  lessonTitle: z.string(),
  subject: z.string(),
  grade: z.string(),
  slide: slideSchema,
  outline: z.array(z.string()).max(30),
  instruction: z.string().min(1).max(800),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Thiếu thông tin slide cần sửa." }, { status: 400 });
  const { profile, lessonTitle, subject, grade, slide, outline, instruction } = parsed.data;

  if (!isAiConfigured()) {
    return Response.json(
      { error: "Chưa có khóa Gemini nên Bé Bảng chưa sửa slide tự động được. Thầy cô sửa tay ngay trên slide nhé." },
      { status: 503 },
    );
  }

  try {
    const next = await generateJson({
      role: "default",
      label: "lesson/slide",
      system: `${SLIDE_RULES}\n\n${profileBlock(profile)}`,
      user: [
        `Bài: ${lessonTitle} (${subject} ${grade}).`,
        `Thứ tự các slide: ${outline.join(" | ")}`,
        `Slide hiện tại (JSON): ${JSON.stringify(slide)}`,
        `Yêu cầu của giáo viên: ${instruction}`,
      ].join("\n\n"),
      schema: slideSchema,
      temperature: 0.7,
      timeoutMs: 55_000,
    });
    return Response.json({ slide: { ...next, id: slide.id } });
  } catch (err) {
    console.error("lesson/slide lỗi:", (err as Error).message);
    return Response.json({ error: "Gemini đang bận, thầy cô thử lại sau ít phút nhé." }, { status: 502 });
  }
}
