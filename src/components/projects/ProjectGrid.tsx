"use client";
import { Pencil, Trash2, FolderKanban, Users, FileText } from "lucide-react";

export type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  reportsCount?: number;
  membersCount?: number;
};

export function ProjectGrid({
  projects,
  onEdit,
  onDelete,
}: {
  projects: ProjectRow[];
  onEdit: (p: ProjectRow) => void;
  onDelete: (p: ProjectRow) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => {
        // Compute colors/gradients based on the project ID hash or index for premium aesthetics
        const gradients = [
          "from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/15 text-indigo-400 bg-indigo-500/10",
          "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/15 text-emerald-400 bg-emerald-500/10",
          "from-amber-500/10 via-yellow-500/5 to-transparent border-amber-500/15 text-amber-400 bg-amber-500/10",
          "from-rose-500/10 via-pink-500/5 to-transparent border-rose-500/15 text-rose-400 bg-rose-500/10",
          "from-sky-500/10 via-blue-500/5 to-transparent border-sky-500/15 text-sky-400 bg-sky-500/10",
        ];
        // Hash ID to get a deterministic index
        const index = p.name.charCodeAt(0) % gradients.length;
        const colorStyle = gradients[index];

        return (
          <div
            key={p.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface/40 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-surface/65 hover:shadow-md"
          >
            {/* Top glowing glow background effect */}
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-accent/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

            <div className="flex flex-col gap-3">
              {/* Header: Icon & Action shortcuts */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onEdit(p)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${colorStyle}`}
                  title="Edit project"
                >
                  <FolderKanban size={18} strokeWidth={2.2} />
                </button>
                
                {/* Micro Actions Menu */}
                <div className="flex gap-1.5 opacity-60 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(p)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-2/45 text-muted hover:border-accent/45 hover:text-accent transition-all duration-200 cursor-pointer"
                    title="Edit project"
                  >
                    <Pencil size={12} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-2/45 text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-black tracking-tight text-fg group-hover:text-accent transition-colors duration-200">
                  {p.name}
                </h3>
                <p className="line-clamp-2 min-h-[2.5rem] text-xs font-medium leading-relaxed text-muted">
                  {p.description || (
                    <span className="italic text-faint font-normal">No description provided.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Bottom Stats Section */}
            <div className="mt-5 flex items-center gap-3 border-t border-border/40 pt-4">
              <div className="flex items-center gap-1.5 rounded-lg bg-surface-2/30 px-2.5 py-1.5 border border-border/20">
                <Users size={12} className="text-muted" />
                <span className="text-[10px] font-bold text-fg">
                  {p.membersCount ?? 0} {p.membersCount === 1 ? "member" : "members"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-surface-2/30 px-2.5 py-1.5 border border-border/20">
                <FileText size={12} className="text-muted" />
                <span className="text-[10px] font-bold text-fg">
                  {p.reportsCount ?? 0} {p.reportsCount === 1 ? "report" : "reports"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
