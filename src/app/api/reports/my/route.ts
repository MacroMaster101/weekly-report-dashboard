import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch (e) {
    return e as Response;
  }
  const reports = await prisma.weeklyReport.findMany({
    where: { userId: session.user.id },
    orderBy: { weekStartDate: "desc" },
    include: { project: { select: { name: true } } },
  });
  return NextResponse.json({ reports });
}
