"use client";
import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { getWeekRange, formatLocalDate } from "@/lib/utils";

export type Filters = {
  userId: string;
  projectId: string;
  status: string;
  startDate: string;
  endDate: string;
};

type MemberOption = { id: string; name: string; role: string };
type ProjectOption = { id: string; name: string };
type WeekOption = { value: string; label: string; startDate: string; endDate: string };

// The last 8 weeks (Mon-Sun), newest first, for the "selected week" quick-pick.
function buildWeekOptions(): WeekOption[] {
  const options: WeekOption[] = [];
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const ref = new Date(now);
    ref.setDate(now.getDate() - i * 7);
    const { start, end } = getWeekRange(ref);
    const label =
      i === 0 ? "This week" :
      i === 1 ? "Last week" :
      `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    options.push({ value: formatLocalDate(start), label, startDate: formatLocalDate(start), endDate: formatLocalDate(end) });
  }
  return options;
}

export function ReportFilters({ onChange }: { onChange: (f: Filters) => void }) {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [week, setWeek] = useState("");
  const [filters, setFilters] = useState<Filters>({ userId: "", projectId: "", status: "", startDate: "", endDate: "" });
  const weekOptions = useMemo(() => buildWeekOptions(), []);

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

  function selectWeek(value: string) {
    setWeek(value);
    const option = weekOptions.find((w) => w.value === value);
    update(option ? { startDate: option.startDate, endDate: option.endDate } : { startDate: "", endDate: "" });
  }

  // Manual date edits switch the week picker back to a custom range.
  function updateDate(patch: Partial<Filters>) {
    setWeek("");
    update(patch);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <Select label="Week" value={week} onChange={(e) => selectWeek(e.target.value)}>
        <option value="">All weeks</option>
        {weekOptions.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
      </Select>
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
        <option value="SUBMITTED">Submitted</option>
        <option value="PENDING">Pending</option>
        <option value="LATE">Late</option>
      </Select>
      <Input label="From" type="date" value={filters.startDate} onChange={(e) => updateDate({ startDate: e.target.value })} />
      <Input label="To" type="date" value={filters.endDate} onChange={(e) => updateDate({ endDate: e.target.value })} />
    </div>
  );
}
