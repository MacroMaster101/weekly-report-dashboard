"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Project = { id: string; name: string; description: string | null };

export function ProjectForm({ initial, onSaved }: { initial?: Project; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = initial ? `/api/projects/${initial.id}` : "/api/projects";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Project could not be saved. Check the project name and try again.");
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      {error && <p className="rounded-lg bg-[var(--status-late-bg)] px-3 py-2 text-sm font-medium text-[var(--status-late-fg)]">{error}</p>}
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={loading}>
          <Save size={16} />
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
