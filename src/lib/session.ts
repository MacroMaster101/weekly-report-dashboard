import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isManagerRole } from "@/lib/permissions";

export async function getSession() {
  return getServerSession(authOptions);
}

// Throws the actual Response instead of a plain Error so route handlers can
// `return e as Response` directly from their catch block (see any api/ route).
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
