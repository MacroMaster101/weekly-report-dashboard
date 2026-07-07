import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validations";
import { requireSession, requireManager } from "@/lib/session";

export async function GET() {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const reports = await prisma.weeklyReport.findMany({
    orderBy: { weekStartDate: "desc" },
    include: { user: { select: { name: true } }, project: { select: { name: true } } },
  });
  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const body = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;
  const report = await prisma.weeklyReport.create({
    data: {
      userId: session.user.id,
      projectId: d.projectId,
      weekStartDate: new Date(d.weekStartDate),
      weekEndDate: new Date(d.weekEndDate),
      tasksCompleted: d.tasksCompleted,
      tasksPlanned: d.tasksPlanned,
      blockers: d.blockers,
      hoursWorked: d.hoursWorked,
      notes: d.notes,
    },
  });
  return NextResponse.json({ report }, { status: 201 });
}
