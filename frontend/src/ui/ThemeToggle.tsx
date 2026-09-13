import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme-context";

interface ThemeToggleProps {
  size?: "sm" | "md";
  className?: string;
}

export function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const trackSize = size === "sm" ? "w-11 h-6" : "w-14 h-7";
  const thumbSize = size === "sm" ? "size-4" : "size-5";
  const thumbTranslate = size === "sm" ? "translate-x-5.5" : "translate-x-7.5";
  const iconSize = size === "sm" ? "size-3" : "size-3.5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      className={`
        group relative inline-flex shrink-0 cursor-pointer items-center
        ${trackSize} rounded-full p-0.5
        transition-colors duration-300 ease-in-out
        ${isDark
          ? "bg-[#2B7BC4]/30 ring-1 ring-[#2B7BC4]/40"
          : "bg-[#C9DFF0] ring-1 ring-[#C9DFF0]"
        }
        hover:ring-[#2B7BC4]/60
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] focus-visible:ring-offset-2
        ${className}
      `}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 flex items-center justify-center">
        <Sun
          className={`${iconSize} transition-all duration-300 ${
            isDark ? "text-[#6BAED6]/40 scale-75" : "text-[#D97706] scale-100"
          }`}
        />
      </span>
      <span className={`absolute ${size === "sm" ? "right-1.5" : "right-2"} flex items-center justify-center`}>
        <Moon
          className={`${iconSize} transition-all duration-300 ${
            isDark ? "text-[#E8F4FD] scale-100" : "text-[#6BAED6]/40 scale-75"
          }`}
        />
      </span>

      {/* Thumb */}
      <span
        className={`
          ${thumbSize} rounded-full shadow-md
          transition-all duration-300 ease-in-out
          ${isDark
            ? `${thumbTranslate} bg-[#0D2137] ring-1 ring-[#2B7BC4]/50`
            : "translate-x-0 bg-white ring-1 ring-black/5"
          }
          group-hover:shadow-lg
        `}
      />
    </button>
  );
}
