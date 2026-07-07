"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReportForm } from "@/components/reports/ReportForm";

type Project = { id: string; name: string };
type ReportStatus = "DRAFT" | "SUBMITTED" | "LATE";
type ReportDetail = {
  id: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string | null;
  hoursWorked: number | null;
  notes: string | null;
  status: ReportStatus;
  project: { name: string };
};

function toDateInput(date: string) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

export default function EditReportPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch(`/api/reports/${params.id}`).then((r) => r.json()).then((d) => setReport(d.report ?? null));
    fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(d.projects ?? []));
  }, [params.id]);

  if (!report) {
    return (
      <Card className="mx-auto flex max-w-3xl items-center justify-center py-16">
        <p className="text-sm font-medium text-muted">Loading report...</p>
      </Card>
    );
  }

  if (report.status !== "DRAFT") {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Member</p>
            <h1 className="text-3xl font-black tracking-tight text-fg">Report</h1>
            <p className="font-mono text-sm text-muted">
              {formatDate(report.weekStartDate)} - {formatDate(report.weekEndDate)}
            </p>
          </div>
          <Badge status={report.status} />
        </div>
        <Card className="p-6">
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-2 p-4 sm:col-span-2">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Project</dt>
              <dd className="mt-1 font-semibold text-fg">{report.project.name}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Tasks completed</dt>
              <dd className="mt-2 whitespace-pre-wrap text-fg">{report.tasksCompleted}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Tasks planned</dt>
              <dd className="mt-2 whitespace-pre-wrap text-fg">{report.tasksPlanned}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Blockers</dt>
              <dd className="mt-2 whitespace-pre-wrap text-fg">{report.blockers || "-"}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Hours worked</dt>
              <dd className="mt-2 font-mono text-fg">{report.hoursWorked ?? "-"}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4 sm:col-span-2">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">Notes</dt>
              <dd className="mt-2 whitespace-pre-wrap text-fg">{report.notes || "-"}</dd>
            </div>
          </dl>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Member</p>
        <h1 className="text-3xl font-black tracking-tight text-fg">Edit Draft Report</h1>
      </div>
      <Card className="p-6">
        <ReportForm
          projects={projects}
          initial={{
            id: report.id,
            projectId: report.projectId,
            weekStartDate: toDateInput(report.weekStartDate),
            weekEndDate: toDateInput(report.weekEndDate),
            tasksCompleted: report.tasksCompleted,
            tasksPlanned: report.tasksPlanned,
            blockers: report.blockers ?? "",
            hoursWorked: report.hoursWorked?.toString() ?? "",
            notes: report.notes ?? "",
          }}
        />
      </Card>
    </div>
  );
}
