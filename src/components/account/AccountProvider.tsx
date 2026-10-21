"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session as SupabaseSession } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { browserSupabase } from "@/lib/supabase/client";
import { supabaseConfig } from "@/lib/supabase/config";
import { storage, useStorageError } from "@/lib/local-store";
import { AppStoreProvider } from "@/lib/store/app-store";
import { AccountSetup } from "./AccountSetup";

type Session = { id: string | null; status: "loading" | "demo" | "setup" | "ready" | "error"; version: number };
const Context = createContext<{ userId: string | null; configured: boolean; login: () => Promise<void>; logout: () => Promise<void>; reload: () => Promise<void> }>({ userId: null, configured: false, login: async () => {}, logout: async () => {}, reload: async () => {} });
export const useAccount = () => useContext(Context);

export function AccountProvider({ children }: { children: ReactNode }) {
  const configured = !!supabaseConfig();
  const gate = usePathname() === "/dang-nhap";
  const [session, setSession] = useState<Session>({ id: null, status: configured ? "loading" : "demo", version: 0 });
  const [message, setMessage] = useState("");
  const serial = useRef(0);
  const activeId = useRef<string | null>(null);
  const unsaved = useStorageError();
  const load = useCallback(async () => {
    const client = browserSupabase(); if (!client) return;
    const turn = ++serial.current;
    setSession(s => ({ ...s, status: "loading" }));
    // Chặn kết quả async của phiên cũ ngay khi bắt đầu đổi tài khoản.
    storage.activate({}, { save: async () => { throw Error("NOT_READY"); }, remove: async () => { throw Error("NOT_READY"); } });
    try {
      const { data, error } = await client.auth.getUser();
      if (turn !== serial.current) return;
      if (error && error.name !== "AuthSessionMissingError") throw Error("AUTH_UNAVAILABLE");
      if (!data.user) {
        activeId.current = null; storage.activate(null, null);
        setSession({ id: null, status: "demo", version: turn }); return;
      }
      const userId = data.user.id;
      const response = await fetch("/api/storage", { cache: "no-store", signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw Error("STORAGE_UNAVAILABLE");
      const result = await response.json();
      if (result.userId !== userId || turn !== serial.current) return;
      activeId.current = userId;
      if (!result.state["lm:account-setup"]) { setSession({ id: userId, status: "setup", version: turn }); return; }
      const mutate = async (method: "PUT" | "DELETE", body: object) => {
        const res = await fetch("/api/storage", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, userId }), signal: AbortSignal.timeout(25_000) });
        if (!res.ok) throw Error("SAVE_FAILED");
      };
      storage.activate(result.state, { save: (key, value) => mutate("PUT", { key, value }), remove: keys => mutate("DELETE", { keys }) });
      setSession({ id: userId, status: "ready", version: turn });
    } catch {
      if (turn === serial.current) { activeId.current = null; setSession({ id: null, status: "error", version: turn }); }
    }
  }, []);
  useEffect(() => {
    if (!configured || gate) return;
    const client = browserSupabase()!;
    let alive = true;
    const timer = setTimeout(() => { void load(); }, 0);
    const { data } = client.auth.onAuthStateChange((event: AuthChangeEvent, next: SupabaseSession | null) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      if (event === "SIGNED_OUT" || next?.user.id !== activeId.current) setTimeout(() => { if (alive) void load(); }, 0);
    });
    // serial là số phiên async, không phải DOM ref; tăng khi cleanup để hủy kết quả cũ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { alive = false; clearTimeout(timer); data.subscription.unsubscribe(); serial.current++; };
  }, [configured, gate, load]);
  useEffect(() => {
    if (!configured) return;
    const warn = (e: BeforeUnloadEvent) => { if (storage.unsaved || storage.pending) { e.preventDefault(); e.returnValue = ""; } };
    const retry = () => { void storage.flush(); };
    window.addEventListener("beforeunload", warn); window.addEventListener("online", retry);
    return () => { window.removeEventListener("beforeunload", warn); window.removeEventListener("online", retry); };
  }, [configured]);
  const login = async () => {
    setMessage("");
    const client = browserSupabase(); if (!client) return;
    await storage.flush();
    const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback`, queryParams: { prompt: "select_account" } } });
    if (error) setMessage("Chưa mở được đăng nhập Google. Hãy thử lại.");
  };
  const logout = async () => {
    await storage.flush();
    if (storage.unsaved) { setMessage("Còn dữ liệu chưa lưu. Hãy thử lưu lại trước khi đăng xuất."); return; }
    const { error } = await browserSupabase()!.auth.signOut();
    if (error) { setMessage("Chưa đăng xuất được. Hãy kiểm tra mạng."); return; }
    await load();
  };
  const account = { userId: session.id, configured, login, logout, reload: load };
  if (!gate && (session.status === "loading" || session.status === "error")) return <div className="mx-auto max-w-xl space-y-4 p-6"><p role="status">{session.status === "loading" ? "Đang mở dữ liệu tài khoản…" : "Chưa mở được dữ liệu tài khoản. Hãy kiểm tra kết nối và cấu hình Supabase."}</p>{session.status === "error" && <button className="min-h-11 rounded-xl border border-border p-3" onClick={load}>Thử lại</button>}</div>;
  return <Context.Provider value={account}>
    {message && <p role="alert" className="bg-urgent-soft p-3 text-urgent">{message}</p>}
    {unsaved && <div role="alert" className="bg-urgent-soft p-3 text-urgent">Có dữ liệu chưa lưu. Giữ trang này mở và kiểm tra mạng hoặc dung lượng.<button className="ml-3 min-h-11 rounded-xl border border-border px-3" onClick={() => storage.flush()}>Thử lưu lại</button></div>}
    {!gate && session.status === "setup" ? <AccountSetup userId={session.id!} onDone={load} /> : <AppStoreProvider key={`${session.id ?? "demo"}-${session.version}`}>{children}</AppStoreProvider>}
  </Context.Provider>;
}
