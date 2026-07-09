import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/session";
import type { Prisma } from "@prisma/client";

// Manager-facing statuses. "PENDING" surfaces a member's unsubmitted DRAFT as
// a metadata-only row (who / project / week) — the draft's content stays
// private to its author and is redacted before the response leaves the server.
const REPORT_STATUSES = ["SUBMITTED", "LATE", "PENDING"] as const;

function parseDateParam(value: string, field: string): Date | NextResponse | null {
  if (!value) return null;
  // Parse date-only values as local midnight, not UTC ("2026-06-29" via the
  // Date constructor is UTC midnight, which shifts the boundary in timezones
  // ahead of UTC and drops reports stored at local midnight).
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
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
    // "PENDING" is the manager-facing name for a member's unsubmitted DRAFT.
    where.status = status === "PENDING" ? "DRAFT" : (status as "SUBMITTED" | "LATE");
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

  // Redact drafts: managers see that a report is pending (row metadata only),
  // never its work-in-progress content.
  const sanitized = reports.map((report) =>
    report.status === "DRAFT"
      ? {
          ...report,
          status: "PENDING" as const,
          tasksCompleted: "",
          tasksPlanned: "",
          blockers: null,
          hoursWorked: null,
          notes: null,
        }
      : report,
  );
  return NextResponse.json({ reports: sanitized });
}
