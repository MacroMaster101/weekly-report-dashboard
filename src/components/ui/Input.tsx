"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const fieldClass =
  "min-h-10 w-full rounded-xl border border-border bg-surface/50 px-3.5 py-2 text-sm text-fg placeholder:text-faint transition-all duration-300 hover:border-border-strong focus:border-accent focus:bg-surface/85 focus:ring-2 focus:ring-accent-soft/80 focus:outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]";

export function Input({ label, error, className, id, type, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <input
          id={id}
          type={inputType}
          className={cn(
            fieldClass,
            error && "border-[var(--status-late-fg)]",
            isPassword && "pr-11",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-lg text-faint hover:bg-surface-2 hover:text-fg transition-all active:scale-95 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs font-medium text-[var(--status-late-fg)]">{error}</span>
      )}
    </div>
  );
}

