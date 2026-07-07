import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

const elevatedSignupAllowed = process.env.ALLOW_PUBLIC_ELEVATED_SIGNUP === "true";

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

  const userCount = await prisma.user.count();
  const requiresApproval = role !== "TEAM_MEMBER" && userCount > 0 && !elevatedSignupAllowed;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      approvalStatus: requiresApproval ? "PENDING" : "APPROVED",
    },
    select: { id: true, name: true, email: true, role: true, approvalStatus: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}