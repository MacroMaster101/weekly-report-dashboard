import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const [manager, member, admin] = await Promise.all([
    prisma.user.upsert({ where: { email: "manager@test.com" }, update: {}, create: { name: "Manager User", email: "manager@test.com", password, role: "MANAGER" } }),
    prisma.user.upsert({ where: { email: "member@test.com" }, update: {}, create: { name: "Member User", email: "member@test.com", password, role: "TEAM_MEMBER" } }),
    prisma.user.upsert({ where: { email: "admin@test.com" }, update: {}, create: { name: "Admin User", email: "admin@test.com", password, role: "ADMIN" } }),
  ]);

  const projectNames = ["Client A", "Internal Tooling", "R&D", "Marketing"];
  const projects = [];
  for (const name of projectNames) {
    const existing = await prisma.project.findFirst({ where: { name } });
    projects.push(existing ?? (await prisma.project.create({ data: { name } })));
  }

  // Monday-Sunday range for the week N weeks before today (mirrors src/lib/utils.ts getWeekRange).
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

  const existingReports = await prisma.weeklyReport.count();
  if (existingReports === 0) {
    for (let i = 0; i < 4; i++) {
      const { start, end } = week(i);
      const submittedAt = i === 0 ? null : new Date(end.getTime() - 3600_000);
      await prisma.weeklyReport.create({
        data: {
          userId: member.id,
          projectId: projects[i % projects.length].id,
          weekStartDate: start,
          weekEndDate: end,
          tasksCompleted: `Completed feature work for week -${i}.`,
          tasksPlanned: "Continue next milestone.",
          blockers: i % 2 === 0 ? "Waiting on API access." : null,
          hoursWorked: 40,
          notes: "https://example.com/pr/123",
          status: i === 0 ? "DRAFT" : "SUBMITTED",
          submittedAt,
        },
      });
    }
  }

  console.log("Seed complete:", { manager: manager.email, member: member.email, admin: admin.email });
}

main().finally(() => prisma.$disconnect());
