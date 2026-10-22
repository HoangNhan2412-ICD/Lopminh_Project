import { readFile, realpath, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
import { GoogleGenAI } from "@google/genai";

/** Mặc định chỉ đối chiếu; --upload mới gọi Gemini. Không tự nạp .env.local. */
async function main() {
  const { documentSchema } = await import(new URL("../src/content/thu-vien/schema.ts", import.meta.url).href);
  const rows = JSON.parse(await readFile("src/content/thu-vien/van-ban.json", "utf8")) as unknown[];
  const root = await realpath("kho-mac-dinh/van-ban");
  const files: { id: string; path: string; name: string; sha256: string }[] = [];
  for (const row of rows) {
    const d = documentSchema.parse(row);
    if (!d.daKiemTra || d.tinhTrang !== "con-hieu-luc") continue;
    const path = await realpath(resolve(root, d.tepPdf));
    if (!path.startsWith(root + sep)) throw new Error("PDF nằm ngoài thư mục được phép.");
    const bytes = await readFile(path);
    if (bytes.subarray(0,5).toString() !== "%PDF-") throw new Error(`Tệp ${d.id} không phải PDF.`);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (sha256 !== d.sha256) throw new Error(`PDF ${d.id} thay đổi từ lần đối chiếu. Kiểm tra lại trước khi nạp.`);
    files.push({ id:d.id,path,name:d.soHieu,sha256 });
  }
  console.log(`Có ${files.length} PDF đã đối chiếu và khớp SHA256.`);
  if (!process.argv.includes("--upload")) { console.log("Chỉ kiểm tra, chưa tải lên Gemini. Xem docs/THU-VIEN.md."); return; }
  if (!files.length) throw new Error("DỪNG: chưa có PDF đã đối chiếu từ nhóm.");
  if (!process.env.GEMINI_API_KEY) throw new Error("Thiếu GEMINI_API_KEY. Tự cấu hình trên máy; không gửi khóa vào chat.");
  const ai = new GoogleGenAI({ apiKey:process.env.GEMINI_API_KEY });
  let store = process.env.GEMINI_SHARED_STORE;
  if (store && !/^fileSearchStores\/[a-zA-Z0-9_-]+$/.test(store)) throw new Error("Tên kho chung không hợp lệ.");
  if (!store) store=(await ai.fileSearchStores.create({config:{displayName:"lopminh-van-ban-chung"}})).name;
  if (!store) throw new Error("Chưa tạo được kho chung.");
  await mkdir(".local",{recursive:true});
  // Lưu tên kho ngay để lần lỗi sau có thể tiếp tục, không tạo thêm kho ngoài ý muốn.
  await writeFile(".local/thu-vien-store.json", JSON.stringify({store},null,2));
  const manifestPath=".local/thu-vien-upload.json";
  let uploaded: Record<string,string>={};
  try {const saved=JSON.parse(await readFile(manifestPath,"utf8"));if(saved.store===store)uploaded=saved.uploaded;}catch{/* lần đầu */}
  for (const file of files) {
    if(uploaded[file.id]===file.sha256)continue;
    let op=await ai.fileSearchStores.uploadToFileSearchStore({file:file.path,fileSearchStoreName:store,config:{displayName:file.name,mimeType:"application/pdf"}});
    const deadline=Date.now()+180000;
    while(!op.done&&Date.now()<deadline){await new Promise(r=>setTimeout(r,2000));op=await ai.operations.get({operation:op});}
    if(!op.done||op.error)throw new Error(`Chưa nạp xong ${file.id}; kiểm tra kho trước khi chạy lại.`);
    uploaded[file.id]=file.sha256;
    await writeFile(manifestPath,JSON.stringify({store,uploaded},null,2));
    console.log(`Đã nạp ${file.id}.`);
  }
  console.log("Tên kho (không phải khóa):",store);
  console.log("Tự đặt tên này vào GEMINI_SHARED_STORE ở máy và Vercel.");
}
main().catch(()=>{console.error("Nạp kho thất bại. Kiểm tra nguồn, định dạng và cấu hình dịch vụ; không in lỗi thô SDK.");process.exitCode=1;});
