"use client";
import { useState } from "react";
import { accountSeed } from "@/lib/storage/import";
import { nfc } from "@/lib/text";
import type { TeacherProfile } from "@/lib/types";
import { stateKey } from "@/lib/storage/schema";

const input = "mt-2 min-h-11 w-full rounded-xl border border-border bg-surface p-3";
export function AccountSetup({ userId, onDone }: { userId: string; onDone: () => Promise<void> }) {
  const [gender, setGender] = useState<"nam" | "nu" | "">("");
  const [name, setName] = useState(""); const [fullName, setFullName] = useState("");
  const [subject, setSubject] = useState(""); const [school, setSchool] = useState(""); const [className, setClassName] = useState("");
  const [copy, setCopy] = useState<"yes" | "no" | "">(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function save() {
    if (!gender || !copy || !name.trim() || !fullName.trim()) { setError("Chọn danh xưng, điền tên và chọn có chuyển dữ liệu hay không."); return; }
    setBusy(true); setError("");
    try {
      const profile: TeacherProfile = { id: userId, gender, fullName: nfc(fullName.trim()), callName: nfc(name.trim()), school: nfc(school), subject: nfc(subject), team: "", yearsTeaching: 0, teachingStyle: { summary: "", tags: [] }, interests: [], kpis: [], accent: "bang" };
      let local: Record<string, unknown> | null = null;
      if (copy === "yes") {
        local = {};
        for (const key of Object.keys(localStorage)) if (stateKey.safeParse(key).success) {
          try { local[key] = JSON.parse(localStorage.getItem(key)!); } catch { /* bỏ khóa hỏng */ }
        }
      }
      const res = await fetch("/api/storage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, state: accountSeed(profile, local, className) }) });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error ?? "Chưa chuyển được dữ liệu. Bản trên máy vẫn còn nguyên."); return; }
      await onDone();
    } catch { setError("Chưa lưu được. Bản trên máy vẫn còn nguyên; hãy thử lại khi có mạng."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-2xl space-y-5 p-5"><h1 className="text-2xl font-bold">Chào mình đến với Lớp Mình</h1><fieldset disabled={busy} className="space-y-4"><legend className="mb-3 text-xl">Bé Bảng nên gọi mình là Thầy hay Cô ạ?</legend><div className="flex gap-3">{([ ["nam", "Thầy"], ["nu", "Cô"] ] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 rounded-xl border border-border p-3"><input type="radio" name="gender" checked={gender === value} onChange={() => setGender(value)} />{label}</label>)}</div>
    <label className="block">Tên gọi<input className={input} maxLength={60} value={name} onChange={e => setName(nfc(e.target.value))} /></label><label className="block">Họ và tên đầy đủ<input className={input} maxLength={150} value={fullName} onChange={e => setFullName(nfc(e.target.value))} /></label><label className="block">Môn dạy<input className={input} maxLength={60} value={subject} onChange={e => setSubject(nfc(e.target.value))} /></label><label className="block">Trường<input className={input} maxLength={200} value={school} onChange={e => setSchool(nfc(e.target.value))} /></label><label className="block">Lớp đầu tiên (có thể để trống)<input className={input} maxLength={30} value={className} onChange={e => setClassName(nfc(e.target.value))} /></label>
    <fieldset className="space-y-2 rounded-xl border border-border p-4"><legend>Chuyển dữ liệu trên máy này vào tài khoản?</legend><p className="text-ink-muted">Bao gồm các hồ sơ đã dùng, ghi chú, ảnh, giáo án và trò chuyện đang lưu. Hồ sơ chuyển vào vẫn chọn được trong menu hồ sơ. Bản trên máy được giữ nguyên.</p>{([ ["yes", "Có, chuyển một bản sao"], ["no", "Không, bắt đầu với hồ sơ mới"] ] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-3"><input type="radio" name="import" checked={copy === value} onChange={() => setCopy(value)} />{label}</label>)}</fieldset>
    {error && <p role="alert" className="text-urgent">{error}</p>}<button className="min-h-11 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-fg" onClick={save}>{busy ? "Đang lưu…" : "Vào Lớp Mình"}</button></fieldset></main>;
}
