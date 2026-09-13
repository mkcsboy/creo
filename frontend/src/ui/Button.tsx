import { clsx } from "clsx";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  pill?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      pill = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] min-w-[44px] transition-all duration-200 ease-out active:scale-[0.97]";

    const radiusStyle = pill ? "rounded-full" : "rounded-xl";

    const variantStyles = {
      primary:
        "bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 shadow-sm hover:shadow-md font-semibold shimmer-btn",
      secondary:
        "bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--surface-hover)] font-medium shadow-sm",
      ghost:
        "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]",
      destructive:
        "bg-[var(--destructive)] text-white hover:brightness-110 shadow-sm font-semibold",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-7 py-3 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, radiusStyle, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
