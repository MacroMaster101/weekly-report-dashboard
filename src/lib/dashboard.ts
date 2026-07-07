import { prisma } from "@/lib/prisma";
import { getWeekRange } from "@/lib/utils";
import type { DashboardData } from "@/types/dashboard";

export async function computeDashboard(): Promise<DashboardData> {
  const { start, end } = getWeekRange(new Date());

  const [members, allReports, thisWeekReports] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEAM_MEMBER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.weeklyReport.findMany({
      include: { user: { select: { name: true } }, project: { select: { name: true } } },
      orderBy: { weekStartDate: "desc" },
    }),
    prisma.weeklyReport.findMany({
      where: { weekStartDate: { gte: start, lte: end }, user: { role: "TEAM_MEMBER" } },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  const submittedReportsThisWeek = thisWeekReports.filter(
    (r) => r.status === "SUBMITTED" || r.status === "LATE",
  );
  // Compliance is measured per-member (did they submit at all this week?),
  // not per-report, since a member could in theory have multiple project reports.
  const submittedMemberIds = new Set(submittedReportsThisWeek.map((r) => r.userId));
  const memberCount = members.length;
  const submittedThisWeek = submittedReportsThisWeek.length;
  const complianceRate = memberCount === 0
    ? 0
    : Math.round((submittedMemberIds.size / memberCount) * 100);
  const openBlockers = thisWeekReports.filter(
    (r) => r.blockers && r.blockers.trim() !== "",
  ).length;
  const pendingReports = Math.max(memberCount - submittedMemberIds.size, 0);

  const trendMap = new Map<string, number>();
  for (const r of allReports) {
    const key = new Date(r.weekStartDate).toISOString().slice(0, 10);
    trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
  }
  const tasksTrend = [...trendMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([week, reports]) => ({ week, reports }));

  const statusMap = new Map<string, { submitted: number; pending: number; late: number }>();
  for (const r of thisWeekReports) {
    const current = statusMap.get(r.userId) ?? { submitted: 0, pending: 0, late: 0 };
    if (r.status === "SUBMITTED") current.submitted += 1;
    else if (r.status === "LATE") current.late += 1;
    else current.pending += 1;
    statusMap.set(r.userId, current);
  }
  // Every member gets a bar even with zero reports this week: no report means
  // "pending", so we force pending to at least 1 unless they already submitted/were late.
  const submissionStatus = members.map((member) => {
    const status = statusMap.get(member.id) ?? { submitted: 0, pending: 1, late: 0 };
    if (status.submitted > 0 || status.late > 0) {
      return { member: member.name, ...status, pending: 0 };
    }
    return { member: member.name, ...status, pending: Math.max(status.pending, 1) };
  });

  const projMap = new Map<string, number>();
  for (const r of allReports) {
    projMap.set(r.project.name, (projMap.get(r.project.name) ?? 0) + 1);
  }
  const projectDistribution = [...projMap.entries()].map(([project, count]) => ({ project, count }));

  const recentActivity = allReports.slice(0, 8).map((r) => ({
    id: r.id,
    userName: r.user.name,
    projectName: r.project.name,
    status: r.status,
    submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
  }));

  return {
    summary: { submittedThisWeek, complianceRate, openBlockers, pendingReports },
    tasksTrend,
    submissionStatus,
    projectDistribution,
    recentActivity,
  };
}
