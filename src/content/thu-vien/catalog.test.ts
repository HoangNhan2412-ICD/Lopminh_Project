import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { documentSchema, textbookSchema, bookUrlSchema } from "./schema";
import { VAN_BAN, verifiedLessonFramework } from "./van-ban";
import { TEXTBOOKS } from "./catalog";
import { DEMO_CLASSES } from "@/lib/demo/data";
describe("thư viện có nguồn",()=>{
 for(const file of readdirSync("src/content/thu-vien/sgk").filter(f=>f.endsWith(".json")))it(`mục lục ${file} đúng schema`,()=>{const data=JSON.parse(readFileSync(`src/content/thu-vien/sgk/${file}`,"utf8"));expect(textbookSchema.safeParse(data).success).toBe(true);expect(TEXTBOOKS.some(b=>b.id===data.id)).toBe(true)});
 it("mỗi môn/lớp demo có một tệp",()=>{for(const c of Object.values(DEMO_CLASSES).flat())expect(TEXTBOOKS.some(b=>b.mon===c.subject&&b.lop===Number(c.name.match(/^\d+/)?.[0]))).toBe(true)});
 it("không nhận nguồn sách bên ngoài hoặc javascript URL",()=>{expect(bookUrlSchema.safeParse("https://example.com/sach").success).toBe(false);expect(bookUrlSchema.safeParse("javascript:alert(1)").success).toBe(false)});
 it("chặn tự đánh dấu văn bản đã đối chiếu khi thiếu bản gốc",()=>{expect(documentSchema.safeParse({...VAN_BAN[0],daKiemTra:true}).success).toBe(false)});
 it("chưa đối chiếu thì không được có trích dẫn hoặc khung luật",()=>{expect(documentSchema.safeParse({...VAN_BAN[0],khungBaiDay:{text:"tự viết",location:"IV"}}).success).toBe(false);if(!VAN_BAN.some(d=>d.daKiemTra))expect(verifiedLessonFramework()).toBe("")});
});
