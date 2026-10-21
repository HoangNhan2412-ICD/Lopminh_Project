import { z } from "zod";
const text = z.string().trim().min(1).refine(s => s === s.normalize("NFC"), "Chữ cần chuẩn NFC");
const date = z.iso.date();
const officialUrl = (domains: string[]) => z.url().refine(value => {
  const u = new URL(value);
  return u.protocol === "https:" && domains.some(d => u.hostname === d || u.hostname.endsWith(`.${d}`));
}, "Cần đường dẫn HTTPS tới nguồn chính thức");
export const legalUrlSchema = officialUrl(["vbpl.vn", "moet.gov.vn", "chinhphu.vn"]);
export const bookUrlSchema = officialUrl(["taphuan.nxbgd.vn"]);
export const citationSchema = z.object({ text, source: legalUrlSchema, location: text });
export const documentSchema = z.object({
  id: text, soHieu: text, ten: text,
  ngayBanHanh: date.optional(), ngayHieuLuc: date.optional(),
  tinhTrang: z.enum(["chua-kiem-tra", "con-hieu-luc", "het-hieu-luc", "thay-the-mot-phan"]),
  banGoc: legalUrlSchema.optional(), tepPdf: z.string().regex(/^[a-zA-Z0-9_-]+\.pdf$/).optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  daKiemTra: z.boolean(), ngayKiemTra: date.optional(),
  tags: z.array(text), tomTat: z.array(citationSchema),
  khungBaiDay: z.object({ text, location: text }).optional(),
}).superRefine((d,ctx) => {
  if(d.daKiemTra && (!d.banGoc || !d.ngayKiemTra || !d.ngayBanHanh || !d.tepPdf || !d.sha256 || d.tinhTrang === "chua-kiem-tra")) ctx.addIssue({code:"custom",message:"Văn bản đã kiểm tra cần nguồn, PDF, mã SHA256, ngày và tình trạng"});
  if(!d.daKiemTra && (d.tomTat.length || d.khungBaiDay))ctx.addIssue({code:"custom",message:"Chưa đối chiếu bản gốc thì không nạp trích dẫn"});
});
export const textbookLessonSchema = z.object({
  id:text, ten:text, soTietGoiY:z.number().int().min(1).max(20),
  yeuCauCanDat:z.array(citationSchema).min(1), docSach:bookUrlSchema,
});
export const textbookSchema = z.object({
  id:text, mon:text, lop:z.number().int().min(1).max(12),
  bo:z.literal("Kết nối tri thức với cuộc sống"), daKiemTra:z.boolean(), ngayKiemTra:date.optional(),
  chuong:z.array(z.object({id:text,tap:z.number().int().min(1).max(3),ten:text,bai:z.array(textbookLessonSchema).min(1)})),
}).superRefine((book,ctx)=>{
  if(book.chuong.length && (!book.daKiemTra || !book.ngayKiemTra))ctx.addIssue({code:"custom",message:"Mục lục có nội dung cần ngày đối chiếu sách thật"});
  const ids=book.chuong.flatMap(c=>c.bai.map(b=>b.id));
  if(new Set(ids).size!==ids.length)ctx.addIssue({code:"custom",message:"Trùng mã bài"});
  if(new Set(book.chuong.map(c=>c.id)).size!==book.chuong.length)ctx.addIssue({code:"custom",message:"Trùng mã chương"});
});
export type LibraryDocument=z.infer<typeof documentSchema>;
export type Textbook=z.infer<typeof textbookSchema>;
export type TextbookLesson=z.infer<typeof textbookLessonSchema>;
