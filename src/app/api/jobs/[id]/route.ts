import { authenticatedSupabase } from "@/lib/supabase/server";
import { jobExpired } from "@/lib/jobs/types";
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await authenticatedSupabase();
  if (!session) return Response.json({ error: "Cần đăng nhập." }, { status: 401 });
  const { id } = await ctx.params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) return Response.json({ error: "Mã công việc chưa hợp lệ." }, { status: 400 });
  const { data, error } = await session.client.from("jobs").select("id,profile_id,status,progress,step,result,error,created_at").eq("user_id", session.userId).eq("id", id).maybeSingle();
  if (error || !data) return Response.json({ error: "Không tìm thấy công việc trong tài khoản này." }, { status: 404 });
  if (jobExpired(data)) {
    data.status = "loi"; data.error = "Lần soạn đã quá thời gian chờ. Hãy tạo lại yêu cầu.";
    await session.client.from("jobs").update({ status: data.status, error: data.error, step: "Cần thử lại" }).eq("id", id).eq("user_id", session.userId);
  }
  return Response.json(data, { headers: { "Cache-Control": "private, no-store" } });
}
