import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6 relative overflow-hidden">
      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-72 h-72 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface/75 shadow-[var(--shadow-lg)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr] relative z-10">
        <section className="hidden border-r border-border bg-gradient-to-b from-surface-2 to-surface/30 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-[#6366f1] text-base font-black text-accent-fg shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
              W
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-muted">Weekly Reports</span>
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-black tracking-tight text-fg leading-tight">Welcome back to the workspace</h2>
            <div className="grid gap-3">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-accent to-[#6366f1]" />
              <div className="h-1.5 w-4/5 rounded-full bg-border-strong/60" />
              <div className="h-1.5 w-3/5 rounded-full bg-border-strong/40" />
            </div>
          </div>
          <p className="text-[11px] font-bold text-faint">Secure access control dashboard system</p>
        </section>
        <section className="flex flex-col justify-center gap-8 p-8 sm:p-12">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-black tracking-tight text-fg bg-gradient-to-r from-fg to-muted bg-clip-text">Sign In</h1>
            <p className="text-sm font-semibold text-muted">Provide your credentials to access dashboards.</p>
          </div>
          <Card className="border-none bg-transparent p-0 shadow-none hover:shadow-none">
            <LoginForm />
          </Card>
          <p className="text-sm font-semibold text-muted border-t border-border/60 pt-5">
            No account? <Link href="/register" className="font-bold text-accent hover:underline">Register</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

