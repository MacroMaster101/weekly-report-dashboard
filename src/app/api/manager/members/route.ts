import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireManager, requireAdmin } from "@/lib/session";

const ROLES = ["TEAM_MEMBER", "MANAGER", "ADMIN"] as const;

function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}

export async function GET() {
  let session;
  try {
    session = await requireManager();
  } catch (e) {
    return e as Response;
  }

  // Admins see every active approved account (they manage roles); managers
  // only see approved team members whose reports they review. Pending and
  // rejected signups belong on the Approvals screens, not the active Team list.
  const members = await prisma.user.findMany({
    where: session.user.role === "ADMIN"
      ? { approvalStatus: "APPROVED" }
      : { role: "TEAM_MEMBER", approvalStatus: "APPROVED" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      approvalStatus: true,
      projects: {
        select: {
          projectId: true,
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  return NextResponse.json({ members });
}

export async function PATCH(req: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch (e) {
    return e as Response;
  }

  try {
    const body = (await req.json().catch(() => null)) as { userId?: unknown; role?: unknown } | null;
    const userId = typeof body?.userId === "string" ? body.userId : "";
    const role = body?.role;

    if (!userId || !isRole(role)) {
      return NextResponse.json({ error: "Invalid member role update" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Lockout guards: existing admins cannot be demoted (including by other
    // admins), and an admin cannot strip their own role — so the system can
    // never end up with zero admins.
    if (existing.role === "ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "Admin role changes are protected" }, { status: 400 });
    }

    if (existing.id === session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "You cannot remove your own admin role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
