"use client";
import { useAccount } from "./AccountProvider";
export function AccountView() {
  const account = useAccount();
  return <section className="mx-auto max-w-xl space-y-4 rounded-2xl border border-border bg-surface p-5"><h1 className="text-2xl font-bold">Tài khoản</h1><p>{!account.configured ? "Đang dùng demo trên máy này. Chưa cấu hình Supabase nên chưa bật đăng nhập Google." : account.userId ? "Đã đăng nhập. Dữ liệu được lưu riêng trong tài khoản này." : "Đăng nhập Google để lưu dữ liệu và mở lại trên máy khác."}</p>{account.configured && <button className="min-h-11 rounded-xl bg-primary px-5 py-3 text-primary-fg" onClick={account.userId ? account.logout : account.login}>{account.userId ? "Đăng xuất" : "Đăng nhập Google"}</button>}<p className="text-ink-muted">Đăng nhập chỉ dùng thông tin hồ sơ cơ bản. Kết nối Gmail là bước riêng, hiện chưa bật.</p></section>;
}
