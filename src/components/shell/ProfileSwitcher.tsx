"use client";

import Link from "next/link";
import { useAccount } from "@/components/account/AccountProvider";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/store/app-store";
import { addressOf, getHonorific } from "@/lib/persona/honorific";
import { cn } from "@/lib/text";

export function ProfileInitials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-personal font-semibold text-chalk",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/** Đổi hồ sơ giáo viên (chế độ demo). Khi có đăng nhập thật, đây là chỗ đổi tài khoản. */
export function ProfileSwitcher() {
  const { profile, profiles, switchProfile } = useApp();
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div data-tour="profile" className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Hồ sơ: ${addressOf(profile)}`}
        className="flex min-h-11 items-center gap-2.5 rounded-xl border border-border bg-surface py-1.5 pl-1.5 pr-1.5 sm:pr-3 hover:bg-surface-muted"
      >
        <ProfileInitials name={profile.callName} className="size-9 text-sm" />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight">{addressOf(profile)}</span>
          <span className="block text-xs text-ink-muted">Đổi hồ sơ</span>
        </span>
        <ChevronDown className="hidden size-4 text-ink-muted sm:block" aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-border bg-surface p-2 shadow-lg">
          <p className="px-3 pb-2 pt-1 text-sm font-medium text-ink-muted">{account.userId ? "Hồ sơ trong tài khoản" : "Hồ sơ giáo viên mẫu"}</p>
          <Link href="/tai-khoan" className="mb-2 flex min-h-11 items-center rounded-lg border border-border px-3" onClick={() => setOpen(false)}>{account.userId ? "Quản lý tài khoản" : "Đăng nhập / Tài khoản"}</Link>
          {profiles.map((p) => {
            const active = p.id === profile.id;
            return (
              <button
                key={p.id}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setOpen(false);
                  if (active) return;
                  switchProfile(p.id);
                  toast.success(`Đã chuyển sang hồ sơ ${addressOf(p)}`, { description: p.school });
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-muted",
                  active && "bg-primary-soft",
                )}
              >
                <span className="inline-flex min-w-12 justify-center rounded-md bg-surface-muted px-2 py-1 text-xs font-semibold text-ink">
                  {getHonorific(p)}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{p.fullName}</span>
                  <span className="block text-sm text-ink-muted">
                    {p.subject} · {p.school.split(",")[0]}
                  </span>
                </span>
                {active && <Check className="size-5 text-primary" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
