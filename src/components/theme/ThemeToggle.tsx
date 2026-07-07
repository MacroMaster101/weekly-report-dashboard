"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "./ThemeProvider";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Server render and first client paint must match (no theme yet); flips to
  // true only once React has committed on the client, without an effect setState.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-2 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer",
              active
                ? "bg-surface text-accent shadow-[var(--shadow-sm)] scale-105"
                : "text-faint hover:bg-surface hover:text-fg",
            )}
          >
            <Icon size={14} strokeWidth={2.5} />
          </button>
        );
      })}
    </div>
  );
}

