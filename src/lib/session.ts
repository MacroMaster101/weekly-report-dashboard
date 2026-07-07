import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isManagerRole, isTeamMemberRole } from "@/lib/permissions";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  return session;
}

export async function requireManager() {
  const session = await requireSession();
  if (!isManagerRole(session.user.role)) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  return session;
}

export async function requireTeamMember() {
  const session = await requireSession();
  if (!isTeamMemberRole(session.user.role)) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  return session;
}