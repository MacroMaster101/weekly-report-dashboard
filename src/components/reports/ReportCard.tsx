import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export type ReportCardReport = {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  status: "DRAFT" | "SUBMITTED" | "LATE";
  project: { name: string };
};

export function ReportCard({ report }: { report: ReportCardReport }) {
  const start = new Date(report.weekStartDate).toLocaleDateString();
  const end = new Date(report.weekEndDate).toLocaleDateString();
  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-md)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-fg">{start} - {end}</p>
          <p className="truncate text-sm font-medium text-muted">{report.project.name}</p>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Badge status={report.status} />
          <Link href={`/member/reports/${report.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline">
            {report.status === "DRAFT" ? "Edit" : "View"}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
