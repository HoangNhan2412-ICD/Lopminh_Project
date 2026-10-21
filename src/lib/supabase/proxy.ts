import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "./config";

/** Chạy sau cổng mật khẩu. Cookie mới phải đi cả xuống server lẫn về trình duyệt. */
export async function refreshSupabase(req: NextRequest) {
  const config = supabaseConfig();
  if (!config) return NextResponse.next();
  let response = NextResponse.next({ request: req });
  const client = createServerClient(config.url, config.key, { cookies: {
    getAll: () => req.cookies.getAll(),
    setAll: values => {
      values.forEach(({ name, value }) => req.cookies.set(name, value));
      response = NextResponse.next({ request: req });
      values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    },
  } });
  try {
    const { data, error } = await client.auth.getClaims();
    const path = req.nextUrl.pathname;
    // Dữ liệu được RLS bảo vệ. Các API AI cũng cần phiên khi đã cấu hình đăng nhập.
    if (path.startsWith("/api/") && !["/api/gate", "/api/health"].includes(path) && (error || !data?.claims)) {
      const denied = NextResponse.json({ error: "Cần đăng nhập Google để dùng chức năng này." }, { status: 401 });
      response.cookies.getAll().forEach(c => denied.cookies.set(c));
      return denied;
    }
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    if (req.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "Chưa xác minh được phiên đăng nhập. Hãy thử lại." }, { status: 503 });
    return response;
  }
}
