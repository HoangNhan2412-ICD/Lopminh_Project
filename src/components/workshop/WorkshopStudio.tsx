"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Download, FileOutput, LoaderCircle, Mic, RefreshCw } from "lucide-react";
import { useApp } from "@/lib/store/app-store";
import { useLessons } from "@/lib/lesson/store";
import { useSpeechToText } from "@/lib/hooks";
import { addressOf } from "@/lib/persona/honorific";
import { nfc } from "@/lib/text";
import { lessonPlanSchema, type LessonPlan, type LessonRequest } from "@/lib/lesson/types";
import { fallbackPlan, polishPlan } from "@/lib/lesson/build";
import { TextbookPicker } from "@/components/lesson/TextbookPicker";
import { SlideCanvas } from "@/components/lesson/SlideCanvas";
import { THEMES } from "@/lib/lesson/theme";
import { EXAMPLE_GRAPH, validateGraph, type Graph } from "@/lib/workshop/graph";
import { OUTPUTS, assertShareable, exportWorkshop, fileStem, lessonVisual, visualSlide, type Artifact, type OutputKind } from "@/lib/workshop/export";
import { runQueue, type QueueState, type Work } from "@/lib/workshop/queue";
import { downloadBlob } from "@/lib/quiz/export";
import type { WorkshopVisual } from "@/lib/workshop/visual";
import { GraphEditor } from "./GraphEditor";

const input = "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-border bg-surface p-3";
const button = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 font-semibold disabled:opacity-50";
const EXAMPLE = "Đồ thị li độ theo thời gian của dao động điều hòa, A = 5 cm, T = 2 s";
export function WorkshopStudio() {
  const { profile, classes, students } = useApp();
  const [lessons] = useLessons(profile.id);
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const cls = classes.find(c => c.id === classId) ?? classes[0];
  const grade = cls?.name.match(/\d+/)?.[0] ?? "9";
  const [topic, setTopic] = useState("");
  const [request, setRequest] = useState("");
  const [textbook, setTextbook] = useState<LessonRequest["textbook"]>();
  const [minutes, setMinutes] = useState(45);
  const [lessonId, setLessonId] = useState("");
  const [selected, setSelected] = useState<OutputKind[]>(["docx", "pptx", "worksheet", "mindmap"]);
  const [graph, setGraph] = useState<Graph>(EXAMPLE_GRAPH);
  const graphRef = useRef<Graph>(EXAMPLE_GRAPH);
  const [graphManual, setGraphManual] = useState(false);
  const [graphAccepted, setGraphAccepted] = useState(false);
  const [reading, setReading] = useState(false);
  const [rows, setRows] = useState<Record<string, QueueState<Artifact[]>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("");
  const [previews, setPreviews] = useState<WorkshopVisual[]>([]);
  const jobs = useRef<Work<Artifact[]>[]>([]);
  const controller = useRef<AbortController | null>(null);
  const speech = useSpeechToText(text => { setRequest(old => nfc(`${old} ${text}`).trim()); setGraphAccepted(false); });
  useEffect(() => () => controller.current?.abort(), []);
  const update = (id: string, state: QueueState<Artifact[]>) => setRows(old => ({ ...old, [id]: state }));
  const needsGraph = selected.includes("graph");
  async function readGraph() {
    setReading(true); setError("");
    try {
      assertShareable(request, students.map(s => s.fullName));
      const res = await fetch("/api/workshop/graph", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: nfc(request) }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Chưa đọc được yêu cầu."); return; }
      const next = validateGraph(data.graph); setGraph(next); graphRef.current = next; setGraphManual(true); setGraphAccepted(false);
      setPreviews([{ kind: "graph", graph: next }]);
    } catch { setError("Chưa đọc được đồ thị. Kiểm tra yêu cầu và nhập tham số bằng tay."); }
    finally { setReading(false); }
  }
  async function run() {
    setError("");
    if (!selected.length) { setError("Hãy chọn ít nhất một loại file."); return; }
    if (!cls || (!lessonId && topic.trim().length < 2)) { setError("Hãy chọn lớp và gõ tên bài ít nhất 2 ký tự."); return; }
    if (needsGraph && (!graphManual || !graphAccepted)) { setError("Đọc yêu cầu hoặc sửa tham số đồ thị, rồi xác nhận đã kiểm tra trước khi xuất."); return; }
    try { assertShareable(`${topic}\n${request}`, students.map(s => s.fullName)); }
    catch { setError("Yêu cầu có thông tin riêng của học sinh. Hãy chỉ nhập kiến thức và tên bài."); return; }
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setRows({}); setPreviews([]); setMode("");
    const r: LessonRequest = { topic: nfc(topic), wishes: nfc(request), subject: cls.subject || profile.subject, grade: `Lớp ${grade}`, classId: cls.id, className: cls.name, minutes, energy: "soi-noi", focus: "thao-luan", tone: "than-thien", textbook };
    let prepared: Promise<LessonPlan> | undefined;
    const getPlan = (): Promise<LessonPlan> => {
      if (!prepared) prepared = (async () => {
        let plan = lessons.find(l => l.id === lessonId);
        if (!plan) {
          const res = await fetch("/api/lesson/generate", { method: "POST", headers: { "Content-Type": "application/json" }, signal: abort.signal, body: JSON.stringify({ request: r, profile, context: "Chỉ soạn kiến thức bài học. Không tên hay dữ liệu riêng học sinh." }) });
          if (!res.ok) throw new Error("Chưa soạn được bài.");
          const data = await res.json();
          const content = lessonPlanSchema.parse(JSON.parse(nfc(JSON.stringify(data.plan))));
          plan = { ...content, id: crypto.randomUUID(), request: r, tiers: { coBan: [], nangCao: [] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), theme: "giay-kem", mode: data.mode };
        }
        const clean = { ...plan, tiers: { coBan: [], nangCao: [] } };
        assertShareable(JSON.stringify(clean), students.map(s => s.fullName));
        setMode(clean.mode === "ai" ? "Nội dung Gemini tạo — cần đọc lại trước khi dùng." : "Đang chạy thử: giáo án, phiếu và câu hỏi là khung mẫu, cần bổ sung kiến thức trước khi dạy. Đồ thị được tính từ tham số đã duyệt.");
        return clean;
      })().catch(err => { prepared = undefined; throw err; });
      return prepared;
    };
    const list = selected.map(id => ({ id, run: async (progress: (value: number) => void) => {
      if (abort.signal.aborted) throw new Error("Đã rời trang.");
      progress(5);
      const now = new Date().toISOString();
      const plan: LessonPlan = id === "graph" ? { ...polishPlan(fallbackPlan(r), r), id: "graph", request: r, tiers: { coBan: [], nangCao: [] }, createdAt: now, updatedAt: now, theme: "giay-kem", mode: "demo" } : await getPlan();
      const visuals: WorkshopVisual[] = [];
      // File không phụ thuộc đồ thị vẫn xuất được nếu tham số đồ thị sai.
      if ((id === "graph" || id === "pptx") && needsGraph) visuals.push({ kind: "graph", graph: validateGraph(graphRef.current) });
      if (id === "pptx" && selected.includes("mindmap")) visuals.push(lessonVisual(plan, "mindmap"));
      if (id === "pptx" && selected.includes("infographic")) visuals.push(lessonVisual(plan, "infographic"));
      if (id === "mindmap" || id === "infographic") visuals.push(lessonVisual(plan, id));
      if (visuals.length) setPreviews(old => [...old.filter(v => !visuals.some(x => x.kind === v.kind)), ...visuals]);
      return exportWorkshop(id, plan, profile, fileStem(grade, r.subject, plan.title), visuals, progress);
    } }));
    jobs.current = list;
    for (const job of list) update(job.id, { status: "cho", progress: 0 });
    await runQueue(list, update); setBusy(false);
  }
  async function retry(id: string) { if ((id === "graph" || id === "pptx") && needsGraph && !graphAccepted) { setError("Hãy xác nhận lại tham số đồ thị trước khi thử lại."); return; } const job = jobs.current.find(j => j.id === id); if (!job) return; setBusy(true); await runQueue([job], update); setBusy(false); }
  let graphError = "";
  try { validateGraph(graph); } catch (e) { graphError = (e as Error).message; }
  return <div className="mx-auto max-w-5xl space-y-6 pb-8">
    <div><h1 className="text-2xl font-bold">Xưởng học liệu</h1><p className="mt-2 text-ink-muted">{addressOf(profile)} nói cần gì, chọn file muốn nhận, Bé Bảng làm từng phần giúp mình.</p></div>
    <fieldset disabled={busy || reading} className="min-w-0 space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label>Lớp<select className={input} value={classId} onChange={e => { setClassId(e.target.value); setLessonId(""); setTextbook(undefined); }}>{classes.map(c => <option key={c.id} value={c.id}>{c.name} · {c.subject}</option>)}</select></label><label>Dùng giáo án đã soạn<select className={input} value={lessonId} onChange={e => setLessonId(e.target.value)}><option value="">Tạo từ yêu cầu mới</option>{lessons.filter(l => l.request.classId === cls?.id).map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label></div>
      {!lessonId && <><TextbookPicker key={classId} subject={cls?.subject || profile.subject} grade={Number(grade)} onPick={(bookId, lesson) => { setTextbook(lesson ? { bookId, lessonId: lesson.id } : undefined); if (lesson) { setTopic(lesson.ten); setMinutes(Math.min(180, lesson.soTietGoiY * 45)); } }} /><label className="block">Tên bài dạy<input className={input} value={topic} maxLength={300} onChange={e => { setTopic(nfc(e.target.value)); setTextbook(undefined); }} /></label></>}
      <label className="block">Mình cần học liệu gì?<textarea className={input} rows={4} value={request} maxLength={1500} placeholder="Ví dụ: làm đồ thị cho bài dao động điều hòa, A = 5 cm, T = 2 s" onChange={e => { setRequest(nfc(e.target.value)); setGraphAccepted(false); }} /></label>
      <div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={!speech.supported} onClick={speech.listening ? speech.stop : speech.start}><Mic className="size-5" aria-hidden />{speech.listening ? "Dừng micro" : "Nói yêu cầu"}</button><button type="button" className={button} onClick={() => { setTopic("Dao động điều hòa"); setRequest(EXAMPLE); setSelected(["graph", "pptx", "worksheet", "mindmap"]); setGraphAccepted(false); }}>Thử đồ thị dao động</button><button type="button" className={button} onClick={() => { setRequest(`Tạo sơ đồ tư duy và phiếu học tập hai tầng cho bài ${topic || "đang học"} môn ${cls?.subject || profile.subject}.`); setSelected(["mindmap", "worksheet"]); }}>Sơ đồ và phiếu học tập</button></div>
      {(speech.error || speech.interim) && <p role="status">{speech.error || speech.interim}</p>}
      <p className="text-ink-muted">Chỉ dùng kiến thức bài học; không nhập tên, sức khỏe hay tâm lý học sinh vào học liệu chia sẻ.</p>
      <fieldset><legend className="mb-3 font-semibold">Chọn thứ cần xuất</legend><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{OUTPUTS.map(o => <label key={o.id} className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-border p-3"><input type="checkbox" className="size-6 shrink-0 accent-primary" checked={selected.includes(o.id)} onChange={e => setSelected(old => e.target.checked ? [...old, o.id] : old.filter(x => x !== o.id))} /><FileOutput className="size-6 shrink-0 text-primary" aria-hidden /><span className="min-w-0"><span className="block font-semibold">{o.label}</span><span className="block text-sm text-ink-muted">{o.file}</span></span></label>)}</div></fieldset>
      <p className="text-sm text-ink-muted">Âm thanh 2–3 phút và video bài giảng: chưa bật, đang chờ duyệt chi phí. File nhập Wayground/Kahoot còn chờ đối chiếu mẫu chính thức.</p>
      {needsGraph && <div className="space-y-3"><button type="button" className={button} onClick={readGraph}><RefreshCw className="size-5" aria-hidden />Đọc yêu cầu đồ thị</button><GraphEditor key={`${graph.family}-${reading}`} graph={graph} onChange={g => { setGraph(g); graphRef.current = g; setGraphManual(true); setGraphAccepted(false); }} />{graphError && <p role="alert" className="text-urgent">{graphError}</p>}<label className="flex min-h-11 items-center gap-3"><input className="size-6" type="checkbox" disabled={!!graphError || !graphManual} checked={graphAccepted} onChange={e => setGraphAccepted(e.target.checked)} />Đã kiểm tra công thức, pha, đơn vị và khoảng vẽ</label></div>}
    </fieldset>
    {error && <p role="alert" className="rounded-xl bg-urgent-soft p-4 text-urgent">{error}</p>}
    <button type="button" className={`${button.replace("bg-surface", "bg-primary")} text-primary-fg`} disabled={busy || reading} onClick={run}>{busy ? <LoaderCircle className="size-5 animate-spin" /> : <FileOutput className="size-5" />}Bé Bảng làm giúp</button>
    <p className="text-sm text-ink-muted">Giữ trang này mở khi đang làm. File xong có thể tải ngay; rời trang sẽ mất các file chưa tải.</p>
    {mode && <p role="status" className="rounded-xl bg-primary-soft p-4">{mode}</p>}
    <div aria-live="polite" className="space-y-3">{Object.entries(rows).map(([id, row]) => <div key={id} data-output={id} className="rounded-xl border border-border bg-surface p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{OUTPUTS.find(o => o.id === id)?.label}</strong><span>{row.status === "xong" ? <><Check className="mr-1 inline size-5" />Xong</> : row.status === "loi" ? "Chưa xong" : row.status === "cho" ? "Đang chờ" : `Đang làm ${Math.round(row.progress)}%`}</span></div>{row.status === "dang-lam" && <progress className="mt-2 h-3 w-full accent-primary" max={100} value={row.progress} aria-label={`Tiến độ ${id}`} />}{row.message && <p className="my-2">{row.message}</p>}<div className="mt-3 flex flex-wrap gap-2">{row.result?.map(file => <button key={file.name} className={`${button} max-w-full break-all text-left`} onClick={() => downloadBlob(file.blob, file.name)}><Download className="size-5 shrink-0" aria-hidden />{file.name}</button>)}{row.status === "loi" && <button className={button} disabled={busy} onClick={() => retry(id)}><RefreshCw className="size-5" />Thử lại {OUTPUTS.find(o => o.id === id)?.label}</button>}</div></div>)}</div>
    {previews.length > 0 && <section className="space-y-4"><h2 className="text-xl font-bold">Xem trước học liệu trên slide</h2>{previews.map((v, i) => <SlideCanvas key={v.kind} slide={visualSlide(v)} theme={THEMES["giay-kem"]} index={i} total={previews.length} lessonTitle={topic} />)}</section>}
  </div>;
}
