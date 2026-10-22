"use client";

import { BookMarked, Download, FileUp, LoaderCircle, MessageCircleQuestion, NotebookPen, Search, Trash2, Upload, Users, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button, Card, CardHeader, Chip } from "@/components/ui";
import { extractText } from "@/lib/kho/extract";
import { readRosterFile, rosterTemplate } from "@/lib/kho/roster";
import { DOC_CATEGORIES, useDocs, useStoreName, type DocCategory, type KnowledgeDoc } from "@/lib/kho/store";
import { newId } from "@/lib/lesson/build";
import { useLessons } from "@/lib/lesson/store";
import { ACTIVITY_NAMES } from "@/lib/lesson/types";
import { addressOf, honorificLower } from "@/lib/persona/honorific";
import { downloadBlob } from "@/lib/quiz/export";
import { speakVi } from "@/lib/speech";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn, nfc, stripDiacritics } from "@/lib/text";
import { SharedLibrary } from "@/components/kho/SharedLibrary";

type Tab = "thu-vien" | "tai-lieu" | "hoc-sinh" | "notebooklm";
const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none";

function kb(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

/* ---------- Tài liệu ---------- */
function DocsTab() {
  const { profile } = useApp();
  const h = honorificLower(profile);
  const [docs, setDocs] = useDocs(profile.id);
  const [storeName, setStoreName] = useStoreName(profile.id);
  const [category, setCategory] = useState<DocCategory>("sach");
  const [busy, setBusy] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{ text: string; sources: string[] } | null>(null);
  const [asking, setAsking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    let store = storeName;
    for (const file of Array.from(files)) {
      setBusy(file.name);
      try {
        const text = await extractText(file).catch(() => null);
        if (file.size > 4 * 1024 * 1024) {
          // Máy chủ chỉ nhận tệp tới 4 MB: tệp lớn chỉ giữ chữ đọc được trên máy
          setDocs((all) => [
            { id: newId("doc"), name: file.name.normalize("NFC"), category, size: file.size, addedAt: new Date().toISOString(), text: text ? text.slice(0, 60_000) : null, remote: false },
            ...all,
          ]);
          toast.info(`${file.name} lớn hơn 4 MB nên chỉ lưu trên máy. ${capFirst(h)} chia nhỏ tệp nếu muốn Gemini đọc.`);
          continue;
        }
        const form = new FormData();
        form.set("file", file);
        form.set("category", category);
        form.set("profileId", profile.id);
        if (store) form.set("storeName", store);
        const res = await fetch("/api/kho/upload", { method: "POST", body: form });
        const data = (await res.json()) as { mode?: "ai" | "local"; storeName?: string; error?: string; warning?: string };
        if (!res.ok) throw new Error(data.error ?? "Chưa tải được tệp.");
        if (data.storeName) {
          store = data.storeName;
          setStoreName(data.storeName);
        }
        if (data.warning) toast.warning(data.warning);
        const doc: KnowledgeDoc = {
          id: newId("doc"),
          name: file.name.normalize("NFC"),
          category,
          size: file.size,
          addedAt: new Date().toISOString(),
          text: text ? text.slice(0, 60_000) : null,
          remote: data.mode === "ai",
        };
        setDocs((all) => [doc, ...all]);
        if (!text && data.mode !== "ai") toast.info(`${file.name}: chưa đọc được chữ trong tệp này khi chưa có Gemini, nhưng vẫn lưu tên để ${h} đưa vào NotebookLM.`);
      } catch (e) {
        toast.error(`${file.name}: ${(e as Error).message}`);
      }
    }
    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function ask() {
    const q = nfc(question.trim());
    if (!q) return;
    setAsking(true);
    setAnswer(null);
    try {
      if (storeName) {
        const res = await fetch("/api/kho/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, storeName, profile }) });
        const data = (await res.json()) as { answer?: string; sources?: string[]; error?: string };
        if (res.ok && data.answer) {
          setAnswer({ text: data.answer, sources: data.sources ?? [] });
          return;
        }
      }
      // Chưa có Gemini: tìm theo từ khóa trong chữ đã lấy được
      const words = stripDiacritics(q).split(/\s+/).filter((w) => w.length > 2);
      const hits: { name: string; snippet: string; score: number }[] = [];
      for (const d of docs) {
        if (!d.text) continue;
        const plain = stripDiacritics(d.text);
        const score = words.reduce((n, w) => n + (plain.includes(w) ? 1 : 0), 0);
        if (!score) continue;
        const i = Math.max(0, plain.indexOf(words.find((w) => plain.includes(w)) ?? ""));
        hits.push({ name: d.name, snippet: d.text.slice(Math.max(0, i - 120), i + 280).replace(/\s+/g, " "), score });
      }
      hits.sort((a, b) => b.score - a.score);
      setAnswer(
        hits.length
          ? { text: hits.slice(0, 3).map((x) => `“…${x.snippet}…”`).join("\n\n"), sources: hits.slice(0, 3).map((x) => x.name) }
          : { text: "Bé Bảng chưa thấy đoạn nào khớp trong các tài liệu đã đọc được.", sources: [] },
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Card>
          <CardHeader icon={<FileUp className="size-6" />} title="Thêm tài liệu" subtitle="Bé Bảng dựa vào kho này khi soạn bài, trả lời và ghi rõ lấy từ tài liệu nào" />
          <div className="space-y-4 p-5">
            <p className="text-sm text-ink-muted">Chỉ tải tài liệu mình có quyền sử dụng. Kho này được tách theo hồ sơ của mình.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DOC_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  aria-pressed={category === c.id}
                  className={cn("min-h-14 rounded-xl border px-3 py-2 text-left", category === c.id ? "border-primary bg-primary-soft" : "border-border hover:bg-surface-muted")}
                >
                  <span className="block font-semibold">{c.label}</span>
                  <span className="block text-sm text-ink-muted">{c.hint}</span>
                </button>
              ))}
            </div>
            <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.md,.csv" className="sr-only" id="kho-file" onChange={(e) => upload(e.target.files)} />
            <label htmlFor="kho-file" className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-muted p-4 text-center hover:border-primary">
              {busy ? <LoaderCircle className="size-7 animate-spin text-primary" aria-hidden /> : <Upload className="size-7 text-primary" aria-hidden />}
              <span className="font-semibold">{busy ? `Đang đọc ${busy}…` : "Bấm để chọn tệp PDF, Word, TXT"}</span>
              <span className="text-sm text-ink-muted">Tối đa 4 MB mỗi tệp. Tệp lớn hơn thì chia nhỏ, hoặc đưa thẳng vào NotebookLM</span>
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader title="Tài liệu đã có" subtitle={docs.length ? `${docs.length} tệp` : "Chưa có tệp nào"} />
          <ul className="divide-y divide-border">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                <BookMarked className="size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.name}</p>
                  <p className="text-sm text-ink-muted">
                    {DOC_CATEGORIES.find((c) => c.id === d.category)?.label}, {kb(d.size)}
                  </p>
                </div>
                {d.remote ? <Chip tone="success">Gemini đã đọc</Chip> : d.text ? <Chip>Đọc trên máy</Chip> : <Chip tone="accent">Chỉ lưu tên</Chip>}
                <button onClick={() => setDocs((all) => all.filter((x) => x.id !== d.id))} className="flex size-11 items-center justify-center rounded-lg text-ink-muted hover:bg-urgent-soft hover:text-urgent" aria-label={`Xóa ${d.name}`}>
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="self-start">
        <CardHeader icon={<MessageCircleQuestion className="size-6" />} title="Hỏi kho tài liệu" subtitle={`Ví dụ: “Tuần 10 dạy bài gì?”, “Hạn nộp sáng kiến kinh nghiệm?”`} />
        <div className="space-y-3 p-5">
          <div className="flex gap-2">
            <input className={inputCls} value={question} onChange={(e) => setQuestion(nfc(e.target.value))} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder={`${capFirst(h)} hỏi gì cũng được…`} aria-label="Câu hỏi" />
            <Button onClick={ask} disabled={asking || !question.trim()} className="shrink-0">
              {asking ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Search className="size-5" aria-hidden />}
            </Button>
          </div>
          {answer && (
            <div className="rounded-xl bg-surface-muted p-4">
              <p className="whitespace-pre-line leading-relaxed">{answer.text}</p>
              {answer.sources.length > 0 && <p className="mt-2 text-sm text-ink-muted">Nguồn: {answer.sources.join(", ")}</p>}
            </div>
          )}
          {!storeName && <p className="text-sm text-ink-muted">Khi chưa có khóa Gemini, Bé Bảng tìm theo từ khóa trong tệp Word và TXT.</p>}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Học sinh ---------- */
function StudentsTab() {
  const { profile, classes, students, setRoster } = useApp();
  const h = honorificLower(profile);
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const cls = classes.find((c) => c.id === classId);
  const roster = students.filter((s) => s.classId === classId);
  const [busy, setBusy] = useState(false);

  async function importFile(f: File | undefined) {
    if (!f || !cls) return;
    setBusy(true);
    try {
      const list = await readRosterFile(f, cls.id);
      if (!list.length) throw new Error("Không thấy cột “Họ và tên” trong tệp. Mình dùng file mẫu giúp em nhé.");
      setRoster(cls.id, list);
      toast.success(`Đã nhập ${list.length} em vào lớp ${cls.name}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader icon={<Users className="size-6" />} title="Danh sách lớp" subtitle={`Nhập từ Excel hoặc CSV. Đặc điểm của từng em giúp Bé Bảng chia tầng và gợi ý cách hỗ trợ.`} />
        <div className="flex flex-wrap items-end gap-3 p-5">
          <label className="block">
            <span className="text-sm text-ink-muted">Lớp</span>
            <select className={cn(inputCls, "mt-1 min-h-11")} value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role === "chu-nhiem" ? "chủ nhiệm" : "bộ môn"})
                </option>
              ))}
            </select>
          </label>
          <input type="file" accept=".xlsx,.csv" className="sr-only" id="roster-file" onChange={(e) => importFile(e.target.files?.[0])} />
          <label htmlFor="roster-file" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-fg hover:bg-primary-hover">
            {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Upload className="size-5" aria-hidden />} Nhập từ Excel
          </label>
          <Button variant="secondary" onClick={async () => cls && downloadBlob(await rosterTemplate(cls.name), `Mau_danh_sach_${cls.name}.xlsx`)}>
            <Download className="size-5" aria-hidden /> Tải file mẫu
          </Button>
        </div>
      </Card>
      <Card>
        <CardHeader title={`Lớp ${cls?.name ?? ""}`} subtitle={`${roster.length} em. ${capFirst(h)} bấm vào ô đặc điểm để sửa.`} />
        <ul className="divide-y divide-border">
          {roster.map((s) => (
            <li key={s.id} className="grid gap-2 px-5 py-3 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-center">
              <p className="font-medium">
                {s.fullName} <span className="text-sm font-normal text-ink-muted">({s.gender === "nu" ? "nữ" : "nam"})</span>
              </p>
              <input
                className={inputCls}
                defaultValue={s.traits.join(", ")}
                placeholder="Ví dụ: hướng nội, tiếp thu nhanh, cần khích lệ"
                onBlur={(e) => {
                  const traits = e.target.value.split(",").map((t) => nfc(t.trim())).filter(Boolean);
                  if (traits.join("|") !== s.traits.join("|") && cls) setRoster(cls.id, roster.map((x) => (x.id === s.id ? { ...x, traits } : x)));
                }}
                aria-label={`Đặc điểm của ${s.fullName}`}
              />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------- Cầu nối NotebookLM ---------- */
const NLM_STEPS = [
  "Bấm “Tải gói cho NotebookLM” bên dưới. Máy tải về một tệp tên Goi_NotebookLM.md.",
  "Mở notebooklm.google.com, đăng nhập bằng tài khoản Google, bấm “Tạo sổ ghi chú mới” (New notebook).",
  "Bấm “Thêm nguồn” (Add source), chọn tệp gói vừa tải. Thêm luôn các tệp gốc (SGK, kế hoạch tổ…) nếu muốn.",
  "Ở khung Studio bên phải, chọn “Tổng quan bằng âm thanh” (Audio Overview) để có bài nghe tiếng Việt, hoặc “Thẻ ghi nhớ”, “Bản đồ tư duy”.",
  "Muốn hỏi thêm, chép một câu lệnh mẫu trong gói rồi dán vào ô trò chuyện của NotebookLM.",
];

function NotebookTab() {
  const { profile, students } = useApp();
  const h = honorificLower(profile);
  const [docs] = useDocs(profile.id);
  const [lessons] = useLessons(profile.id);
  const [pickDocs, setPickDocs] = useState<string[]>([]);
  const [pickLessons, setPickLessons] = useState<string[]>([]);

  function buildPack() {
    const parts: string[] = [];
    parts.push(`# Gói tài liệu của ${addressOf(profile)} cho NotebookLM`);
    parts.push(`Giáo viên ${profile.subject}, ${profile.school}. Phong cách dạy: ${profile.teachingStyle.summary}`);
    parts.push(`\n## Câu lệnh gợi ý (chép dán vào NotebookLM)
- Tóm tắt các nguồn thành dàn ý một tiết dạy 45 phút theo 4 hoạt động của Công văn 5512, có ví dụ đời sống Việt Nam.
- Soạn 10 câu trắc nghiệm 4 lựa chọn từ các nguồn, kèm đáp án và giải thích ngắn.
- Liệt kê các mốc thời gian và hạn nộp trong các kế hoạch.
- Gợi ý ba cách giảng chậm và dễ hiểu hơn cho học sinh cần củng cố.
- Tạo bản tổng quan bằng âm thanh bằng tiếng Việt, giọng thân thiện, dài khoảng 8 phút, cho học sinh nghe ôn bài.`);
    for (const l of lessons.filter((x) => pickLessons.includes(x.id))) {
      parts.push(`\n## Giáo án: ${l.title} (lớp ${l.request.className})`);
      parts.push(`Mục tiêu: ${[...l.objectives.kienThuc, ...l.objectives.nangLuc].join("; ")}`);
      for (const a of l.activities) parts.push(`### ${ACTIVITY_NAMES[a.key]} (${a.minutes} phút)\n${a.goal}\n${a.content}${a.coBan ? `\nCơ bản: ${a.coBan}\nNâng cao: ${a.nangCao}` : ""}`);
      parts.push(`Slide: ${l.slides.map((s) => s.title).join(" | ")}`);
    }
    for (const d of docs.filter((x) => pickDocs.includes(x.id))) {
      parts.push(`\n## Tài liệu: ${d.name}`);
      parts.push(d.text ?? "(Tệp PDF/ảnh: thầy cô tải tệp gốc lên NotebookLM cùng gói này.)");
    }
    parts.push(`\n## Sĩ số các lớp\n${Array.from(new Set(students.map((s) => s.classId))).map((c) => `- Lớp ${c}: ${students.filter((s) => s.classId === c).length} em`).join("\n")}`);
    // Không đưa tên, sức khỏe, tâm lý học sinh ra ngoài ứng dụng
    downloadBlob(new Blob([parts.join("\n\n")], { type: "text/markdown;charset=utf-8" }), "Goi_NotebookLM.md");
  }

  const toggle = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader icon={<NotebookPen className="size-6" />} title="Chọn nội dung đưa sang NotebookLM" subtitle="NotebookLM chưa cho ứng dụng khác tạo sổ tự động, nên Bé Bảng gói sẵn để thầy cô tải lên một lần" />
        <div className="space-y-4 p-5">
          <fieldset>
            <legend className="font-semibold">Giáo án đã soạn</legend>
            {lessons.length === 0 && <p className="text-ink-muted">Chưa có giáo án nào.</p>}
            {lessons.map((l) => (
              <label key={l.id} className="flex min-h-11 items-center gap-3">
                <input type="checkbox" className="size-5" checked={pickLessons.includes(l.id)} onChange={() => toggle(pickLessons, setPickLessons, l.id)} />
                {l.title} <span className="text-sm text-ink-muted">lớp {l.request.className}</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend className="font-semibold">Tài liệu trong kho</legend>
            {docs.length === 0 && <p className="text-ink-muted">Chưa có tài liệu nào.</p>}
            {docs.map((d) => (
              <label key={d.id} className="flex min-h-11 items-center gap-3">
                <input type="checkbox" className="size-5" checked={pickDocs.includes(d.id)} onChange={() => toggle(pickDocs, setPickDocs, d.id)} />
                {d.name}
              </label>
            ))}
          </fieldset>
          <Button className="w-full" onClick={buildPack} disabled={!pickDocs.length && !pickLessons.length}>
            <Download className="size-5" aria-hidden /> Tải gói cho NotebookLM
          </Button>
          <p className="text-sm text-ink-muted">Gói không chứa tên, sức khỏe hay tâm lý của học sinh.</p>
        </div>
      </Card>
      <Card>
        <CardHeader title="Làm theo các bước" subtitle={`Tên nút trên NotebookLM có thể đổi chút, ${h} tìm chữ gần giống là được`} />
        <ol className="space-y-3 p-5 pt-3">
          {NLM_STEPS.map((s, i) => (
            <li key={s} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-fg">{i + 1}</span>
              <p className="pt-1.5 text-lg leading-relaxed">{s}</p>
            </li>
          ))}
        </ol>
        <div className="px-5 pb-5">
          <Button variant="ghost" size="sm" onClick={() => speakVi(NLM_STEPS.map((s, i) => `Bước ${i + 1}. ${s}`).join(" "))}>
            <Volume2 className="size-5" aria-hidden /> Đọc to các bước
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function KnowledgeView() {
  const [tab, setTab] = useState<Tab>("thu-vien");
  const tabs: { id: Tab; label: string }[] = [
    { id: "thu-vien", label: "Thư viện chung" },
    { id: "tai-lieu", label: "Tài liệu của tôi" },
    { id: "hoc-sinh", label: "Học sinh" },
    { id: "notebooklm", label: "Sang NotebookLM" },
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Kho Dữ Liệu</h1>
      <div role="tablist" aria-label="Phần của kho" className="flex gap-1 overflow-x-auto rounded-xl bg-surface-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn("min-h-11 shrink-0 rounded-lg px-4 font-semibold", tab === t.id ? "bg-surface text-primary shadow-[var(--shadow-card)]" : "text-ink-muted hover:text-ink")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "tai-lieu" && <DocsTab />}
      {tab === "thu-vien" && <SharedLibrary />}
      {tab === "hoc-sinh" && <StudentsTab />}
      {tab === "notebooklm" && <NotebookTab />}
    </div>
  );
}
