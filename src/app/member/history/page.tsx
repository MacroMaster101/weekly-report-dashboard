"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ReportCard, type ReportCardReport } from "@/components/reports/ReportCard";

export default function HistoryPage() {
  const [reports, setReports] = useState<ReportCardReport[]>([]);
  useEffect(() => {
    fetch("/api/reports/my").then((r) => r.json()).then((d) => setReports(d.reports ?? []));
  }, []);
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Member</p>
        <h1 className="text-3xl font-black tracking-tight text-fg">My Report History</h1>
      </div>
      {reports.length === 0 ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">No reports yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {reports.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      )}
    </div>
  );
}
