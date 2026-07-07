import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { requireSession, requireManager } from "@/lib/session";

export async function GET() {
  try {
    await requireSession();
  } catch (e) {
    return e as Response;
  }
  const projects = await prisma.project.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }
  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const project = await prisma.project.create({ data: parsed.data });
  return NextResponse.json({ project }, { status: 201 });
}
