import { getGemini } from "@/lib/ai/client";

export const maxDuration = 120;

const MAX_BYTES = 20 * 1024 * 1024;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Đưa tài liệu của giáo viên vào Gemini File Search (mỗi giáo viên một kho riêng).
 * Chưa có khóa Gemini thì trả mode "local": tài liệu chỉ lưu trên trình duyệt.
 */
export async function POST(req: Request) {
  const ai = getGemini();
  if (!ai) return Response.json({ mode: "local" });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const category = String(form?.get("category") ?? "khac");
  const profileId = String(form?.get("profileId") ?? "").replace(/[^a-z0-9-]/gi, "").slice(0, 60);
  let storeName = String(form?.get("storeName") ?? "");
  if (!(file instanceof File)) return Response.json({ error: "Chưa có tệp." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Tệp lớn hơn 20 MB, thầy cô chia nhỏ giúp em nhé." }, { status: 413 });

  try {
    if (!storeName.startsWith("fileSearchStores/")) {
      const store = await ai.fileSearchStores.create({ config: { displayName: `lopminh-${profileId || "gv"}` } });
      storeName = store.name ?? "";
    }
    let op = await ai.fileSearchStores.uploadToFileSearchStore({
      fileSearchStoreName: storeName,
      file,
      config: {
        displayName: file.name.normalize("NFC"),
        mimeType: file.type || undefined,
        customMetadata: [{ key: "loai", stringValue: category }],
      },
    });
    const started = Date.now();
    while (!op.done && Date.now() - started < 100_000) {
      await sleep(2500);
      op = await ai.operations.get({ operation: op });
    }
    if (!op.done) return Response.json({ mode: "ai", storeName, pending: true });
    return Response.json({ mode: "ai", storeName, documentName: op.response?.documentName ?? null });
  } catch (err) {
    console.error("kho/upload lỗi:", (err as Error).message);
    return Response.json({ mode: "local", warning: "Chưa đưa được tệp lên Gemini, tạm lưu trên máy." });
  }
}
