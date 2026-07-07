import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PASSWORD = "Password123";

const adminUsers = [
  { name: "Priya Ramanathan", email: "admin@weekly.local", role: "ADMIN" as const },
];

const managerUsers = [
  { name: "Maya Senanayake", email: "manager@weekly.local", role: "MANAGER" as const },
  { name: "Daniel Brooks", email: "delivery.manager@weekly.local", role: "MANAGER" as const },
];

const teamMembers = [
  { name: "Amara Silva", email: "member@weekly.local" },
  { name: "Nuwan Perera", email: "nuwan.perera@weekly.local" },
  { name: "Sahana Fernando", email: "sahana.fernando@weekly.local" },
  { name: "Kavindu Jayasinghe", email: "kavindu.jayasinghe@weekly.local" },
  { name: "Meera Patel", email: "meera.patel@weekly.local" },
  { name: "Liam Walker", email: "liam.walker@weekly.local" },
  { name: "Sofia Chen", email: "sofia.chen@weekly.local" },
  { name: "Ethan Brooks", email: "ethan.brooks@weekly.local" },
  { name: "Hana Kim", email: "hana.kim@weekly.local" },
  { name: "Arjun Rao", email: "arjun.rao@weekly.local" },
  { name: "Grace Miller", email: "grace.miller@weekly.local" },
  { name: "Oliver Brown", email: "oliver.brown@weekly.local" },
  { name: "Nina Hassan", email: "nina.hassan@weekly.local" },
  { name: "Diego Martin", email: "diego.martin@weekly.local" },
  { name: "Talia Stone", email: "talia.stone@weekly.local" },
  { name: "Victor Lee", email: "victor.lee@weekly.local" },
];

const projectSeeds = [
  ["Customer Portal", "Self-service account and case management for customers."],
  ["Billing Automation", "Invoice workflows, reconciliation, and payment visibility."],
  ["Data Insights Platform", "Analytics models and executive reporting datasets."],
  ["Mobile Field App", "Offline-first mobile workflows for field operations."],
  ["Internal Knowledge Base", "Team documentation, onboarding, and searchable guides."],
  ["Support Queue Optimizer", "Routing and prioritization improvements for support teams."],
  ["Partner API Gateway", "External partner integrations and API hardening."],
  ["Security Compliance", "Audit readiness, access reviews, and security controls."],
  ["Marketing Campaign Hub", "Campaign planning, assets, and performance workflows."],
  ["Design System", "Shared UI patterns, accessibility, and component governance."],
  ["Cloud Cost Review", "Infrastructure spend tracking and optimization."],
  ["QA Automation", "Regression coverage, test stability, and release confidence."],
  ["Release Operations", "Deployment coordination, release notes, and rollback planning."],
  ["CRM Cleanup", "Data quality, ownership, and duplicate account reduction."],
  ["Onboarding Workflow", "New customer implementation and handoff automation."],
  ["Inventory Forecasting", "Demand signals, stock planning, and alerting."],
  ["Executive Dashboard", "Leadership reporting and cross-team KPIs."],
  ["Notifications Service", "Email, SMS, and in-app notification reliability."],
  ["Search Experience", "Search relevance, filters, and result performance."],
  ["Localization", "Multi-language content and regional formatting."],
  ["Performance Tuning", "Latency, bundle, and query optimization."],
  ["Training Analytics", "Learning usage metrics and completion insights."],
  ["Vendor Integration", "Third-party workflow integration and monitoring."],
  ["Research Lab", "Prototype discovery and feasibility spikes."],
] as const;

const completedTasks = [
  "Shipped the revised workflow and verified the main acceptance criteria with product stakeholders.",
  "Refactored shared services, reduced duplicate logic, and added focused regression coverage.",
  "Completed API contract updates and validated request handling against staging data.",
  "Closed UI polish items, fixed accessibility gaps, and reviewed responsive behavior.",
  "Analyzed production telemetry, documented risks, and prepared fixes for the next release.",
  "Built the first pass of reporting logic and reviewed output with the delivery team.",
  "Resolved priority bugs from QA and confirmed the fixes with reproduction notes.",
  "Prepared migration notes, updated operational runbooks, and reviewed rollout steps.",
];

const plannedTasks = [
  "Complete final regression testing and prepare the release checklist for sign-off.",
  "Expand monitoring dashboards and review error trends with the platform team.",
  "Pair with design and product to validate the next workflow iteration.",
  "Improve edge-case handling and document expected API responses for consumers.",
  "Continue performance profiling and reduce the slowest database queries.",
  "Prepare stakeholder demo notes and capture feedback for the next sprint.",
  "Add missing test coverage around the newest report and filter scenarios.",
  "Finalize handoff documentation and confirm support readiness.",
];

const blockers = [
  "Waiting on production-like sample data from the operations team.",
  "Blocked by vendor API credentials that are still pending approval.",
  "Need design clarification for one empty-state workflow.",
  "Deployment window moved because another release is using the same environment.",
  "QA found an intermittent timeout that needs deeper investigation.",
  null,
  null,
  null,
  null,
  null,
];

function week(offsetWeeks: number) {
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() - offsetWeeks * 7);
  const day = (d.getDay() + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function resetDatabase() {
  await prisma.weeklyReport.deleteMany();
  await prisma.userProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  const password = await bcrypt.hash(PASSWORD, 10);

  await resetDatabase();

  const users = await Promise.all([
    ...adminUsers.map((u) => prisma.user.create({ data: { ...u, password, approvalStatus: "APPROVED" } })),
    ...managerUsers.map((u) => prisma.user.create({ data: { ...u, password, approvalStatus: "APPROVED" } })),
    ...teamMembers.map((u) => prisma.user.create({ data: { ...u, password, role: "TEAM_MEMBER", approvalStatus: "APPROVED" } })),
  ]);

  const members = users.filter((u) => u.role === "TEAM_MEMBER");

  const projects = await Promise.all(
    projectSeeds.map(([name, description]) => prisma.project.create({ data: { name, description } })),
  );

  const assignments = [];
  for (let memberIndex = 0; memberIndex < members.length; memberIndex++) {
    for (let slot = 0; slot < 3; slot++) {
      assignments.push({
        userId: members[memberIndex].id,
        projectId: projects[(memberIndex * 3 + slot * 5) % projects.length].id,
      });
    }
  }
  await prisma.userProject.createMany({ data: assignments, skipDuplicates: true });

  const reportCreates = [];
  for (let weekOffset = 0; weekOffset < 6; weekOffset++) {
    const { start, end } = week(weekOffset);
    for (let memberIndex = 0; memberIndex < members.length; memberIndex++) {
      const member = members[memberIndex];
      const project = projects[(memberIndex * 2 + weekOffset * 3) % projects.length];
      const signal = memberIndex + weekOffset;
      const isCurrentWeek = weekOffset === 0;
      const status = isCurrentWeek && memberIndex % 5 === 0
        ? "DRAFT"
        : !isCurrentWeek && signal % 11 === 0
          ? "LATE"
          : "SUBMITTED";
      const submittedAt = status === "DRAFT"
        ? null
        : status === "LATE"
          ? new Date(end.getTime() + 1000 * 60 * 60 * (8 + (memberIndex % 5)))
          : new Date(end.getTime() - 1000 * 60 * 60 * (6 + (memberIndex % 4)));

      reportCreates.push(
        prisma.weeklyReport.create({
          data: {
            userId: member.id,
            projectId: project.id,
            weekStartDate: start,
            weekEndDate: end,
            tasksCompleted: completedTasks[signal % completedTasks.length],
            tasksPlanned: plannedTasks[(signal + 2) % plannedTasks.length],
            blockers: blockers[(memberIndex * 2 + weekOffset) % blockers.length],
            hoursWorked: 30 + ((memberIndex * 3 + weekOffset * 4) % 16),
            notes: signal % 4 === 0 ? `Demo note: reviewed ${project.name.toLowerCase()} milestones with the team.` : null,
            status,
            submittedAt,
          },
        }),
      );
    }
  }

  await Promise.all(reportCreates);

  const [userCount, projectCount, reportCount, assignmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.weeklyReport.count(),
    prisma.userProject.count(),
  ]);

  console.log("Seed complete:", {
    users: userCount,
    teamMembers: members.length,
    projects: projectCount,
    reports: reportCount,
    assignments: assignmentCount,
    password: PASSWORD,
    admin: "admin@weekly.local",
    manager: "manager@weekly.local",
    member: "member@weekly.local",
  });
}

main().finally(() => prisma.$disconnect());