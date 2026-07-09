import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// Admin-only account cleanup. Deleting a user also removes their reports and
// project assignments through the schema's cascade relations.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireAdmin();
  } catch (e) {
    return e as Response;
  }

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (existing.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", approvalStatus: "APPROVED" },
    });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "The last admin account cannot be deleted" }, { status: 400 });
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}