"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Trash2, Search, LayoutGrid, List, FolderKanban, Activity, FileText, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ProjectTable, type ProjectRow } from "@/components/projects/ProjectTable";
import { ProjectGrid } from "@/components/projects/ProjectGrid";

type Project = ProjectRow;

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const isAdmin = session?.user?.role === "ADMIN";
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalReports: 0,
    totalMembers: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects ?? []);
      if (data.stats) {
        setStats(data.stats);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setProjects(data.projects ?? []);
        if (data.stats) setStats(data.stats);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove() {
    if (!deleteTarget) return;
    setError("");
    const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Project could not be deleted.");
      setDeleteTarget(null);
      return;
    }
    setDeleteTarget(null);
    load();
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
            {isAdmin ? "Admin" : "Manager"}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-fg">Projects</h1>
        </div>
        <Button onClick={() => { setEditing(undefined); setOpen(true); }} className="shadow-lg">
          <Plus size={16} />
          Add Project
        </Button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Projects", value: stats.totalProjects, Icon: FolderKanban, gradient: "from-indigo-500/20 to-blue-500/10 text-indigo-500 border-indigo-500/20" },
          { label: "Active Projects", value: stats.activeProjects, Icon: Activity, gradient: "from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/20" },
          { label: "Reports Logged", value: stats.totalReports, Icon: FileText, gradient: "from-amber-500/20 to-yellow-500/10 text-amber-500 border-amber-500/20" },
          { label: "Contributors", value: stats.totalMembers, Icon: Users, gradient: "from-rose-500/20 to-pink-500/10 text-rose-500 border-rose-500/20" },
        ].map(({ label, value, Icon, gradient }) => (
          <Card key={label} className="relative overflow-hidden p-0 border border-border/80 hover:border-accent-soft hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex h-full flex-col justify-between gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-wider text-muted">{label}</p>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-tr ${gradient} shadow-sm`}>
                  <Icon size={14} strokeWidth={2.5} />
                </span>
              </div>
              <p className="font-mono text-2xl font-black leading-none text-fg tracking-tight">{value}</p>
            </div>
            <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent to-[#6366f1]" aria-hidden />
          </Card>
        ))}
      </div>

      {/* Toolbar: Search, Layout Toggle */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between border-t border-border/50 pt-5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface/50 border border-border rounded-xl focus:outline-none focus:border-accent focus:bg-surface/85 focus:ring-2 focus:ring-accent-soft/80 transition-all duration-300"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2/40 p-1.5 self-end sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer ${viewMode === "grid" ? "bg-surface text-accent shadow-sm border border-border/40" : "text-muted hover:text-fg"}`}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer ${viewMode === "table" ? "bg-surface text-accent shadow-sm border border-border/40" : "text-muted hover:text-fg"}`}
            title="Table View"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-[var(--status-late-fg)] bg-[var(--status-late-bg)] text-sm font-medium text-[var(--status-late-fg)]">
          {error}
        </Card>
      )}

      {/* Project Listings */}
      {projects.length === 0 ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">No projects created yet.</p>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">No projects match your search query.</p>
        </Card>
      ) : viewMode === "grid" ? (
        <ProjectGrid
          projects={filteredProjects}
          onEdit={(p) => { setEditing(p); setOpen(true); }}
          onDelete={setDeleteTarget}
        />
      ) : (
        <ProjectTable
          projects={filteredProjects}
          onEdit={(p) => { setEditing(p); setOpen(true); }}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Project" : "Add Project"}>
        <ProjectForm initial={editing} onSaved={() => { setOpen(false); load(); }} />
      </Modal>

      {/* Delete Modal */}
      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Project">
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-6 text-muted">
            Are you sure you want to delete <span className="font-semibold text-fg">{deleteTarget?.name}</span>? Projects with existing reports are protected so report history stays intact.
          </p>
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={remove}>
              <Trash2 size={16} />
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
