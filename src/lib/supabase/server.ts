import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "./config";

/** Chỉ gọi trong Route Handler, nơi có thể cập nhật cookie refresh. */
export async function serverSupabase() {
  const config = supabaseConfig();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: { getAll: () => jar.getAll(), setAll: values => values.forEach(({ name, value, options }) => jar.set(name, value, options)) },
  });
}
export async function authenticatedSupabase() {
  const client = await serverSupabase();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  return error || !data.user ? null : { client, userId: data.user.id };
}
