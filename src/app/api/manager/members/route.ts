import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/session";

export async function GET() {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const members = await prisma.user.findMany({
    where: { role: "TEAM_MEMBER" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });
  return NextResponse.json({ members });
}