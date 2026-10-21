import { GATE_COOKIE, gateToken, safeEqual } from "@/lib/gate";

export async function POST(req: Request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return Response.json({ ok: true });
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const given = String(body?.password ?? "").normalize("NFC").trim();
  // Chậm lại một chút để đoán mật khẩu bằng máy tốn công hơn
  await new Promise((r) => setTimeout(r, 400));
  if (!given || !safeEqual(await gateToken(given), await gateToken(password))) {
    return Response.json({ error: "Mật khẩu chưa đúng." }, { status: 401 });
  }
  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${GATE_COOKIE}=${await gateToken(password)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return res;
}
