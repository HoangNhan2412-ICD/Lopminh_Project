import { z } from "zod";
import { isAiConfigured } from "@/lib/ai/client";
import { generateJson } from "@/lib/ai/json";
import { quizSetSchema } from "@/lib/quiz/types";

export const maxDuration = 90;

const bodySchema = z.object({
  source: z.string().min(10).max(20_000),
  subject: z.string().max(60),
  grade: z.string().max(40),
  count: z.number().int().min(3).max(20),
  level: z.enum(["de", "vua", "kho", "tron"]),
});

const LEVEL = { de: "dễ, nhận biết", vua: "vừa, thông hiểu", kho: "khó, vận dụng", tron: "trộn: 40% nhận biết, 40% thông hiểu, 20% vận dụng" };

const SYSTEM = `Bạn soạn câu hỏi trắc nghiệm 4 lựa chọn cho học sinh phổ thông Việt Nam từ nội dung bài giảng được cung cấp.
Luật:
- Chỉ hỏi điều có trong nội dung, không bịa kiến thức ngoài.
- Mỗi câu đúng một đáp án; ba phương án nhiễu là lỗi sai học sinh hay mắc, độ dài tương đương đáp án đúng.
- Câu hỏi tối đa 120 ký tự, mỗi phương án tối đa 75 ký tự (để nhập được vào Kahoot/Wayground).
- Công thức viết bằng Unicode (√, ², π), không dùng LaTeX.
- Rải đều vị trí đáp án đúng (không dồn vào A).
- explain: một câu giải thích vì sao đúng.
- seconds: 20 cho câu nhận biết, 30 cho thông hiểu, 60 cho vận dụng.
- title: tên bộ câu hỏi ngắn gọn.`;

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Nội dung bài giảng cần dài hơn một chút." }, { status: 400 });
  if (!isAiConfigured()) {
    return Response.json(
      { error: "Chưa có khóa Gemini nên Bé Bảng chưa soạn câu hỏi tự động được. Thầy cô có thể lấy câu hỏi từ giáo án đã soạn, hoặc gõ tay bên dưới." },
      { status: 503 },
    );
  }
  const { source, subject, grade, count, level } = parsed.data;
  try {
    const set = await generateJson({
      role: "default",
      label: "quiz/generate",
      system: SYSTEM,
      user: `Môn ${subject}, ${grade}. Số câu: ${count}. Mức độ: ${LEVEL[level]}.\n\nNỘI DUNG BÀI GIẢNG:\n${source.normalize("NFC")}`,
      schema: quizSetSchema,
      temperature: 0.5,
      timeoutMs: 85_000,
    });
    return Response.json({ set });
  } catch (err) {
    console.error("quiz/generate lỗi:", (err as Error).message);
    return Response.json({ error: "Gemini đang bận, thầy cô thử lại sau ít phút nhé." }, { status: 502 });
  }
}
