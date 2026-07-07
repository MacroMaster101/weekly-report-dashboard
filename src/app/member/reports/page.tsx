"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ReportForm } from "@/components/reports/ReportForm";

type Project = { id: string; name: string };

export default function NewReportPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(d.projects ?? []));
  }, []);
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Member</p>
        <h1 className="text-3xl font-black tracking-tight text-fg">New Weekly Report</h1>
      </div>
      {projects.length === 0 ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">No projects available yet.</p>
        </Card>
      ) : (
        <Card className="p-6">
          <ReportForm projects={projects} />
        </Card>
      )}
    </div>
  );
}
