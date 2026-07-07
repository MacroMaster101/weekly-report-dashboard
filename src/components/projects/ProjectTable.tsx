"use client";
import { Pencil, Trash2, FolderKanban, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  reportsCount?: number;
  membersCount?: number;
};

export function ProjectTable({
  projects,
  onEdit,
  onDelete,
}: {
  projects: ProjectRow[];
  onEdit: (p: ProjectRow) => void;
  onDelete: (p: ProjectRow) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/80 bg-surface/40 shadow-sm backdrop-blur-md">
      <table className="min-w-[800px] w-full table-fixed text-left text-xs font-semibold leading-normal">
        <thead>
          <tr className="border-b border-border bg-surface-2/65 text-muted uppercase tracking-wider text-[10px] font-black">
            <th className="w-64 px-6 py-4">Name</th>
            <th className="px-6 py-4">Description</th>
            <th className="w-36 px-6 py-4 text-center">Team Members</th>
            <th className="w-36 px-6 py-4 text-center">Reports Logged</th>
            <th className="w-56 px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {projects.map((p) => (
            <tr key={p.id} className="align-middle text-fg transition-all duration-200 hover:bg-surface-2/30">
              <td className="truncate px-6 py-4 text-sm font-black text-fg">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onEdit(p)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-500/15 text-indigo-400 bg-indigo-500/10 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                    title="Edit project"
                  >
                    <FolderKanban size={14} strokeWidth={2.2} />
                  </button>
                  <span className="truncate">{p.name}</span>
                </div>
              </td>
              <td className="truncate px-6 py-4 text-muted text-xs font-medium">
                {p.description || (
                  <span className="italic text-faint font-normal">No description provided</span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2/40 px-2.5 py-1 text-xs font-bold text-fg border border-border/20">
                  <Users size={12} className="text-muted animate-pulse" />
                  {p.membersCount ?? 0}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2/40 px-2.5 py-1 text-xs font-bold text-fg border border-border/20">
                  <FileText size={12} className="text-muted" />
                  {p.reportsCount ?? 0}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="h-8 min-h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-wider"
                    onClick={() => onEdit(p)}
                  >
                    <Pencil size={11} strokeWidth={2.5} />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="h-8 min-h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 shadow-none"
                    onClick={() => onDelete(p)}
                  >
                    <Trash2 size={11} strokeWidth={2.5} />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

