import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6 relative overflow-hidden">
      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background Glows */}
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface/75 shadow-[var(--shadow-lg)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr] relative z-10">
        <section className="hidden border-r border-border bg-gradient-to-b from-surface-2 to-surface/30 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-[#6366f1] text-base font-black text-accent-fg shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
              W
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-muted">Weekly Reports</span>
          </div>
          <div className="rounded-2xl border border-border/80 bg-surface/50 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-fg">Role-based Access</span>
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-accent border border-accent/20">RBAC</span>
            </div>
            <div className="grid gap-2">
              {['Team Member', 'Manager', 'Admin'].map((role) => (
                <div key={role} className="rounded-xl border border-border/40 bg-surface-2/60 px-3 py-2 text-xs font-bold text-muted">{role}</div>
              ))}
            </div>
          </div>
          <p className="text-[11px] font-bold text-faint">Registration includes instant profile setup</p>
        </section>
        <section className="flex flex-col justify-center gap-8 p-8 sm:p-12">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-black tracking-tight text-fg bg-gradient-to-r from-fg to-muted bg-clip-text">Create Account</h1>
            <p className="text-sm font-semibold text-muted">Register to start logging weekly progress.</p>
          </div>
          <Card className="border-none bg-transparent p-0 shadow-none hover:shadow-none">
            <RegisterForm />
          </Card>
          <p className="text-sm font-semibold text-muted border-t border-border/60 pt-5">
            Have an account? <Link href="/login" className="font-bold text-accent hover:underline">Login</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

