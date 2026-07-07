import { cn } from "@/lib/utils";
import { fieldClass } from "./Input";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function Select({ label, error, className, id, children, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          fieldClass,
          "cursor-pointer appearance-none bg-[length:16px] bg-[right_0.7rem_center] bg-no-repeat pr-9",
          error && "border-[var(--status-late-fg)]",
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2360706a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span className="text-xs font-medium text-[var(--status-late-fg)]">{error}</span>
      )}
    </div>
  );
}
