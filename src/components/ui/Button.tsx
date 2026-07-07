import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  const styles = {
    primary:
      "border border-transparent bg-gradient-to-r from-accent to-[#6366f1] text-accent-fg shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-[0.98] hover:scale-[1.02]",
    secondary:
      "border border-border bg-surface/80 text-fg backdrop-blur-md shadow-[var(--shadow-sm)] hover:border-accent hover:bg-surface-2 active:scale-[0.98] hover:scale-[1.02]",
    danger:
      "border border-transparent bg-[var(--status-late-bg)] text-[var(--status-late-fg)] hover:brightness-95 active:scale-[0.98] hover:scale-[1.02]",
    ghost:
      "border border-transparent bg-transparent text-muted hover:bg-surface-2 hover:text-fg active:scale-[0.97]",
  }[variant];
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 disabled:shadow-none",
        styles,
        className,
      )}
      {...props}
    />
  );
}

