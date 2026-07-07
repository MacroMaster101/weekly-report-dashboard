import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validations";
import { requireSession, requireTeamMember } from "@/lib/session";
import { isManagerRole } from "@/lib/permissions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const report = await prisma.weeklyReport.findUnique({
    where: { id },
    include: { user: { select: { name: true } }, project: { select: { name: true } } },
  });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (report.userId !== session.user.id && !isManagerRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ report });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireTeamMember();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const existing = await prisma.weeklyReport.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (existing.status !== "DRAFT") {
    return NextResponse.json({ error: "Submitted reports cannot be edited" }, { status: 409 });
  }
  const body = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;
  const report = await prisma.weeklyReport.update({
    where: { id },
    data: {
      projectId: d.projectId,
      weekStartDate: new Date(d.weekStartDate),
      weekEndDate: new Date(d.weekEndDate),
      tasksCompleted: d.tasksCompleted,
      tasksPlanned: d.tasksPlanned,
      blockers: d.blockers ?? null,
      hoursWorked: d.hoursWorked ?? null,
      notes: d.notes ?? null,
    },
  });
  return NextResponse.json({ report });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireTeamMember();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const existing = await prisma.weeklyReport.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (existing.status !== "DRAFT") {
    return NextResponse.json({ error: "Only draft reports can be deleted" }, { status: 409 });
  }
  await prisma.weeklyReport.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}