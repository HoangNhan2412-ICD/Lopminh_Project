"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BeBangAvatar } from "@/components/BeBangAvatar";
import { FontScaleToggle } from "@/components/shell/FontScaleToggle";
import { ProfileInitials, ProfileSwitcher } from "@/components/shell/ProfileSwitcher";
import { NAV, groupOf } from "@/lib/nav";
import { addressOf } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { cn } from "@/lib/text";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Sidebar() {
  const pathname = usePathname();
  const { profile } = useApp();
  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <Link href="/" className="flex items-center gap-3 px-5 py-5">
        <BeBangAvatar size={44} />
        <span>
          <span className="block text-xl font-bold leading-tight text-primary">Lớp Mình</span>
          <span className="block text-sm text-ink-muted">cùng Bé Bảng</span>
        </span>
      </Link>

      <nav aria-label="Điều hướng chính" className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.id} className="mt-4 first:mt-1">
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium transition-colors",
                        active ? "bg-primary text-primary-fg" : "text-ink hover:bg-surface-muted",
                      )}
                    >
                      <Icon className="size-5 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Link
        href="/ho-so"
        className={cn(
          "m-3 flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-surface-muted",
          pathname.startsWith("/ho-so") && "border-personal bg-surface-muted",
        )}
      >
        <ProfileInitials name={profile.callName} />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{addressOf(profile)}</span>
          <span className="block truncate text-sm text-ink-muted">Hồ sơ thấu hiểu bản thân</span>
        </span>
      </Link>
    </aside>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const current = groupOf(pathname);
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV.map((g) => {
          const Icon = g.items[0].icon;
          const active = g.id === current.id && !pathname.startsWith("/ho-so");
          return (
            <li key={g.id}>
              <Link
                href={g.items[0].href}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-medium",
                  active ? "text-primary" : "text-ink-muted",
                )}
              >
                <Icon className="size-6" aria-hidden />
                {g.short}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href="/ho-so"
            className={cn(
              "flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-medium",
              pathname.startsWith("/ho-so") ? "text-primary" : "text-ink-muted",
            )}
          >
            <BeBangAvatar size={26} />
            Hồ sơ
          </Link>
        </li>
      </ul>
    </nav>
  );
}

/** Trên điện thoại: hàng mục con của trụ cột đang mở. */
function MobileSubNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/ho-so")) return null;
  const group = groupOf(pathname);
  return (
    <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
      {group.items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium",
            isActive(pathname, item.href)
              ? "border-primary bg-primary text-primary-fg"
              : "border-border bg-surface text-ink",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, profile } = useApp();

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur sm:px-6">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <BeBangAvatar size={36} />
            <span className="text-lg font-bold text-primary">Lớp Mình</span>
          </Link>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <FontScaleToggle />
            <ProfileSwitcher />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-10">
          <MobileSubNav />
          {ready ? (
            // key theo hồ sơ: đổi hồ sơ là dựng lại toàn bộ trang, không sót state của người trước.
            <div key={profile.id}>{children}</div>
          ) : (
            <div className="flex items-center gap-3 py-16 text-ink-muted" aria-live="polite">
              <BeBangAvatar size={40} mood="nghi" />
              Bé Bảng đang mở sổ…
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
