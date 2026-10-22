import toan9 from "./sgk/toan-9.json";
import vatly10 from "./sgk/vat-ly-10.json";
import vatly11 from "./sgk/vat-ly-11.json";
import nguvan6 from "./sgk/ngu-van-6.json";
import nguvan7 from "./sgk/ngu-van-7.json";
import { textbookSchema } from "./schema";
export const TEXTBOOKS = [toan9,vatly10,vatly11,nguvan6,nguvan7].map(b=>textbookSchema.parse(b));
export function findTextbookLesson(bookId:string,lessonId:string) {
  const book=TEXTBOOKS.find(b=>b.id===bookId&&b.daKiemTra);
  const lesson=book?.chuong.flatMap(c=>c.bai).find(b=>b.id===lessonId);
  return book&&lesson?{book,lesson}:undefined;
}
