import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { requireManager } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true, description: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project });
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
  const project = await prisma.project.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ project });
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

  // Block deletion once reports reference this project — the FK is ON DELETE
  // CASCADE at the DB level, so without this guard removing a project would
  // silently wipe out the team's submitted report history for it.
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
