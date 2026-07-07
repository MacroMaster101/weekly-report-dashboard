const styles: Record<string, { bg: string; fg: string; border: string }> = {
  DRAFT: { 
    bg: "var(--status-draft-bg)", 
    fg: "var(--status-draft-fg)",
    border: "rgba(148, 163, 184, 0.25)" 
  },
  SUBMITTED: { 
    bg: "var(--status-submitted-bg)", 
    fg: "var(--status-submitted-fg)",
    border: "rgba(16, 185, 129, 0.25)" 
  },
  LATE: { 
    bg: "var(--status-late-bg)", 
    fg: "var(--status-late-fg)",
    border: "rgba(239, 68, 68, 0.25)" 
  },
  PENDING: { 
    bg: "var(--status-pending-bg)", 
    fg: "var(--status-pending-fg)",
    border: "rgba(245, 158, 11, 0.25)" 
  },
};

export function Badge({
  status,
}: {
  status: "DRAFT" | "SUBMITTED" | "LATE" | "PENDING";
}) {
  const { bg, fg, border } = styles[status] ?? styles.DRAFT;
  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 rounded-full border px-3 text-[10px] font-black uppercase tracking-wider transition-all duration-300"
      style={{ backgroundColor: bg, color: fg, borderColor: border }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: fg }}
        aria-hidden
      />
      {status}
    </span>
  );
}

