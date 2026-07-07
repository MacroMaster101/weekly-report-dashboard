import { cn } from "@/lib/utils";
import { fieldClass } from "./Input";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className, id, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={cn(
          fieldClass,
          "resize-y leading-relaxed",
          error && "border-[var(--status-late-fg)]",
          className,
        )}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-[var(--status-late-fg)]">{error}</span>
      )}
    </div>
  );
}
