import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/session";

// Sets the full list of projects a team member is assigned to. The client sends
// the complete desired set, so we diff against current rows: add the missing
// links, remove the ones no longer selected, and leave the rest untouched.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireManager();
  } catch (e) {
    return e as Response;
  }

  const { id: userId } = await params;

  const body = (await req.json().catch(() => null)) as { projectIds?: unknown } | null;
  if (!body || !Array.isArray(body.projectIds) || !body.projectIds.every((p) => typeof p === "string")) {
    return NextResponse.json({ error: "projectIds must be an array of strings" }, { status: 400 });
  }
  const projectIds = [...new Set(body.projectIds as string[])];

  const member = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Reject unknown project ids so a bad payload can't create orphaned links.
  if (projectIds.length > 0) {
    const found = await prisma.project.count({ where: { id: { in: projectIds } } });
    if (found !== projectIds.length) {
      return NextResponse.json({ error: "One or more projects do not exist" }, { status: 400 });
    }
  }

  const existing = await prisma.userProject.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const existingIds = new Set(existing.map((e) => e.projectId));
  const desiredIds = new Set(projectIds);
  const toAdd = projectIds.filter((pid) => !existingIds.has(pid));
  const toRemove = [...existingIds].filter((pid) => !desiredIds.has(pid));

  await prisma.$transaction([
    ...(toRemove.length > 0
      ? [prisma.userProject.deleteMany({ where: { userId, projectId: { in: toRemove } } })]
      : []),
    ...(toAdd.length > 0
      ? [prisma.userProject.createMany({ data: toAdd.map((projectId) => ({ userId, projectId })) })]
      : []),
  ]);

  const projects = await prisma.userProject.findMany({
    where: { userId },
    select: { projectId: true, project: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ projects });
}
