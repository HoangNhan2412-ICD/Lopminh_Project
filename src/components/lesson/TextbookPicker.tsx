"use client";
import { useState } from "react";
import { TEXTBOOKS } from "@/content/thu-vien/catalog";
import type { TextbookLesson } from "@/content/thu-vien/schema";
export function TextbookPicker({subject,grade,onPick}:{subject:string;grade:number;onPick:(bookId:string,lesson:TextbookLesson|null)=>void}){
 const book=TEXTBOOKS.find(b=>b.mon===subject&&b.lop===grade);const [chapter,setChapter]=useState("");const [lesson,setLesson]=useState("");const [manual,setManual]=useState(false);
 const c=book?.chuong.find(c=>c.id===chapter);const l=c?.bai.find(b=>b.id===lesson);
 const input="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface p-3";
 return <fieldset className="space-y-3 rounded-xl border border-border p-4"><legend className="px-2 font-semibold">Bài trong SGK Kết nối tri thức</legend><p>{subject} · Lớp {grade||"chưa chọn"}</p><label className="block">Bộ sách<select className={input} value={manual?"other":"kntt"} onChange={e=>{setManual(e.target.value==="other");setChapter("");setLesson("");onPick(book?.id??"",null)}}><option value="kntt">Kết nối tri thức với cuộc sống</option><option value="other">Tài liệu khác / tự gõ</option></select></label>
 {!manual&&(book?.daKiemTra&&book.chuong.length?<div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label>Chương<select className={input} value={chapter} onChange={e=>{setChapter(e.target.value);setLesson("");onPick(book.id,null)}}><option value="">Chọn chương</option>{book.chuong.map(c=><option key={c.id} value={c.id}>Tập {c.tap} · {c.ten}</option>)}</select></label><label>Bài<select className={input} value={lesson} onChange={e=>{setLesson(e.target.value);onPick(book.id,c?.bai.find(b=>b.id===e.target.value)??null)}} disabled={!c}><option value="">Chọn bài</option>{c?.bai.map(b=><option key={b.id} value={b.id}>{b.ten}</option>)}</select></label></div>:<p className="text-ink-muted">Mục lục môn/lớp này chưa được đối chiếu. Mình vẫn gõ tên bài ở dưới để soạn như trước nhé.</p>)}
 {l&&<div className="rounded-xl bg-primary-soft p-3"><p>{l.soTietGoiY} tiết gợi ý</p><ul className="list-inside list-disc">{l.yeuCauCanDat.map((y,i)=><li key={i}>{y.text}</li>)}</ul></div>}</fieldset>;
}
