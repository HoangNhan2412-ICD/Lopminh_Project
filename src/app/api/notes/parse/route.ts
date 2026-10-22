import { logAiError } from "@/lib/ai/errors";
import { nfcJson } from "@/lib/text";
import { z } from "zod";
import { isAiConfigured } from "@/lib/ai/client";
import { generateJson } from "@/lib/ai/json";
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

export const maxDuration = 60;

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(nfcJson(await req.json().catch(() => null)));
  if (!parsed.success) {
    return Response.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }
  const { text, today, roster } = parsed.data;
  const input = nfc(text);
  const fallback = () => parseNotesFallback(input, roster as Student[], today);

  if (!isAiConfigured()) return Response.json({ mode: "demo", notes: fallback() });

  try {
    const json = await generateJson({
      role: "fast", label: "notes/parse", temperature: 0.1, timeoutMs: 50_000, totalTimeoutMs: 50_000,
      system: notesParsePrompt(today),
      user: `Danh sách lớp (id | họ tên | tên gọi):\n${roster.map(s => `${s.id} | ${s.fullName} | ${s.shortName}`).join("\n")}\n\nGhi chú của giáo viên:\n${input}`,
      schema: z.object({ notes: z.array(parsedNoteSchema) }),
    });
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
    logAiError(err);
    return Response.json({ mode: "fallback", notes: fallback() });
  }
}
