import { Badge } from "@/components/ui/Badge";
import { Eye } from "lucide-react";

export type ReportTableRow = {
  id: string;
  user: { name: string };
  project: { name: string };
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string | null;
  hoursWorked: number | null;
  notes: string | null;
  status: "DRAFT" | "SUBMITTED" | "LATE";
  submittedAt: string | null;
};

export function ReportTable({
  reports,
  onSelectReport,
}: {
  reports: ReportTableRow[];
  onSelectReport: (r: ReportTableRow) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/80 bg-surface/40 shadow-sm backdrop-blur-md">
      <table className="min-w-[1020px] w-full table-fixed text-left text-xs font-semibold leading-normal">
        <thead>
          <tr className="border-b border-border bg-surface-2/65 text-muted uppercase tracking-wider text-[10px] font-black">
            <th className="w-36 px-6 py-4">Member</th>
            <th className="w-36 px-6 py-4">Project</th>
            <th className="w-48 px-6 py-4">Week Range</th>
            <th className="px-6 py-4">Tasks Completed</th>
            <th className="px-6 py-4">Blockers</th>
            <th className="w-20 px-6 py-4 text-center">Hours</th>
            <th className="w-32 px-6 py-4">Status</th>
            <th className="w-32 px-6 py-4">Submitted</th>
            <th className="w-24 px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {reports.map((r) => (
            <tr
              key={r.id}
              onClick={() => onSelectReport(r)}
              className="align-top text-fg transition-all duration-200 hover:bg-surface-2/30 cursor-pointer"
            >
              <td className="truncate px-6 py-4 text-sm font-black text-fg">{r.user.name}</td>
              <td className="truncate px-6 py-4">
                <span className="inline-flex px-2 py-0.5 rounded-md bg-surface-2 border border-border/50 font-bold text-[10px] text-muted uppercase tracking-wider">
                  {r.project.name}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 font-mono text-[11px] text-muted">
                {new Date(r.weekStartDate).toLocaleDateString()} - {new Date(r.weekEndDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-muted text-xs leading-relaxed max-w-xs truncate" title={r.tasksCompleted}>
                {r.tasksCompleted}
              </td>
              <td className="px-6 py-4 text-muted text-xs leading-relaxed max-w-xs truncate" title={r.blockers || undefined}>
                {r.blockers ? (
                  <span className="text-rose-500 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {r.blockers}
                  </span>
                ) : (
                  <span className="text-faint">-</span>
                )}
              </td>
              <td className="px-6 py-4 font-mono text-center text-sm font-black text-fg">{r.hoursWorked ?? "-"}</td>
              <td className="px-6 py-4">
                <Badge status={r.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 font-mono text-[11px] text-faint">
                {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "-"}
              </td>
              <td className="px-6 py-3.5 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectReport(r);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2/45 text-muted hover:border-accent/45 hover:text-accent transition-all duration-200 cursor-pointer"
                  title="View report details"
                >
                  <Eye size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
