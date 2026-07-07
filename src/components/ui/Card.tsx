import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface/85 p-6 shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:shadow-md hover:border-border-strong/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

