"use client";

/** Lấy chữ từ tài liệu ngay trên trình duyệt (để tìm kiếm khi chưa có Gemini và để gửi kèm khi soạn bài). */
export async function extractText(file: File): Promise<string | null> {
  const name = file.name.toLowerCase();
  if (/\.(txt|md|csv)$/.test(name) || file.type.startsWith("text/")) {
    return (await file.text()).normalize("NFC");
  }
  if (name.endsWith(".docx")) {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const xml = await zip.file("word/document.xml")?.async("string");
    if (!xml) return null;
    return xml
      .replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (p) => `${p}\n`)
      .replace(/<w:tab\/>/g, "\t")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .normalize("NFC");
  }
  return null; // PDF, ảnh: Gemini đọc khi có khóa
}
