"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";
let client: ReturnType<typeof createBrowserClient> | null = null;
export function browserSupabase() {
  const config = supabaseConfig();
  if (!config) return null;
  return client ??= createBrowserClient(config.url, config.key);
}
