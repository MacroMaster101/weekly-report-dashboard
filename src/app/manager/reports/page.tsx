"use client";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ReportFilters, type Filters } from "@/components/reports/ReportFilters";
import { ReportTable, type ReportTableRow } from "@/components/reports/ReportTable";

export default function ManagerReportsPage() {
  const [reports, setReports] = useState<ReportTableRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (filters?: Filters) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.userId) params.set("userId", filters.userId);
    if (filters?.projectId) params.set("projectId", filters.projectId);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    const res = await fetch(`/api/manager/reports?${params.toString()}`);
    const data = await res.json();
    setReports(data.reports ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/manager/reports")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setReports(data.reports ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Manager</p>
        <h1 className="text-3xl font-black tracking-tight text-fg">All Team Reports</h1>
      </div>
      <Card className="p-4"><ReportFilters onChange={load} /></Card>
      {loading ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">Loading reports...</p>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">No reports found.</p>
        </Card>
      ) : (
        <Card className="p-0"><ReportTable reports={reports} /></Card>
      )}
    </div>
  );
}
