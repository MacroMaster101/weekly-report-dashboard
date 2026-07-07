export type SessionRole = "TEAM_MEMBER" | "MANAGER" | "ADMIN";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: SessionRole;
}
