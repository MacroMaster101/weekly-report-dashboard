// Roles are compared as plain strings (not the Prisma Role enum) because the
// NextAuth session/JWT types (src/types/next-auth.d.ts) type `role` as string.
export function isManagerRole(role: string): boolean {
  return role === "MANAGER" || role === "ADMIN";
}

export function isTeamMemberRole(role: string): boolean {
  return role === "TEAM_MEMBER";
}

// Only Admins (not Managers) can approve/reject pending Manager/Admin signups.
export function isAdminRole(role: string): boolean {
  return role === "ADMIN";
}
