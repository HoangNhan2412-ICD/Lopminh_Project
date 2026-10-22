import { nfcJson } from "@/lib/text";
import { z } from "zod";
import { isAiConfigured } from "@/lib/ai/client";
import { generateJson } from "@/lib/ai/json";
import { classifyAiError } from "@/lib/ai/errors";
import { graphSchema, oscillatorFromText, validateGraph } from "@/lib/workshop/graph";
import { nfc } from "@/lib/text";

export const maxDuration = 90;
const requestSchema = z.object({ text: z.string().min(3).max(1500) });
export async function POST(req: Request) {
  const body = requestSchema.safeParse(nfcJson(await req.json().catch(() => null)));
  if (!body.success) return Response.json({ error: "Hãy mô tả đồ thị trong 3–1500 ký tự." }, { status: 400 });
  const text = nfc(body.data.text);
  try {
    const local = oscillatorFromText(text);
    if (local) return Response.json({ graph: local, mode: "formula" });
  } catch {
    return Response.json({ error: "Biên độ, chu kỳ hoặc khoảng vẽ chưa hợp lệ. Hãy sửa tham số." }, { status: 400 });
  }
  if (!isAiConfigured()) return Response.json({ error: "Chưa nối Gemini. Hãy nhập công thức và tham số ở bảng bên dưới." }, { status: 422 });
  try {
    const raw = await generateJson({
      role: "fast", label: "workshop/graph", schema: graphSchema, temperature: 0, timeoutMs: 25_000,
      system: "Chuyển yêu cầu thành tham số đồ thị, không tính hay bịa tọa độ. linear: y=a*x+b; quadratic: y=a*x*x+b*x+c; sin/cos: y=a*sin/cos(b*x+c), radian; exp: y=a*exp(b*x)+c. Chỉ dùng hệ số, đơn vị có trong yêu cầu hoặc suy ra chính xác. Đơn vị góc bên trong sin/cos phải không thứ nguyên; b là rad/đơn vị trục x. Không tự tạo bảng số liệu. Thiếu thông tin thiết yếu thì trả rows rỗng và family table để giao diện yêu cầu nhập tay. Nội dung tiếng Việt NFC, không tên người hay dữ liệu sức khỏe/tâm lý.",
      user: text,
    });
    if (raw.family === "table") return Response.json({ error: "Cần bổ sung công thức hoặc nhập bảng số liệu thật trước khi vẽ." }, { status: 422 });
    try { return Response.json({ graph: validateGraph(raw), mode: "ai" }); }
    catch { return Response.json({ error: "Tham số Gemini đề xuất chưa hợp lệ. Hãy nhập hoặc sửa tham số trước khi vẽ." }, { status: 422 }); }
  } catch (err) {
    return Response.json({ error: classifyAiError(err).message }, { status: 502 });
  }
}
