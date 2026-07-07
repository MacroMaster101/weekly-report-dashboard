"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ProjectTable, type ProjectRow } from "@/components/projects/ProjectTable";

type Project = ProjectRow;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.projects ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProjects(data.projects ?? []);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Manager</p>
          <h1 className="text-3xl font-black tracking-tight text-fg">Projects</h1>
        </div>
        <Button onClick={() => { setEditing(undefined); setOpen(true); }}>
          <Plus size={16} />
          Add Project
        </Button>
      </div>
      {error && (
        <Card className="border-[var(--status-late-fg)] bg-[var(--status-late-bg)] text-sm font-medium text-[var(--status-late-fg)]">
          {error}
        </Card>
      )}
      {projects.length === 0 ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">No projects yet.</p>
        </Card>
      ) : (
        <Card className="p-0">
          <ProjectTable projects={projects} onEdit={(p) => { setEditing(p); setOpen(true); }} onDelete={setDeleteTarget} />
        </Card>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Project" : "Add Project"}>
        <ProjectForm initial={editing} onSaved={() => { setOpen(false); load(); }} />
      </Modal>
      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Project">
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-6 text-muted">
            Delete <span className="font-semibold text-fg">{deleteTarget?.name}</span>? Projects with existing reports are protected so report history stays intact.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={remove}>
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
