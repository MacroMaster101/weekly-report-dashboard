"use client";
import { useEffect, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

export type Filters = {
  userId: string;
  projectId: string;
  status: string;
  startDate: string;
  endDate: string;
};

type MemberOption = { id: string; name: string; role: string };
type ProjectOption = { id: string; name: string };

export function ReportFilters({ onChange }: { onChange: (f: Filters) => void }) {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [filters, setFilters] = useState<Filters>({ userId: "", projectId: "", status: "", startDate: "", endDate: "" });

  useEffect(() => {
    fetch("/api/manager/members")
      .then((r) => r.json())
      .then((d) => setMembers((d.members ?? []).filter((m: MemberOption) => m.role === "TEAM_MEMBER")));
    fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(d.projects ?? []));
  }, []);

  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange(next);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Select label="Member" value={filters.userId} onChange={(e) => update({ userId: e.target.value })}>
        <option value="">All team members</option>
        {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </Select>
      <Select label="Project" value={filters.projectId} onChange={(e) => update({ projectId: e.target.value })}>
        <option value="">All projects</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </Select>
      <Select label="Status" value={filters.status} onChange={(e) => update({ status: e.target.value })}>
        <option value="">All statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="LATE">Late</option>
      </Select>
      <Input label="From" type="date" value={filters.startDate} onChange={(e) => update({ startDate: e.target.value })} />
      <Input label="To" type="date" value={filters.endDate} onChange={(e) => update({ endDate: e.target.value })} />
    </div>
  );
}
