import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { isLate } from "@/lib/utils";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
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
  // Submitting after the report week has ended marks it LATE instead of SUBMITTED;
  // once set, status moves out of DRAFT so the report becomes read-only (see [id]/route.ts).
  const now = new Date();
  const late = isLate(now, existing.weekEndDate);
  const report = await prisma.weeklyReport.update({
    where: { id },
    data: { status: late ? "LATE" : "SUBMITTED", submittedAt: now },
  });
  return NextResponse.json({ report });
}
