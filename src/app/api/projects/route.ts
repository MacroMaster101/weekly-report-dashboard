import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { requireSession, requireManager } from "@/lib/session";

function mapProject(project: {
  id: string;
  name: string;
  description: string | null;
  _count: { reports: number; members: number };
}) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    reportsCount: project._count.reports,
    membersCount: project._count.members,
  };
}

export async function GET() {
  try {
    await requireSession();
  } catch (e) {
    return e as Response;
  }

  const rawProjects = await prisma.project.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { reports: true, members: true } },
    },
  });
  const projects = rawProjects.map(mapProject);
  const assignedMemberIds = await prisma.userProject.findMany({
    distinct: ["userId"],
    select: { userId: true },
  });
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((project) => project.reportsCount > 0).length,
    totalReports: projects.reduce((total, project) => total + project.reportsCount, 0),
    totalMembers: assignedMemberIds.length,
  };

  return NextResponse.json({ projects, stats });
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

  const existing = await prisma.project.findFirst({
    where: { name: { equals: parsed.data.name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "Project name already exists" }, { status: 409 });
  }

  const project = await prisma.project.create({
    data: { ...parsed.data, description: parsed.data.description ?? null },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { reports: true, members: true } },
    },
  });
  return NextResponse.json({ project: mapProject(project) }, { status: 201 });
}