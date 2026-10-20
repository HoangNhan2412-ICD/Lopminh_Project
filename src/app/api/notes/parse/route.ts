import { z } from "zod";
import { getGemini } from "@/lib/ai/client";
import { MODELS } from "@/lib/ai/models";
import { notesParsePrompt } from "@/lib/ai/prompts";
import { parseNotesFallback, parsedNoteSchema, type ParsedNote } from "@/lib/notes/parse";
import { nfc } from "@/lib/text";
import type { Student } from "@/lib/types";

const bodySchema = z.object({
  text: z.string().min(1).max(4000),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  roster: z
    .array(
      z.object({
        id: z.string(),
        fullName: z.string(),
        shortName: z.string(),
        gender: z.enum(["nam", "nu"]),
        classId: z.string(),
        traits: z.array(z.string()),
      }),
    )
    .max(80),
});

const responseJsonSchema = {
  type: "object",
  properties: {
    notes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rawName: { type: "string" },
          studentId: { type: ["string", "null"] },
          kind: { type: "string", enum: ["chuyen-can", "suc-khoe", "tam-ly", "hoc-tap", "khen-thuong", "khac"] },
          text: { type: "string" },
          until: { type: "string" },
          absentToday: { type: "boolean" },
        },
        required: ["rawName", "studentId", "kind", "text"],
      },
    },
  },
  required: ["notes"],
};

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }
  const { text, today, roster } = parsed.data;
  const input = nfc(text);
  const fallback = () => parseNotesFallback(input, roster as Student[], today);

  const ai = getGemini();
  if (!ai) return Response.json({ mode: "demo", notes: fallback() });

  try {
    const res = await ai.models.generateContent({
      model: MODELS.fast,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Danh sách lớp (id | họ tên | tên gọi):\n${roster
                .map((s) => `${s.id} | ${s.fullName} | ${s.shortName}`)
                .join("\n")}\n\nGhi chú của giáo viên:\n${input}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: notesParsePrompt(today),
        responseMimeType: "application/json",
        responseJsonSchema,
        temperature: 0.1,
      },
    });
    const json = JSON.parse(res.text ?? "{}");
    const ids = new Set(roster.map((s) => s.id));
    const notes: ParsedNote[] = z
      .array(parsedNoteSchema)
      .parse(json.notes)
      .map((n) => ({
        ...n,
        rawName: nfc(n.rawName),
        text: nfc(n.text),
        studentId: n.studentId && ids.has(n.studentId) ? n.studentId : null,
      }));
    return Response.json({ mode: "ai", notes });
  } catch (err) {
    console.error("notes/parse: Gemini lỗi, dùng bộ tách dự phòng", (err as Error).message);
    return Response.json({ mode: "fallback", notes: fallback() });
  }
}
