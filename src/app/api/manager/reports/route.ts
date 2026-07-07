import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/session";
import type { Prisma } from "@prisma/client";

const REPORT_STATUSES = ["DRAFT", "SUBMITTED", "LATE"] as const;

function parseDateParam(value: string, field: string): Date | NextResponse | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 });
  }
  return date;
}

export async function GET(req: Request) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const { searchParams } = new URL(req.url);
  const where: Prisma.WeeklyReportWhereInput = { user: { role: "TEAM_MEMBER" } };
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (userId) where.userId = userId;
  if (projectId) where.projectId = projectId;
  if (status) {
    if (!REPORT_STATUSES.includes(status as (typeof REPORT_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid report status" }, { status: 400 });
    }
    where.status = status as (typeof REPORT_STATUSES)[number];
  }

  const parsedStart = startDate ? parseDateParam(startDate, "startDate") : null;
  if (parsedStart instanceof NextResponse) return parsedStart;
  const parsedEnd = endDate ? parseDateParam(endDate, "endDate") : null;
  if (parsedEnd instanceof NextResponse) return parsedEnd;

  if (parsedStart || parsedEnd) {
    const endOfDay = parsedEnd ? new Date(parsedEnd) : null;
    if (endOfDay) endOfDay.setHours(23, 59, 59, 999);
    if (parsedStart && endOfDay && parsedStart > endOfDay) {
      return NextResponse.json({ error: "startDate must be before endDate" }, { status: 400 });
    }
    where.weekStartDate = {};
    if (parsedStart) where.weekStartDate.gte = parsedStart;
    if (endOfDay) where.weekStartDate.lte = endOfDay;
  }

  const reports = await prisma.weeklyReport.findMany({
    where,
    orderBy: { weekStartDate: "desc" },
    include: { user: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ reports });
}