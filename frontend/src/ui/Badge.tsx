import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "waiting" | "motion" | "settled" | "blocked" | "neutral";
  glow?: boolean;
}

export function Badge({ className, variant = "neutral", glow = false, ...props }: BadgeProps) {
  const variantStyles = {
    waiting:
      "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/25",
    motion:
      "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/25",
    settled:
      "bg-[var(--color-settled)]/10 text-[var(--color-settled)] border-[var(--color-settled)]/25",
    blocked:
      "bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/25",
    neutral:
      "bg-[var(--surface-hover)] text-[var(--surface-muted)] border-[var(--surface-border)]",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium font-sans select-none transition-colors duration-200",
        variantStyles[variant],
        glow && "animate-glow-pulse",
        className,
      )}
      {...props}
    />
  );
}
