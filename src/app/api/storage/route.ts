import { z } from "zod";
import { authenticatedSupabase } from "@/lib/supabase/server";
import { profileInput, stateKey } from "@/lib/storage/schema";
import { nfc } from "@/lib/text";

const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
const denied = () => json({ error: "Cần đăng nhập để mở dữ liệu tài khoản." }, 401);
async function input(req: Request) {
  const body = await req.text();
  if (new TextEncoder().encode(body).length > 3_500_000) return null;
  try { return JSON.parse(nfc(body)); } catch { return null; }
}
export async function GET() {
  const session = await authenticatedSupabase(); if (!session) return denied();
  const state: Record<string, unknown> = {};
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await session.client.from("app_state").select("key,value").eq("user_id", session.userId).order("key").range(offset, offset + 499);
    if (error) return json({ error: "Chưa mở được dữ liệu. Hãy kiểm tra migration và thử lại." }, 503);
    for (const row of data ?? []) state[row.key] = row.value;
    if ((data?.length ?? 0) < 500) break;
  }
  return json({ userId: session.userId, state });
}
export async function PUT(req: Request) {
  const session = await authenticatedSupabase(); if (!session) return denied();
  const parsed = z.object({ userId: z.string(), key: stateKey, value: z.unknown() }).safeParse(await input(req));
  if (!parsed.success || parsed.data.userId !== session.userId) return json({ error: "Dữ liệu hoặc tài khoản không khớp." }, 400);
  const { key, value } = parsed.data;
  if (key === "lm:account-setup") return json({ error: "Không thể đổi trạng thái khởi tạo ở đây." }, 400);
  if (key === "lm:profiles") {
    const profiles = z.array(profileInput).min(1).max(30).safeParse(value);
    if (!profiles.success || !profiles.data.some(p => p.id === session.userId)) return json({ error: "Hồ sơ chưa hợp lệ." }, 400);
    const { error } = await session.client.rpc("save_app_profiles", { p_profiles: profiles.data });
    return error ? json({ error: "Chưa lưu được hồ sơ." }, 503) : json({ ok: true });
  }
  const { error } = await session.client.from("app_state").upsert({ user_id: session.userId, key, value, updated_at: new Date().toISOString() });
  return error ? json({ error: "Chưa lưu được dữ liệu." }, 503) : json({ ok: true });
}
export async function DELETE(req: Request) {
  const session = await authenticatedSupabase(); if (!session) return denied();
  const parsed = z.object({ userId: z.string(), keys: z.array(stateKey).min(1).max(30) }).safeParse(await input(req));
  if (!parsed.success || parsed.data.userId !== session.userId || parsed.data.keys.some(k => !/^lm:chat(mem)?:/.test(k))) return json({ error: "Yêu cầu xóa không hợp lệ." }, 400);
  const { error } = await session.client.from("app_state").delete().eq("user_id", session.userId).in("key", parsed.data.keys);
  return error ? json({ error: "Chưa xóa được trên server, hãy thử lại." }, 503) : json({ ok: true });
}
export async function POST(req: Request) {
  const session = await authenticatedSupabase(); if (!session) return denied();
  const parsed = z.object({ profile: profileInput, state: z.record(stateKey, z.unknown()) }).safeParse(await input(req));
  if (!parsed.success || parsed.data.profile.id !== session.userId) return json({ error: "Hồ sơ khởi tạo chưa hợp lệ hoặc dữ liệu quá lớn." }, 400);
  const profiles = z.array(profileInput).min(1).max(30).safeParse(parsed.data.state["lm:profiles"]);
  if (!profiles.success || !profiles.data.some(p => p.id === session.userId)) return json({ error: "Thiếu hồ sơ tài khoản." }, 400);
  parsed.data.state["lm:profiles"] = [parsed.data.profile, ...profiles.data.filter(p => p.id !== session.userId)];
  parsed.data.state["lm:current"] = session.userId;
  const { error } = await session.client.rpc("initialize_account", { p_profile: parsed.data.profile, p_state: parsed.data.state });
  return error ? json({ error: "Chưa khởi tạo được tài khoản, hoặc tài khoản đã có dữ liệu. Hãy tải lại để kiểm tra." }, 409) : json({ ok: true });
}
