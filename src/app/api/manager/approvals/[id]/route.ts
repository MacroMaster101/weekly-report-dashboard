import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const DECISIONS = ["APPROVED", "REJECTED"] as const;

// Admin-only: approve or reject a pending Manager/Admin signup request.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    return e as Response;
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const decision = body?.decision;
  if (!DECISIONS.includes(decision)) {
    return NextResponse.json({ error: "decision must be APPROVED or REJECTED" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.approvalStatus !== "PENDING") {
    return NextResponse.json({ error: "Request has already been decided" }, { status: 409 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { approvalStatus: decision },
    select: { id: true, name: true, email: true, role: true, approvalStatus: true },
  });
  return NextResponse.json({ user });
}
