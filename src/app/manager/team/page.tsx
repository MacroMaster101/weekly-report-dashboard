"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Member = { id: string; name: string; role: string };
type ReportStatus = "DRAFT" | "SUBMITTED" | "LATE";
type TeamReport = { userId: string; status: ReportStatus };

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [reports, setReports] = useState<TeamReport[]>([]);

  useEffect(() => {
    fetch("/api/manager/members").then((r) => r.json()).then((d) => setMembers(d.members ?? []));
    fetch("/api/reports").then((r) => r.json()).then((d) => setReports(d.reports ?? []));
  }, []);

  function statsFor(userId: string) {
    const own = reports.filter((r) => r.userId === userId);
    const latest = own[0];
    return { count: own.length, latest: latest?.status };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Manager</p>
        <h1 className="text-3xl font-black tracking-tight text-fg">Team</h1>
      </div>
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full table-fixed text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Name</th>
                <th className="w-40 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Role</th>
                <th className="w-28 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Reports</th>
                <th className="w-40 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Latest status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const s = statsFor(m.id);
                return (
                  <tr key={m.id} className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-2">
                    <td className="truncate px-5 py-4 font-semibold text-fg">{m.name}</td>
                    <td className="px-5 py-4 text-muted">{m.role}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-fg">{s.count}</td>
                    <td className="px-5 py-4">{s.latest ? <Badge status={s.latest} /> : <span className="text-faint">-</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
