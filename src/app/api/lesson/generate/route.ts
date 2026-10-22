import { generateLesson, parseLessonInput } from "@/lib/lesson/generate-server";
export const maxDuration = 270;
export async function POST(req: Request) {
  let input;
  try { input = parseLessonInput(await req.json()); }
  catch { return Response.json({ error: "Yêu cầu soạn bài chưa hợp lệ; kiểm tra thông tin lớp và bài SGK." }, { status: 400 }); }
  return Response.json(await generateLesson(input));
}
