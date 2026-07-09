"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clock3, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

type PendingUser = {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "ADMIN";
  createdAt: string;
};

type ApprovalHistoryUser = PendingUser & {
  approvalStatus: "APPROVED" | "REJECTED";
  updatedAt: string;
};

function approvalPill(status: ApprovalHistoryUser["approvalStatus"]) {
  const isApproved = status === "APPROVED";
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-3 text-[10px] font-black uppercase tracking-wider ${
        isApproved
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          : "border-rose-500/25 bg-rose-500/10 text-rose-400"
      }`}
    >
      {isApproved ? "Approved" : "Rejected"}
    </span>
  );
}

export default function ApprovalsPage() {
  const { data: session } = useSession();
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [history, setHistory] = useState<ApprovalHistoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadApprovals = useCallback(async () => {
    const res = await fetch("/api/manager/approvals");
    const data = await res.json();
    setPending(data.pending ?? []);
    setHistory(data.history ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadApprovals()
      .catch(() => {
        if (!cancelled) setError("Could not load approval requests.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadApprovals]);

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
    await loadApprovals();
  }

  async function deleteRejectedUser(user: ApprovalHistoryUser) {
    if (user.approvalStatus !== "REJECTED") return;
    const confirmed = window.confirm(`Delete rejected account for ${user.name}?`);
    if (!confirmed) return;

    setDeletingId(user.id);
    setError("");
    const res = await fetch(`/api/manager/members/${user.id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not delete this account.");
      return;
    }
    setHistory((current) => current.filter((item) => item.id !== user.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
            {isAdmin ? "Admin" : "Manager"}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-fg">Pending Approvals</h1>
          <p className="text-sm font-medium text-muted max-w-2xl">
            Manager and Admin signups are held here until an admin approves them. Team Member accounts are active immediately and never appear on this list.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setHistoryOpen(true)}
          className="h-10 rounded-xl px-4 text-xs font-black uppercase tracking-wider"
        >
          <Clock3 size={14} strokeWidth={2.5} />
          History
        </Button>
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
              <div className="flex flex-wrap items-center gap-3 min-w-0">
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

      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Approval History"
        className="max-w-3xl"
      >
        {history.length === 0 ? (
          <p className="py-8 text-center text-sm font-medium text-muted">No approval decisions yet.</p>
        ) : (
          <div className="flex max-h-[60vh] flex-col divide-y divide-border/60 overflow-y-auto rounded-xl border border-border/70">
            {history.map((u) => (
              <div key={u.id} className="flex flex-col gap-3 bg-surface/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-fg">{u.name}</span>
                    {approvalPill(u.approvalStatus)}
                    <span className="inline-flex px-2 py-0.5 rounded-md bg-surface-2 border border-border/50 font-bold text-[10px] text-muted uppercase tracking-wider">
                      {u.role}
                    </span>
                  </div>
                  <span className="truncate text-sm text-muted">{u.email}</span>
                  <span className="text-[11px] font-semibold text-faint">
                    Decided {new Date(u.updatedAt).toLocaleString()}
                  </span>
                </div>
                {u.approvalStatus === "REJECTED" ? (
                  <Button
                    type="button"
                    variant="danger"
                    disabled={deletingId === u.id}
                    onClick={() => deleteRejectedUser(u)}
                    className="h-9 min-h-9 shrink-0 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    <Trash2 size={13} strokeWidth={2.5} />
                    Delete
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-muted">Active account</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}