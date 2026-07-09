"use client";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ReportCard, type ReportCardReport } from "@/components/reports/ReportCard";

type WeekGroup = { key: string; label: string; reports: ReportCardReport[] };

// Reports arrive ordered by weekStartDate desc; group consecutive reports
// that share the same week range under one header.
function groupByWeek(reports: ReportCardReport[]): WeekGroup[] {
  const groups: WeekGroup[] = [];
  for (const report of reports) {
    const key = `${report.weekStartDate}_${report.weekEndDate}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.reports.push(report);
    } else {
      const start = new Date(report.weekStartDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const end = new Date(report.weekEndDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      groups.push({ key, label: `Week of ${start} - ${end}`, reports: [report] });
    }
  }
  return groups;
}

export default function HistoryPage() {
  const [reports, setReports] = useState<ReportCardReport[]>([]);
  useEffect(() => {
    fetch("/api/reports/my").then((r) => r.json()).then((d) => setReports(d.reports ?? []));
  }, []);
  const weeks = groupByWeek(reports);
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Member</p>
        <h1 className="text-3xl font-black tracking-tight text-fg">My Report History</h1>
      </div>
      {weeks.length === 0 ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">No reports yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {weeks.map((week) => (
            <section key={week.key} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-muted">
                <Calendar size={14} className="text-accent" />
                {week.label}
              </div>
              <div className="grid gap-3">
                {week.reports.map((r) => <ReportCard key={r.id} report={r} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
