"use client";
import { useEffect, useRef } from "react";
import { useApp } from "@/lib/store/app-store";
import { useLessons } from "@/lib/lesson/store";
import { suggestTiers } from "@/lib/lesson/build";
import { syncAbsences } from "@/lib/workflows/engine";
import { useWorkflows } from "@/lib/workflows/store";
import { demoWorkflowDraft } from "@/lib/workflows/draft";
import { workflowDraftSchema } from "@/lib/workflows/templates";
import { vnNow } from "@/lib/time";

/** Luôn mounted theo hồ sơ: ghi chú giọng nói và điểm danh cùng mở một luồng. */
export function WorkflowSync() {
  const { profile, students, notes, today, timetable } = useApp();
  const [workflows, setWorkflows] = useWorkflows(profile.id);
  const [lessons] = useLessons(profile.id);
  const running = useRef(new Map<string, AbortController>());
  useEffect(() => {
    const requests = running.current;
    return () => { requests.forEach(c => c.abort()); requests.clear(); };
  }, []);
  useEffect(() => {
    if (!today) return;
    setWorkflows(all => syncAbsences(all, students, notes, today, Object.keys(timetable).map(Number)));
  }, [students, notes, today, timetable, setWorkflows]);

  useEffect(() => {
    for (const w of workflows) {
      if (w.closedAt || w.loai === "hoi-tham" || w.generation === "xong" || w.generation === "loi" || running.current.has(w.id)) continue;
      const lesson = lessons.find(l => w.lessonId ? l.id === w.lessonId : l.request.classId === w.classId && vnNow(new Date(l.createdAt)).date === vnNow(new Date(w.createdAt)).date);
      const topic = w.topic || lesson?.title;
      if (!topic) continue;
      const student = students.find(s => s.id === w.studentId);
      if (!student) continue;
      const advanced = suggestTiers([student], notes).nangCao.includes(student.id);
      const fallback = demoWorkflowDraft(topic, advanced, lesson);
      const controller = new AbortController();
      running.current.set(w.id, controller);
      setWorkflows(all => all.map(x => x.id === w.id ? { ...x, topic, lessonId: lesson?.id, generation: "dang-lam", draft: fallback, mode: "demo" } : x));
      // Chỉ nội dung bài học, không gửi ghi chú hay tên học sinh.
      let source = JSON.stringify({ topic, objectives: lesson?.objectives, activities: lesson?.activities.map(a => ({ goal: a.goal, content: a.content })), worksheet: fallback.worksheet });
      for (const s of students) for (const name of [s.fullName, s.shortName]) if (name) source = source.replaceAll(name, "học sinh");
      void fetch("/api/workflows/draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: source.slice(0, 16000), advanced }), signal: controller.signal })
        .then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error || "Chưa tạo được bản nháp."); return data; })
        .then(data => {
          if (controller.signal.aborted) return;
          const draft = data.mode === "ai" ? workflowDraftSchema.parse(data.draft) : fallback;
          setWorkflows(all => all.map(x => x.id === w.id && !x.closedAt ? { ...x, draft, mode: data.mode === "ai" ? "ai" : "demo", generation: "xong", error: undefined } : x));
        })
        .catch(() => { if (!controller.signal.aborted) setWorkflows(all => all.map(x => x.id === w.id ? { ...x, generation: "loi", error: "Chưa tạo được bản nháp AI. Khung mẫu vẫn còn; mình có thể thử lại." } : x)); })
        .finally(() => running.current.delete(w.id));
    }
  }, [workflows, lessons, students, notes, setWorkflows]);
  return null;
}
