import { AlertTriangle, CheckCircle2, Clock3, Percent } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { SummaryCards as Summary } from "@/types/dashboard";

export function SummaryCards({ summary }: { summary: Summary }) {
  const items = [
    { label: "Submitted", sub: "This week", value: summary.submittedThisWeek, Icon: CheckCircle2, gradient: "from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/20" },
    { label: "Compliance", sub: "Team rate", value: `${summary.complianceRate}%`, Icon: Percent, gradient: "from-indigo-500/20 to-blue-500/10 text-indigo-500 border-indigo-500/20" },
    { label: "Blockers", sub: "Open", value: summary.openBlockers, Icon: AlertTriangle, gradient: "from-rose-500/20 to-orange-500/10 text-rose-500 border-rose-500/20" },
    { label: "Pending", sub: "Reports", value: summary.pendingReports, Icon: Clock3, gradient: "from-amber-500/20 to-yellow-500/10 text-amber-500 border-amber-500/20" },
  ];
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, sub, value, Icon, gradient }) => (
        <Card key={label} className="relative min-h-36 overflow-hidden p-0 border border-border/80 hover:border-accent-soft hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex h-full flex-col justify-between gap-5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted">{label}</p>
                <p className="text-[10px] font-bold text-faint mt-0.5">{sub}</p>
              </div>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-tr ${gradient} shadow-sm`}>
                <Icon size={16} strokeWidth={2.5} />
              </span>
            </div>
            <p className="font-mono text-3xl font-black leading-none text-fg tracking-tight">{value}</p>
          </div>
          <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent to-[#6366f1]" aria-hidden />
        </Card>
      ))}
    </div>
  );
}

