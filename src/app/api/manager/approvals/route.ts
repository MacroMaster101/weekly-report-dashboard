import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// Admin-only: list every account still waiting on a Manager/Admin approval decision.
export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    return e as Response;
  }
  const pending = await prisma.user.findMany({
    where: { approvalStatus: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json({ pending });
}
