import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { requireManager } from "@/lib/session";

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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { reports: true, members: true } },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project: mapProject(project) });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const duplicate = await prisma.project.findFirst({
    where: { id: { not: id }, name: { equals: parsed.data.name, mode: "insensitive" } },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json({ error: "Project name already exists" }, { status: 409 });
  }

  const project = await prisma.project.update({
    where: { id },
    data: { ...parsed.data, description: parsed.data.description ?? null },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { reports: true, members: true } },
    },
  });
  return NextResponse.json({ project: mapProject(project) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reportCount = await prisma.weeklyReport.count({ where: { projectId: id } });
  if (reportCount > 0) {
    return NextResponse.json(
      { error: "Project has reports and cannot be deleted." },
      { status: 409 },
    );
  }
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}