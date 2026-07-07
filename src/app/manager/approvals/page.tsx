"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type PendingUser = {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "ADMIN";
  createdAt: string;
};

export default function ApprovalsPage() {
  const { data: session } = useSession();
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.role === "ADMIN";
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/manager/approvals")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPending(data.pending ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function decide(id: string, decision: "APPROVED" | "REJECTED") {
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/manager/approvals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setBusyId(null);
    if (!res.ok) {
      setError("Could not update this request. It may have already been decided.");
      return;
    }
    setPending((current) => current.filter((u) => u.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
          {isAdmin ? "Admin" : "Manager"}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-fg">Pending Approvals</h1>
        <p className="text-sm font-medium text-muted max-w-2xl">
          Manager and Admin signups are held here until an admin approves them. Team Member accounts are active immediately and never appear on this list.
        </p>
      </div>
      {error && (
        <Card className="border-[var(--status-late-fg)] bg-[var(--status-late-bg)] text-sm font-medium text-[var(--status-late-fg)]">
          {error}
        </Card>
      )}
      {loading ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">Loading requests...</p>
        </Card>
      ) : pending.length === 0 ? (
        <Card className="flex items-center justify-center py-16">
          <p className="text-sm font-medium text-muted">No pending requests.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {pending.map((u) => (
            <Card key={u.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-fg truncate">{u.name}</span>
                  <span className="text-sm text-muted truncate">{u.email}</span>
                </div>
                <span className="inline-flex px-2 py-0.5 rounded-md bg-surface-2 border border-border/50 font-bold text-[10px] text-muted uppercase tracking-wider">
                  Requested {u.role}
                </span>
                <Badge status="PENDING" />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="secondary"
                  disabled={busyId === u.id}
                  onClick={() => decide(u.id, "REJECTED")}
                  className="h-9 min-h-9 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  <X size={13} strokeWidth={2.5} />
                  Reject
                </Button>
                <Button
                  disabled={busyId === u.id}
                  onClick={() => decide(u.id, "APPROVED")}
                  className="h-9 min-h-9 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  <Check size={13} strokeWidth={2.5} />
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
