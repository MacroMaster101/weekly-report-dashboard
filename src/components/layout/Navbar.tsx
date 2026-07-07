"use client";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "";
  const initial = name.charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-surface/75 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-[#6366f1] text-sm font-black text-accent-fg shadow-[0_2px_8px_rgba(99,102,241,0.3)] transition-transform duration-300 hover:rotate-12">
            W
          </span>
          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-sm font-extrabold tracking-tight text-fg bg-gradient-to-r from-fg to-muted bg-clip-text">
              Weekly Reports
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-faint leading-none">
              Team reporting workspace
            </span>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div className="hidden items-center gap-2.5 rounded-xl border border-border bg-surface-2/60 px-3 py-1.5 sm:flex shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-accent to-[#6366f1] text-xs font-black text-accent-fg">
              {initial}
            </span>
            <div className="flex min-w-0 flex-col leading-none">
              <span className="max-w-36 truncate text-xs font-bold text-fg">{name}</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-muted mt-0.5">{session?.user?.role?.replace("_", " ")}</span>
            </div>
          </div>
          <Button variant="secondary" className="px-3 min-h-9 h-9 rounded-xl" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

