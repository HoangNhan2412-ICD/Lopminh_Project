import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { authenticatedSupabase } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
const validName = (name: string) => /^fileSearchStores\/[a-zA-Z0-9_-]+$/.test(name);
function signature(name: string, userId: string) {
  const secret = process.env.GEMINI_API_KEY;
  if (!secret) throw Error("NO_KEY");
  return createHmac("sha256", secret).update(`lopminh-store-v1:${userId}:${name}`).digest("hex");
}
/** Tên kho đi kèm chữ ký gắn với tài khoản, không cho tự gán kho của người khác. */
export async function privateStoreName(token?: string | null) {
  if (!token) return null;
  if (!supabaseConfig()) return validName(token) ? token : null;
  const session = await authenticatedSupabase(); if (!session) return null;
  const [name, proof, extra] = token.split(".");
  if (!validName(name) || !/^[a-f0-9]{64}$/.test(proof ?? "") || extra) return null;
  return timingSafeEqual(Buffer.from(proof), Buffer.from(signature(name, session.userId))) ? name : null;
}
export async function signedStoreName(name: string) {
  if (!supabaseConfig()) return name;
  const session = await authenticatedSupabase(); if (!session) throw Error("AUTH_REQUIRED");
  return `${name}.${signature(name, session.userId)}`;
}
/** Chỉ nhận tên kho, không nhận URL tùy ý. Kho chung do quản trị cấu hình. */
export async function searchStores(privateStore?: string | null) {
  return [...new Set([process.env.GEMINI_SHARED_STORE, await privateStoreName(privateStore)].filter((s): s is string => Boolean(s && validName(s))))];
}
