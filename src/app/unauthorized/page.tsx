import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-surface/90 p-8 shadow-[var(--shadow-md)] backdrop-blur">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--status-late-bg)] text-[var(--status-late-fg)]">
          <ShieldAlert size={22} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black tracking-tight text-fg">Access denied</h1>
          <p className="text-sm leading-6 text-muted">You do not have permission to access this page.</p>
        </div>
        <Link href="/"><Button variant="secondary">Go home</Button></Link>
      </div>
    </main>
  );
}
