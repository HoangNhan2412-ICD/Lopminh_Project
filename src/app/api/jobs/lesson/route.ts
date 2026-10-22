import { after } from "next/server";
import { z } from "zod";
import { authenticatedSupabase } from "@/lib/supabase/server";
import { generateLesson, parseLessonInput } from "@/lib/lesson/generate-server";
import { JOB_TIMEOUT_MS } from "@/lib/jobs/types";
import type { LessonPlan } from "@/lib/lesson/types";
export const maxDuration = 270;
const metaSchema = z.object({ requestId: z.uuid(), lessonId: z.string().min(1).max(120), theme: z.enum(["bang-xanh", "giay-kem", "tuoi-sang"]), tiers: z.object({ coBan: z.array(z.string()).max(100), nangCao: z.array(z.string()).max(100) }) });
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
async function expire(session: NonNullable<Awaited<ReturnType<typeof authenticatedSupabase>>>) {
  await session.client.from("jobs").update({ status: "loi", error: "Lần soạn đã quá thời gian chờ. Hãy tạo lại yêu cầu.", step: "Cần thử lại", updated_at: new Date().toISOString() }).eq("user_id", session.userId).in("status", ["cho", "dang-chay"]).lt("created_at", new Date(Date.now() - JOB_TIMEOUT_MS).toISOString());
}
export async function GET(req: Request) {
  const session = await authenticatedSupabase(); if (!session) return json({ error: "Cần đăng nhập để xem bài đang soạn." }, 401);
  await expire(session);
  const profileId = new URL(req.url).searchParams.get("profileId") ?? "";
  const { data, error } = await session.client.from("jobs").select("id,profile_id,status,progress,step,result,error,created_at").eq("user_id", session.userId).eq("profile_id", profileId).order("created_at", { ascending: false }).limit(10);
  return error ? json({ error: "Chưa đọc được bài đang soạn." }, 503) : json({ jobs: data });
}
export async function POST(req: Request) {
  const session = await authenticatedSupabase(); if (!session) return json({ error: "Cần đăng nhập để soạn bài chạy nền." }, 401);
  const raw = await req.json().catch(() => null);
  let input, meta;
  try { input = parseLessonInput(raw?.input); meta = metaSchema.parse(raw?.meta); }
  catch { return json({ error: "Yêu cầu soạn bài chưa hợp lệ." }, 400); }
  const { data: profiles } = await session.client.from("app_state").select("value").eq("user_id", session.userId).eq("key", "lm:profiles").maybeSingle();
  if (!Array.isArray(profiles?.value) || !profiles.value.some(p => p.id === input.profile.id)) return json({ error: "Hồ sơ không thuộc tài khoản đang mở." }, 403);
  await expire(session);
  const { data: row, error } = await session.client.from("jobs").insert({ user_id: session.userId, profile_id: input.profile.id, request_id: meta.requestId, kind: "lesson" }).select("id").single();
  if (error || !row) {
    if (error?.code === "23505") {
      const { data: existing } = await session.client.from("jobs").select("id").eq("user_id", session.userId).eq("request_id", meta.requestId).maybeSingle();
      if (existing) return json({ jobId: existing.id }, 202);
      return json({ error: "Hồ sơ này đang có bài được soạn. Mở phần Bài đang soạn để theo dõi." }, 409);
    }
    return json({ error: "Chưa tạo được công việc. Hãy kiểm tra migration jobs." }, 503);
  }
  const jobId = row.id;
  const update = async (patch: object) => {
    const { error } = await session.client.from("jobs").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", jobId).eq("user_id", session.userId);
    if (error) throw Error("JOB_SAVE_FAILED");
  };
  after(async () => {
    try {
      await update({ status: "dang-chay", step: "Đọc yêu cầu soạn bài", progress: 5 });
      const generated = await generateLesson(input, (step, progress) => update({ step, progress }));
      const now = new Date().toISOString();
      const result: LessonPlan = { ...generated.plan, id: meta.lessonId, request: input.request, theme: meta.theme, tiers: meta.tiers, createdAt: now, updatedAt: now, mode: generated.mode };
      await update({ status: "xong", step: generated.mode === "ai" ? "Giáo án đã sẵn sàng" : "Giáo án khung đã sẵn sàng — cần bổ sung nội dung", progress: 100, result });
    } catch {
      try { await update({ status: "loi", step: "Cần thử lại", error: "Chưa soạn xong. Hãy kiểm tra kết nối và tạo lại yêu cầu." }); } catch { /* GET sẽ đánh dấu quá hạn; không log nội dung */ }
    }
  });
  return json({ jobId }, 202);
}
