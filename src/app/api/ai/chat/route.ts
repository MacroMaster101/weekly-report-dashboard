import { NextResponse } from "next/server";
import { requireManager } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWeekRange, formatLocalDate } from "@/lib/utils";

// Uses Groq via its OpenAI-compatible API. Get a key at
// https://console.groq.com/keys and set GROQ_API_KEY in .env.
const GROQ_MODEL = "llama-3.3-70b-versatile";
const SYSTEM_PROMPT = [
  "You are a concise assistant for an engineering manager.",
  "Answer using only the weekly report data provided in the context.",
  "Prefer concrete names, projects, weeks, blockers, and hours when available.",
  "If the context does not contain the answer, say so and suggest the closest available summary.",
].join(" ");

type TeamMember = {
  id: string;
  name: string;
};

type ReportContext = {
  userId: string;
  projectId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string | null;
  hoursWorked: number | null;
  notes: string | null;
  status: "DRAFT" | "SUBMITTED" | "LATE";
  submittedAt: Date | null;
  user: { id: string; name: string };
  project: { name: string };
};

type ProjectSummary = {
  project: string;
  reports: number;
  hours: number;
};

type Analytics = {
  weekLabel: string;
  submittedThisWeek: number;
  lateThisWeek: number;
  pendingMembers: string[];
  blockers: string[];
  projectSummaries: ProjectSummary[];
  recentReports: string[];
  totalHours: number;
};

function compact(value: string, maxLength = 220) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}...` : normalized;
}

function buildAnalytics(reports: ReportContext[], members: TeamMember[]): Analytics {
  const { start, end } = getWeekRange(new Date());
  const currentWeekReports = reports.filter(
    (report) => report.weekStartDate >= start && report.weekStartDate <= end,
  );
  const submittedMemberIds = new Set(
    currentWeekReports
      .filter((report) => report.status === "SUBMITTED" || report.status === "LATE")
      .map((report) => report.userId),
  );

  const projectMap = new Map<string, ProjectSummary>();
  let totalHours = 0;
  for (const report of reports) {
    const project = projectMap.get(report.project.name) ?? {
      project: report.project.name,
      reports: 0,
      hours: 0,
    };
    project.reports += 1;
    project.hours += report.hoursWorked ?? 0;
    totalHours += report.hoursWorked ?? 0;
    projectMap.set(report.project.name, project);
  }

  const blockers = reports
    .filter((report) => report.blockers && report.blockers.trim())
    .slice(0, 12)
    .map(
      (report) =>
        `${report.user.name} on ${report.project.name} (${formatLocalDate(report.weekStartDate)}): ${compact(report.blockers ?? "")}`,
    );

  const recentReports = reports.slice(0, 36).map(
    (report) =>
      [
        `${report.user.name} | ${report.project.name}`,
        `${formatLocalDate(report.weekStartDate)} to ${formatLocalDate(report.weekEndDate)}`,
        `status:${report.status}`,
        `hours:${report.hoursWorked ?? "n/a"}`,
        `completed:${compact(report.tasksCompleted, 180)}`,
        `planned:${compact(report.tasksPlanned, 160)}`,
        `blockers:${report.blockers ? compact(report.blockers, 140) : "none"}`,
      ].join(" | "),
  );

  return {
    weekLabel: `${formatLocalDate(start)} to ${formatLocalDate(end)}`,
    submittedThisWeek: currentWeekReports.filter((report) => report.status === "SUBMITTED").length,
    lateThisWeek: currentWeekReports.filter((report) => report.status === "LATE").length,
    pendingMembers: members
      .filter((member) => !submittedMemberIds.has(member.id))
      .map((member) => member.name),
    blockers,
    projectSummaries: [...projectMap.values()]
      .sort((a, b) => b.hours - a.hours || b.reports - a.reports)
      .slice(0, 10),
    recentReports,
    totalHours,
  };
}

function buildContext(analytics: Analytics, memberCount: number) {
  return [
    `Team members: ${memberCount}`,
    `Current week: ${analytics.weekLabel}`,
    `Current week status: ${analytics.submittedThisWeek} submitted, ${analytics.lateThisWeek} late, ${analytics.pendingMembers.length} pending members.`,
    `Pending members: ${analytics.pendingMembers.length ? analytics.pendingMembers.join(", ") : "none"}`,
    `Total tracked hours in supplied reports: ${analytics.totalHours}`,
    `Top project workload:\n${analytics.projectSummaries
      .map((project) => `- ${project.project}: ${project.hours} hours across ${project.reports} reports`)
      .join("\n")}`,
    `Open or recent blockers:\n${analytics.blockers.length ? analytics.blockers.map((b) => `- ${b}`).join("\n") : "- none reported"}`,
    `Recent weekly reports:\n${analytics.recentReports.map((report) => `- ${report}`).join("\n")}`,
  ].join("\n\n");
}

function localAnswer(question: string, analytics: Analytics, memberCount: number) {
  const q = question.toLowerCase();
  if (analytics.recentReports.length === 0) {
    return "No weekly reports are available yet, so I cannot summarize team activity.";
  }

  if (q.includes("blocker") || q.includes("challenge") || q.includes("risk")) {
    return analytics.blockers.length
      ? `Current notable blockers:\n${analytics.blockers.slice(0, 6).map((b) => `- ${b}`).join("\n")}`
      : "No blockers are reported in the latest available weekly reports.";
  }

  if (q.includes("project") || q.includes("workload") || q.includes("hours")) {
    return `Top project workload from the latest reports:\n${analytics.projectSummaries
      .slice(0, 6)
      .map((project) => `- ${project.project}: ${project.hours} hours across ${project.reports} reports`)
      .join("\n")}`;
  }

  if (q.includes("pending") || q.includes("late") || q.includes("status") || q.includes("compliance")) {
    return [
      `Current week (${analytics.weekLabel}) status:`,
      `- Submitted: ${analytics.submittedThisWeek}`,
      `- Late: ${analytics.lateThisWeek}`,
      `- Pending members: ${analytics.pendingMembers.length ? analytics.pendingMembers.join(", ") : "none"}`,
    ].join("\n");
  }

  return [
    `Team summary for ${analytics.weekLabel}:`,
    `- ${memberCount} team members are tracked.` ,
    `- ${analytics.submittedThisWeek} submitted reports and ${analytics.lateThisWeek} late reports this week.`,
    `- Top workload project: ${analytics.projectSummaries[0]?.project ?? "not available"}.`,
    `- Open/recent blockers: ${analytics.blockers.length}.`,
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }

  const body = (await req.json().catch(() => ({}))) as { question?: unknown };
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 });
  if (question.length > 1000) {
    return NextResponse.json({ error: "Question is too long" }, { status: 400 });
  }

  const [members, reports] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEAM_MEMBER", approvalStatus: "APPROVED" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.weeklyReport.findMany({
      // Drafts are private to their author — never fed to the assistant
      // (or to the external LLM API) until submitted.
      where: { user: { role: "TEAM_MEMBER", approvalStatus: "APPROVED" }, status: { in: ["SUBMITTED", "LATE"] } },
      orderBy: [{ weekStartDate: "desc" }, { updatedAt: "desc" }],
      take: 100,
      include: { user: { select: { id: true, name: true } }, project: { select: { name: true } } },
    }),
  ]);

  const analytics = buildAnalytics(reports, members);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ answer: localAnswer(question, analytics, members.length), mode: "local" });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        max_tokens: 900,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Question: ${question}\n\nWeekly report context:\n${buildContext(analytics, members.length)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ answer: localAnswer(question, analytics, members.length), mode: "local" });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const answer = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ answer: answer || localAnswer(question, analytics, members.length), mode: "ai" });
  } catch {
    return NextResponse.json({ answer: localAnswer(question, analytics, members.length), mode: "local" });
  }
}