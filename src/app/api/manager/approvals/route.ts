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
  const [pending, decided] = await Promise.all([
    prisma.user.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["MANAGER", "ADMIN"] },
        approvalStatus: { in: ["APPROVED", "REJECTED"] },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approvalStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  // Seeded/demo admins and managers are created as already-approved users, so
  // they are not approval decisions. A real approved request has a later update
  // timestamp; rejected requests are useful history even before cleanup.
  const history = decided.filter(
    (user) =>
      user.approvalStatus === "REJECTED" ||
      user.updatedAt.getTime() - user.createdAt.getTime() > 1000,
  );

  return NextResponse.json({ pending, history });
}
