import { Badge } from "@/components/ui/Badge";
import type { ActivityItem } from "@/types/dashboard";

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
      {items.length === 0 && <p className="text-sm font-medium text-muted">No activity yet.</p>}
      <ul className="flex flex-col gap-4 text-xs font-semibold">
        {items.map((i) => (
          <li
            key={i.id}
            className="group relative flex flex-col gap-2 rounded-xl border border-transparent p-2.5 transition-all duration-300 hover:bg-surface-2/45 hover:border-border/30 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Timeline bullet dot */}
            <span className="absolute -left-[14.5px] top-4.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-accent shadow-sm group-hover:scale-125 transition-transform duration-200" aria-hidden />

            <span className="min-w-0 text-fg pl-1">
              <span className="font-black text-sm">{i.userName}</span>{" "}
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1.5 px-2 py-0.5 rounded-md bg-surface border border-border/60">
                {i.projectName}
              </span>
            </span>
            <span className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <Badge status={i.status as "DRAFT" | "SUBMITTED" | "LATE" | "PENDING"} />
              <span className="font-mono text-[10px] text-faint">
                {i.submittedAt ? new Date(i.submittedAt).toLocaleDateString() : "-"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

