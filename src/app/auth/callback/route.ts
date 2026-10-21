import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  const client = await serverSupabase();
  if (client && code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/tai-khoan", req.url));
  }
  return NextResponse.redirect(new URL("/tai-khoan?loi=dang-nhap", req.url));
}
