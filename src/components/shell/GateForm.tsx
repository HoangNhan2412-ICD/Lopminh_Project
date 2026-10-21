"use client";

import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BeBangAvatar } from "@/components/BeBangAvatar";

/** Trang nhập mật khẩu chung của bản chạy thử. Thay bằng đăng nhập Google khi nối Supabase. */
export function GateForm() {
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/gate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) {
      const next = params.get("tiep");
      window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      return;
    }
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setError(data?.error ?? "Chưa vào được, mình thử lại nhé.");
    setBusy(false);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <form onSubmit={submit} className="chalkboard w-full max-w-md overflow-hidden rounded-[var(--radius-card)] p-7 pb-10 shadow-[var(--shadow-card)]">
        <BeBangAvatar size={64} />
        <h1 className="mt-4 text-2xl font-semibold">Lớp Mình đang chạy thử</h1>
        <p className="mt-1 text-chalk/80">Nhập mật khẩu nhóm đã gửi cho mình để vào.</p>
        <label className="mt-5 block">
          <span className="sr-only">Mật khẩu</span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-chalk/30 bg-white/10 px-4 text-lg text-chalk placeholder:text-chalk/50 focus:border-accent focus:outline-none"
            placeholder="Mật khẩu"
          />
        </label>
        {error && <p className="mt-2 text-accent" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-lg font-semibold text-ink disabled:opacity-60"
        >
          {busy && <LoaderCircle className="size-5 animate-spin" aria-hidden />} Vào Lớp Mình
        </button>
        <div className="chalk-tray" aria-hidden />
      </form>
    </div>
  );
}
