import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeamMember } from "@/lib/session";
import { isLate } from "@/lib/utils";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    return NextResponse.json({ error: "Report already submitted" }, { status: 409 });
  }
  const now = new Date();
  const late = isLate(now, existing.weekEndDate);
  const report = await prisma.weeklyReport.update({
    where: { id },
    data: { status: late ? "LATE" : "SUBMITTED", submittedAt: now },
  });
  return NextResponse.json({ report });
}