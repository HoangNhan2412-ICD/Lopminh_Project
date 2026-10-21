import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, gateToken, safeEqual } from "@/lib/gate";
import { refreshSupabase } from "@/lib/supabase/proxy";

/** Chặn người lạ khi app chạy trên mạng mà chưa có đăng nhập thật (xem src/lib/gate.ts). */
export async function proxy(req: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return refreshSupabase(req);

  const { pathname, search } = req.nextUrl;
  if (pathname === "/dang-nhap" || pathname === "/api/gate") return NextResponse.next();

  const cookie = req.cookies.get(GATE_COOKIE)?.value ?? "";
  if (cookie && safeEqual(cookie, await gateToken(password))) return refreshSupabase(req);

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Cần nhập mật khẩu của Lớp Mình trước." }, { status: 401 });
  }
  const url = new URL("/dang-nhap", req.url);
  url.searchParams.set("tiep", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|webp|ico|woff2?)$).*)"],
};
