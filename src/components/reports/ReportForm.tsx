"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type Project = { id: string; name: string };
type Initial = {
  id?: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string;
  hoursWorked: string;
  notes: string;
};

const empty: Initial = {
  projectId: "",
  weekStartDate: "",
  weekEndDate: "",
  tasksCompleted: "",
  tasksPlanned: "",
  blockers: "",
  hoursWorked: "",
  notes: "",
};

export function ReportForm({ initial, projects }: { initial?: Initial; projects: Project[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial ?? empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof Initial>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Both buttons persist the report first (create or update); "Submit Report"
  // then calls the submit endpoint, which locks the report permanently.
  async function save(submitAfter: boolean) {
    setLoading(true);
    setError("");
    const payload = {
      ...form,
      hoursWorked: form.hoursWorked === "" ? undefined : Number(form.hoursWorked),
    };
    const url = form.id ? `/api/reports/${form.id}` : "/api/reports";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setLoading(false);
      setError("Failed to save. Check required fields and date range.");
      return;
    }
    const data = await res.json();
    const id = form.id ?? data.report.id;
    if (submitAfter) {
      const submitRes = await fetch(`/api/reports/${id}/submit`, { method: "POST" });
      if (!submitRes.ok) {
        setLoading(false);
        setError("Saved as draft, but submit failed. Try submitting from history.");
        return;
      }
    }
    setLoading(false);
    router.push("/member/history");
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Week start date" type="date" value={form.weekStartDate} onChange={(e) => set("weekStartDate", e.target.value)} required />
        <Input label="Week end date" type="date" value={form.weekEndDate} onChange={(e) => set("weekEndDate", e.target.value)} required />
      </div>
      <Select label="Project / category" value={form.projectId} onChange={(e) => set("projectId", e.target.value)} required>
        <option value="">Select a project</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </Select>
      <div className="grid gap-4 lg:grid-cols-2">
        <Textarea label="Tasks completed" value={form.tasksCompleted} onChange={(e) => set("tasksCompleted", e.target.value)} required />
        <Textarea label="Tasks planned for next week" value={form.tasksPlanned} onChange={(e) => set("tasksPlanned", e.target.value)} required />
      </div>
      <Textarea label="Blockers / challenges" value={form.blockers} onChange={(e) => set("blockers", e.target.value)} />
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <Input label="Hours worked" type="number" min={0} value={form.hoursWorked} onChange={(e) => set("hoursWorked", e.target.value)} />
        <Textarea label="Notes / links" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      {error && <p className="rounded-lg bg-[var(--status-late-bg)] px-3 py-2 text-sm font-medium text-[var(--status-late-fg)]">{error}</p>}
      <div className="grid gap-3 border-t border-border pt-5 sm:flex sm:justify-end">
        <Button type="button" variant="secondary" disabled={loading} onClick={() => save(false)}>
          <Save size={16} />
          Save Draft
        </Button>
        <Button type="button" disabled={loading} onClick={() => save(true)}>
          <Send size={16} />
          Submit Report
        </Button>
      </div>
    </form>
  );
}
