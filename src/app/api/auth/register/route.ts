import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  // Team Member accounts are usable immediately; Manager/Admin requests need
  // an existing Admin to approve them first (see /manager/approvals + auth.ts).
  const approvalStatus = role === "TEAM_MEMBER" ? "APPROVED" : "PENDING";

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, approvalStatus },
    select: { id: true, name: true, email: true, role: true, approvalStatus: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
