"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FolderCog, Search, Trash2 } from "lucide-react";

type Role = "TEAM_MEMBER" | "MANAGER" | "ADMIN";
type RoleFilter = "" | Role;
type ProjectOption = { id: string; name: string };
type MemberProject = { projectId: string; project: { id: string; name: string } };
type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  projects?: MemberProject[];
};
type ReportStatus = "DRAFT" | "SUBMITTED" | "LATE";
type TeamReport = { userId: string; status: ReportStatus };

const roleOptions: { value: RoleFilter; label: string }[] = [
  { value: "", label: "All roles" },
  { value: "TEAM_MEMBER", label: "Team Member" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
];

function roleLabel(role: Role) {
  return role.replace("_", " ");
}

export default function TeamPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [reports, setReports] = useState<TeamReport[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("");
  const [assigning, setAssigning] = useState<Member | null>(null);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [savingAssign, setSavingAssign] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetch("/api/manager/members").then((r) => r.json()).then((d) => setMembers(d.members ?? []));
    fetch("/api/reports").then((r) => r.json()).then((d) => setReports(d.reports ?? []));
    fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(d.projects ?? []));
  }, []);

  async function reloadMembers() {
    const data = await fetch("/api/manager/members").then((r) => r.json());
    setMembers(data.members ?? []);
  }

  async function handleRoleChange(userId: string, currentRole: Role, newRole: Role) {
    if (currentRole === "ADMIN" && newRole !== "ADMIN") {
      alert("Admin role changes are protected.");
      return;
    }
    if (currentRole === newRole) return;

    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
    );

    try {
      const res = await fetch("/api/manager/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Failed to update role");
        await reloadMembers();
      }
    } catch {
      alert("An error occurred while updating the role");
      await reloadMembers();
    }
  }

  function openAssign(member: Member) {
    setAssigning(member);
    setAssignedIds(new Set((member.projects ?? []).map((p) => p.projectId)));
  }

  function toggleAssigned(projectId: string) {
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  async function deleteUser(member: Member) {
    if (member.id === session?.user?.id) {
      alert("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${member.name}? This also removes their reports and project assignments.`,
    );
    if (!confirmed) return;

    setDeletingId(member.id);
    try {
      const res = await fetch(`/api/manager/members/${member.id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to delete user");
        return;
      }
      setMembers((current) => current.filter((m) => m.id !== member.id));
      setReports((current) => current.filter((report) => report.userId !== member.id));
    } catch {
      alert("An error occurred while deleting the user");
    } finally {
      setDeletingId(null);
    }
  }
  async function saveAssignments() {
    if (!assigning) return;
    setSavingAssign(true);
    try {
      const res = await fetch(`/api/manager/members/${assigning.id}/projects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: [...assignedIds] }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to update assignments");
        return;
      }
      await reloadMembers();
      setAssigning(null);
    } catch {
      alert("An error occurred while updating assignments");
    } finally {
      setSavingAssign(false);
    }
  }

  function statsFor(userId: string) {
    const own = reports.filter((r) => r.userId === userId);
    const latest = own[0];
    return { count: own.length, latest: latest?.status };
  }

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !selectedProjectId || m.projects?.some((p) => p.projectId === selectedProjectId);
    const matchesRole = !selectedRole || m.role === selectedRole;
    return matchesSearch && matchesProject && matchesRole;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
          {isAdmin ? "Admin" : "Manager"}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-fg">Team</h1>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 border border-border/80">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Search Member</span>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="text"
                placeholder="Search team members by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-surface/50 border border-border rounded-xl focus:outline-none focus:border-accent focus:bg-surface/85 focus:ring-2 focus:ring-accent-soft/80 transition-all duration-300 min-h-10"
              />
            </div>
          </div>
          <Select
            label="Project Filter"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select
            label="Role Filter"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as RoleFilter)}
          >
            {roleOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="p-0 border border-border/80 bg-surface/40 backdrop-blur-md">
        <div className="overflow-x-auto rounded-2xl">
          <table className="min-w-[900px] w-full table-fixed text-left text-xs font-semibold leading-normal">
            <thead>
              <tr className="border-b border-border bg-surface-2/65 text-muted uppercase tracking-wider text-[10px] font-black">
                <th className="w-56 px-6 py-4">Name</th>
                <th className="w-36 px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Projects</th>
                <th className="w-28 px-6 py-4 text-center">Reports</th>
                <th className="w-36 px-6 py-4">Latest status</th>
                {isAdmin && <th className="w-24 px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMembers.map((m) => {
                const s = statsFor(m.id);
                const adminRoleLocked = m.role === "ADMIN";
                return (
                  <tr key={m.id} className="align-middle text-fg transition-all duration-200 hover:bg-surface-2/30">
                    <td className="px-6 py-4">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-black text-fg text-sm">{m.name}</span>
                        <span className="truncate text-[11px] font-semibold text-faint">{m.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <select
                          value={m.role}
                          disabled={adminRoleLocked}
                          title={adminRoleLocked ? "Admin role changes are protected" : "Change role"}
                          onChange={(e) => handleRoleChange(m.id, m.role, e.target.value as Role)}
                          className={`bg-surface border border-border/80 rounded-xl text-[10px] font-black uppercase tracking-wider px-2.5 py-1 text-fg focus:outline-none focus:border-accent hover:border-accent/40 transition-colors duration-200 ${adminRoleLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                        >
                          <option value="TEAM_MEMBER">Team Member</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        <span className="text-muted text-[10px] font-black uppercase tracking-wider">
                          {roleLabel(m.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {m.projects && m.projects.length > 0 ? (
                            m.projects.map((p) => (
                              <span key={p.projectId} className="inline-flex px-2 py-0.5 rounded-md bg-surface border border-border/60 font-bold text-[9px] text-muted uppercase tracking-wider">
                                {p.project.name}
                              </span>
                            ))
                          ) : (
                            <span className="italic text-faint text-xs font-normal">Unassigned</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => openAssign(m)}
                          title="Manage project assignments"
                          className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-faint transition-all duration-200 hover:bg-surface-2 hover:text-accent hover:scale-105 active:scale-95"
                        >
                          <FolderCog size={15} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-black text-center text-fg text-sm">{s.count}</td>
                    <td className="px-6 py-4">
                      {s.latest ? <Badge status={s.latest} /> : <span className="text-faint">-</span>}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => deleteUser(m)}
                          disabled={deletingId === m.id || m.id === session?.user?.id}
                          title={m.id === session?.user?.id ? "You cannot delete your own account" : "Delete user"}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2/45 text-muted transition-all duration-200 hover:border-[var(--status-late-fg)]/45 hover:text-[var(--status-late-fg)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-muted font-bold text-sm">
                    No members match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={assigning !== null}
        onClose={() => setAssigning(null)}
        title={assigning ? `Assign Projects — ${assigning.name}` : "Assign Projects"}
      >
        <div className="flex flex-col gap-4">
          {projects.length === 0 ? (
            <p className="text-sm text-muted">No projects exist yet. Create a project first.</p>
          ) : (
            <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
              {projects.map((p) => {
                const checked = assignedIds.has(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-surface/50 px-4 py-2.5 text-sm font-semibold text-fg transition-colors duration-200 hover:border-accent/40 hover:bg-surface-2/40"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAssigned(p.id)}
                      className="h-4 w-4 accent-accent"
                    />
                    <span>{p.name}</span>
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="ghost" type="button" onClick={() => setAssigning(null)} disabled={savingAssign}>
              Cancel
            </Button>
            <Button type="button" onClick={saveAssignments} disabled={savingAssign || projects.length === 0}>
              {savingAssign ? "Saving..." : "Save Assignments"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
