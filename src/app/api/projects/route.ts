import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { requireSession, requireManager } from "@/lib/session";

export async function GET() {
  try {
    await requireSession();
  } catch (e) {
    return e as Response;
  }
  const projects = await prisma.project.findMany({
    orderBy: { name: "asc" },
    include: {
      reports: {
        select: {
          userId: true,
        },
      },
    },
  });

  const formattedProjects = projects.map((p) => {
    const uniqueUserIds = new Set(p.reports.map((r) => r.userId));
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      reportsCount: p.reports.length,
      membersCount: uniqueUserIds.size,
    };
  });

  const totalProjects = formattedProjects.length;
  const activeProjects = formattedProjects.filter((p) => p.reportsCount > 0).length;
  const totalReports = formattedProjects.reduce((acc, p) => acc + p.reportsCount, 0);

  const allUniqueUsers = new Set<string>();
  projects.forEach((p) => p.reports.forEach((r) => allUniqueUsers.add(r.userId)));
  const totalMembers = allUniqueUsers.size;

  return NextResponse.json({
    projects: formattedProjects,
    stats: {
      totalProjects,
      activeProjects,
      totalReports,
      totalMembers,
    },
  });
}

export async function POST(req: Request) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const project = await prisma.project.create({ data: parsed.data });
  return NextResponse.json({ project }, { status: 201 });
}
