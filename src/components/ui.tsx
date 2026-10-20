import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/text";

type Variant = "primary" | "secondary" | "ghost";

/** Lớp CSS của nút, dùng chung cho <button> và <Link> trông như nút. */
export function buttonCls(variant: Variant = "primary", size: "md" | "sm" = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    size === "md" ? "min-h-11 px-5 text-base" : "min-h-11 px-3.5 text-sm",
    variant === "primary" && "bg-primary text-primary-fg hover:bg-primary-hover",
    variant === "secondary" && "border border-border bg-surface text-ink hover:bg-surface-muted",
    variant === "ghost" && "text-primary hover:bg-primary-soft",
    extra,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "md" | "sm" }) {
  return (
    <button
      {...props}
      className={buttonCls(variant, size, className)}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]", className)}
    />
  );
}

export function CardHeader({ title, subtitle, icon, action }: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 text-primary">{icon}</div>}
        <div>
          <h2 className="text-lg font-semibold leading-snug">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export type Tone = "neutral" | "urgent" | "homeroom" | "subject" | "success" | "accent" | "primary";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink",
  urgent: "bg-urgent-soft text-urgent",
  homeroom: "bg-homeroom-soft text-homeroom",
  subject: "bg-subject-soft text-subject",
  success: "bg-success-soft text-success",
  accent: "bg-accent-soft text-ink",
  primary: "bg-primary-soft text-primary",
};

export function Chip({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium", TONES[tone], className)}>
      {children}
    </span>
  );
}
