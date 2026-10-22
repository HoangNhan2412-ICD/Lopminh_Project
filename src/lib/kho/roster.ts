"use client";

import type { Gender, Student } from "@/lib/types";
import { stripDiacritics } from "@/lib/text";

/*
  Nhập danh sách lớp từ Excel/CSV. Cột nhận theo tên (không phân biệt dấu, hoa thường):
  "Họ và tên" | "Giới tính" | "Đặc điểm" (cách nhau dấu phẩy). Có file mẫu tải về.
*/

export const ROSTER_HEADERS = ["STT", "Họ và tên", "Giới tính (Nam/Nữ)", "Đặc điểm, cách học (cách nhau dấu phẩy)", "Học lực"];

function pickCol(headers: string[], ...keys: string[]): number {
  const norm = headers.map((h) => stripDiacritics(h ?? ""));
  return norm.findIndex((h) => keys.some((k) => h.includes(k)));
}

export function rowsToStudents(rows: string[][], classId: string): Student[] {
  if (rows.length < 2) return [];
  const headerIdx = rows.findIndex((r) => r.some((c) => /ho va ten|ho ten|ten hoc sinh/.test(stripDiacritics(c ?? ""))));
  const head = rows[headerIdx >= 0 ? headerIdx : 0];
  const iName = pickCol(head, "ho va ten", "ho ten", "ten");
  const iGender = pickCol(head, "gioi tinh", "gioi");
  const iTraits = pickCol(head, "dac diem", "tinh cach", "ghi chu");
  const iAbility = pickCol(head, "hoc luc");
  const out: Student[] = [];
  for (const r of rows.slice((headerIdx >= 0 ? headerIdx : 0) + 1)) {
    const fullName = String(r[iName >= 0 ? iName : 1] ?? "").normalize("NFC").trim().replace(/\s+/g, " ");
    if (!fullName || /^\d+$/.test(fullName)) continue;
    const g = stripDiacritics(String(r[iGender] ?? ""));
    const gender: Gender = /^(nu|f|female)/.test(g) ? "nu" : "nam";
    const traits = iTraits >= 0 ? String(r[iTraits] ?? "").split(/[,;]/).map((t) => t.trim().normalize("NFC")).filter(Boolean) : [];
    const parts = fullName.split(" ");
    const levels: Record<string, Student["hocLuc"]> = { gioi: "gioi", kha: "kha", "trung binh": "trung-binh", yeu: "yeu" };
    const hocLuc = levels[stripDiacritics(String(r[iAbility] ?? "").trim())];
    out.push({ id: `${classId}-n${out.length + 1}`, fullName, shortName: parts[parts.length - 1], gender, classId, traits, ...(hocLuc ? { hocLuc } : {}) });
  }
  return out;
}

export async function readRosterFile(file: File, classId: string): Promise<Student[]> {
  if (file.name.toLowerCase().endsWith(".csv")) {
    const text = await file.text();
    const sep = text.includes(";") && !text.includes(",") ? ";" : ",";
    return rowsToStudents(text.split(/\r?\n/).map((l) => l.split(sep).map((c) => c.replace(/^"|"$/g, ""))), classId);
  }
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets[0];
  const rows: string[][] = [];
  ws.eachRow((row) => {
    const vals = (row.values as unknown[]).slice(1).map((v) => (v == null ? "" : typeof v === "object" && "text" in (v as object) ? String((v as { text: string }).text) : String(v)));
    rows.push(vals);
  });
  return rowsToStudents(rows, classId);
}

export async function rosterTemplate(className: string): Promise<Blob> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`Lớp ${className}`);
  ws.addRow(ROSTER_HEADERS).font = { bold: true };
  ws.addRow([1, "Nguyễn Văn A", "Nam", "Hướng nội, cần khích lệ", "Trung bình"]);
  ws.addRow([2, "Trần Thị B", "Nữ", "Tiếp thu nhanh, thích vẽ", "Giỏi"]);
  ws.columns = [{ width: 6 }, { width: 30 }, { width: 18 }, { width: 50 }, { width: 16 }];
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
