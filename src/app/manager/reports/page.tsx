"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReportFilters, type Filters } from "@/components/reports/ReportFilters";
import { ReportTable, type ReportTableRow } from "@/components/reports/ReportTable";
import { Calendar, Clock, Folder, Sparkles, ArrowLeft, AlertTriangle, FileText } from "lucide-react";

export default function ManagerReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<ReportTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportTableRow | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

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
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
          {isAdmin ? "Admin" : "Manager"}
        </p>
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
        <Card className="p-0">
          <ReportTable reports={reports} onSelectReport={setSelectedReport} />
        </Card>
      )}

      {/* Full-Page Detailed Popup Workspace */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-bg flex flex-col overflow-hidden overflow-x-hidden animate-[modal-in_0.25s_cubic-bezier(0.16,1,0.3,1)]">
          {/* Top Header Navbar */}
          <header className="sticky top-0 z-10 border-b border-border/60 bg-surface/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedReport(null)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider text-muted hover:text-fg hover:bg-surface-2 rounded-xl transition-all cursor-pointer border border-border/40"
            >
              <ArrowLeft size={14} />
              Back to Reports
            </button>
            <div className="hidden sm:flex flex-col items-center leading-none">
              <span className="text-sm font-black text-fg">Weekly Report Details</span>
              <span className="font-mono text-[10px] text-faint mt-1">
                {new Date(selectedReport.weekStartDate).toLocaleDateString()} - {new Date(selectedReport.weekEndDate).toLocaleDateString()}
              </span>
            </div>
            <Badge status={selectedReport.status} />
          </header>

          {/* Main Content Split Workspace */}
          <div className="flex-1 overflow-hidden w-full bg-[radial-gradient(at_50%_0%_rgba(129,140,248,0.03),transparent_60%)] flex justify-center">
            <div className="max-w-6xl w-full h-full flex flex-col md:flex-row gap-8 px-6 py-8 overflow-hidden">
              {/* Left Column: Member Info Card & Metadata Summary (Fixed/Sticky) */}
              <div className="w-full md:w-80 shrink-0 flex flex-col gap-5 overflow-y-auto md:overflow-visible pr-1 md:pr-0">
                {/* Profile Card */}
                <div className="flex flex-col items-center text-center gap-3.5 rounded-2xl border border-border bg-surface/75 p-5 shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-[#6366f1] text-accent-fg font-black text-2xl shadow-md">
                    {selectedReport.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base font-black text-fg tracking-tight truncate max-w-[200px]">{selectedReport.user.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-faint">Team Member</span>
                  </div>
                </div>

                {/* Metadata card */}
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/75 p-5 text-xs shadow-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-faint uppercase tracking-wider text-[9px]">Project Name</span>
                    <div className="flex items-center gap-2 text-fg font-black text-sm mt-1">
                      <Folder size={15} className="text-accent shrink-0" />
                      <span className="truncate">{selectedReport.project.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-border/40 pt-4">
                    <span className="font-black text-faint uppercase tracking-wider text-[9px]">Hours Worked</span>
                    <div className="flex items-center gap-2 text-fg font-mono font-black text-sm mt-1">
                      <Clock size={15} className="text-accent shrink-0" />
                      <span>{selectedReport.hoursWorked ?? "0"} hrs</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-border/40 pt-4">
                    <span className="font-black text-faint uppercase tracking-wider text-[9px]">Week Range</span>
                    <div className="flex items-center gap-2 text-fg font-semibold leading-relaxed mt-1">
                      <Calendar size={15} className="text-accent shrink-0" />
                      <span className="font-mono text-[11px] whitespace-nowrap">
                        {new Date(selectedReport.weekStartDate).toLocaleDateString()} - {new Date(selectedReport.weekEndDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {selectedReport.submittedAt && (
                    <div className="flex flex-col gap-1 border-t border-border/40 pt-4">
                      <span className="font-black text-faint uppercase tracking-wider text-[9px]">Submitted Date</span>
                      <div className="text-muted font-mono text-[10px] font-bold leading-relaxed mt-1.5 bg-surface-2/45 rounded-lg border border-border/30 px-2.5 py-1.5 truncate">
                        {new Date(selectedReport.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Scrollable Content Feed */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 pb-10 h-full">
                {/* Completed Tasks card */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/70 p-6 shadow-sm hover:border-accent/40 transition-colors duration-300">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-accent border-b border-border/40 pb-3">
                    <Sparkles size={15} className="animate-pulse" />
                    Tasks Completed This Week
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-fg whitespace-pre-wrap mt-1">
                    {selectedReport.tasksCompleted}
                  </p>
                </div>

                {/* Planned Tasks card */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/70 p-6 shadow-sm hover:border-accent/30 transition-colors duration-300">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted border-b border-border/40 pb-3">
                    <FileText size={15} />
                    Tasks Planned Next Week
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-fg whitespace-pre-wrap mt-1">
                    {selectedReport.tasksPlanned || (
                      <span className="italic text-faint font-normal">No planned tasks logged.</span>
                    )}
                  </p>
                </div>

                {/* Blockers card */}
                {selectedReport.blockers && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-6 shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-500 border-b border-rose-500/20 pb-3">
                      <AlertTriangle size={15} className="animate-pulse" />
                      Blockers Encountered
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-rose-600 dark:text-rose-400 whitespace-pre-wrap mt-1">
                      {selectedReport.blockers}
                    </p>
                  </div>
                )}

                {/* Notes card */}
                {selectedReport.notes && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/70 p-6 shadow-sm transition-colors duration-300">
                    <div className="text-xs font-black uppercase tracking-wider text-muted border-b border-border/40 pb-3">
                      Additional Notes
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-fg whitespace-pre-wrap mt-1">
                      {selectedReport.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
