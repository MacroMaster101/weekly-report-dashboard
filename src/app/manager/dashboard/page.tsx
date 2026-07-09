"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TasksTrendChart } from "@/components/charts/TasksTrendChart";
import { SubmissionStatusChart } from "@/components/charts/SubmissionStatusChart";
import { ProjectDistributionChart } from "@/components/charts/ProjectDistributionChart";
import type { DashboardData } from "@/types/dashboard";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetch("/api/manager/dashboard").then((r) => r.json()).then(setData);
  }, []);
  if (!data) {
    return (
      <Card className="flex items-center justify-center py-16">
        <p className="text-sm font-medium text-muted">Loading dashboard...</p>
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
          {isAdmin ? "Admin" : "Manager"}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-fg">Dashboard</h1>
      </div>
      <SummaryCards summary={data.summary} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-fg">Reports Submitted per Week</h2>
          <TasksTrendChart data={data.tasksTrend} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-fg">Submission Status by Member</h2>
          <SubmissionStatusChart data={data.submissionStatus} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-fg">Workload by Project</h2>
          <ProjectDistributionChart data={data.projectDistribution} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold text-fg">Recent Activity</h2>
          <RecentActivity items={data.recentActivity} />
        </Card>
      </div>
    </div>
  );
}
