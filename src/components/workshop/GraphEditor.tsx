"use client";
import { useState } from "react";
import type { Graph } from "@/lib/workshop/graph";
import { nfc } from "@/lib/text";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-xl border border-border bg-surface p-2";
const FAMILIES = { linear: "Bậc nhất: y = ax + b", quadratic: "Bậc hai: y = ax² + bx + c", sin: "Hàm sin: y = a sin(bx + c)", cos: "Hàm cos: y = a cos(bx + c)", exp: "Hàm mũ: y = a exp(bx) + c", table: "Bảng số liệu → biểu đồ cột" };
export function GraphEditor({ graph, onChange }: { graph: Graph; onChange: (g: Graph) => void }) {
  const [table, setTable] = useState(graph.rows.map(r => `${r.label}; ${r.value}`).join("\n"));
  return <fieldset className="space-y-3 rounded-xl border border-border p-4">
    <legend className="px-2 font-semibold">Tham số đồ thị</legend>
    <label className="block">Dạng đồ thị<select className={field} value={graph.family} onChange={e => onChange({ ...graph, family: e.target.value as Graph["family"] })}>{Object.entries(FAMILIES).map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select></label>
    <label className="block">Tiêu đề<input className={field} maxLength={120} value={graph.title} onChange={e => onChange({ ...graph, title: nfc(e.target.value) })} /></label>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{([ ["xLabel", "Tên trục ngang"], ["xUnit", "Đơn vị trục ngang"], ["yLabel", "Tên trục đứng"], ["yUnit", "Đơn vị trục đứng"] ] as const).map(([key, title]) => <label key={key}>{title}<input className={field} value={graph[key]} maxLength={key.endsWith("Unit") ? 16 : 60} onChange={e => onChange({ ...graph, [key]: nfc(e.target.value) })} /></label>)}</div>
    {graph.family === "table" ? <label className="block">Mỗi dòng: nhãn; giá trị (tối đa 24 dòng)<textarea rows={5} className={field} value={table} placeholder={"Lần 1; 5\nLần 2; 7"} onChange={e => { const t = nfc(e.target.value); setTable(t); onChange({ ...graph, rows: t.split("\n").filter(s => s.trim()).map(s => { const [label, value] = s.split(";"); return { label: label.trim(), value: value?.trim() ? Number(value.trim().replace(",", ".")) : NaN }; }) }); }} /></label> : <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{([ ["a", "Hệ số a"], ["b", "Hệ số b"], ["c", "Hệ số c / pha (radian)"], ["min", "Trục ngang: từ"], ["max", "Trục ngang: đến"] ] as const).map(([key, title]) => <label key={key}>{title}<input className={field} type="number" step="any" value={Number.isFinite(graph[key]) ? graph[key] : ""} onChange={e => onChange({ ...graph, [key]: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>)}</div>
      <p className="text-ink-muted">Sin/cos dùng radian. Với dao động: a = biên độ, b = 2π / chu kỳ, c = pha ban đầu. Ví dụ mặc định lấy pha bằng 0. Hãy kiểm tra đơn vị và chọn pha phù hợp đề bài.</p>
    </>}
  </fieldset>;
}
