import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/session";
import type { Prisma } from "@prisma/client";

const REPORT_STATUSES = ["DRAFT", "SUBMITTED", "LATE"] as const;

export async function GET(req: Request) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const { searchParams } = new URL(req.url);
  const where: Prisma.WeeklyReportWhereInput = {};
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
  if (startDate || endDate) {
    where.weekStartDate = {};
    if (startDate) where.weekStartDate.gte = new Date(startDate);
    if (endDate) where.weekStartDate.lte = new Date(endDate);
  }

  const reports = await prisma.weeklyReport.findMany({
    where,
    orderBy: { weekStartDate: "desc" },
    include: { user: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ reports });
}
