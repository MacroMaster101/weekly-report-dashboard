"use client";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type ProjectRow = { id: string; name: string; description: string | null };

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
      <table className="min-w-[720px] w-full table-fixed text-left text-xs font-semibold leading-normal">
        <thead>
          <tr className="border-b border-border bg-surface-2/65 text-muted uppercase tracking-wider text-[10px] font-black">
            <th className="w-52 px-6 py-4">Name</th>
            <th className="px-6 py-4">Description</th>
            <th className="w-56 px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {projects.map((p) => (
            <tr key={p.id} className="align-middle text-fg transition-all duration-200 hover:bg-surface-2/30">
              <td className="truncate px-6 py-4 text-sm font-black text-fg">{p.name}</td>
              <td className="truncate px-6 py-4 text-muted text-xs font-medium">{p.description || "-"}</td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Button variant="secondary" className="h-9 min-h-9 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider" onClick={() => onEdit(p)}>
                    <Pencil size={13} strokeWidth={2.5} />
                    Edit
                  </Button>
                  <Button variant="danger" className="h-9 min-h-9 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 shadow-none" onClick={() => onDelete(p)}>
                    <Trash2 size={13} strokeWidth={2.5} />
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

