import Link from "next/link";
import { ArrowRight, BarChart3, CalendarCheck2, FolderKanban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6 relative overflow-hidden">
      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background Neon Aura Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-accent/8 opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#6366f1]/8 opacity-20 blur-3xl pointer-events-none" />

      <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center relative z-10">
        <section className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-[#6366f1] text-base font-black text-accent-fg shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
              W
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-muted">Weekly Reports Workspace</span>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-fg sm:text-5xl leading-[1.1] bg-gradient-to-r from-fg via-fg to-[#6366f1] bg-clip-text text-transparent">
              Elevate Team Transparency & Progress.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted font-medium">
              A premium space designed for team members to log structured weekly logs, enabling managers to review workload distribution and track project metrics instantly.
            </p>
          </div>
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <Link href="/login"><Button className="w-full sm:w-auto h-11 px-6 rounded-xl">Get Started <ArrowRight size={16} /></Button></Link>
            <Link href="/register"><Button variant="secondary" className="w-full sm:w-auto h-11 px-6 rounded-xl">Create Account</Button></Link>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-faint border-t border-border/50 pt-5 mt-2">
            <ShieldCheck size={16} className="text-accent" />
            <span>Secure role-based access for team members and managers</span>
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl relative overflow-hidden group hover:border-border-strong/45 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-3xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-border/50 pb-4.5">
            <div>
              <p className="text-sm font-black tracking-tight text-fg">Manager Overview</p>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider mt-0.5">Current Reporting Period</p>
            </div>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-[10px] font-black tracking-wider text-accent border border-accent/20 animate-pulse">LIVE</span>
          </div>
          <div className="grid gap-4 py-5 sm:grid-cols-3">
            {[
              { label: "Submitted", value: "18", Icon: CalendarCheck2, bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/15" },
              { label: "Active Projects", value: "06", Icon: FolderKanban, bg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/15" },
              { label: "Compliance Rate", value: "92%", Icon: BarChart3, bg: "bg-amber-500/10 text-amber-500 border-amber-500/15" },
            ].map(({ label, value, Icon, bg }) => (
              <div key={label} className="rounded-2xl border border-border/65 bg-surface-2/40 p-4 transition-all duration-300 hover:scale-[1.03] hover:border-border-strong/45">
                <div className={`mb-3.5 flex h-8 w-8 items-center justify-center rounded-xl border ${bg}`}>
                  <Icon size={15} strokeWidth={2.5} />
                </div>
                <p className="font-mono text-2xl font-black text-fg leading-none tracking-tight">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-2">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-border/65 bg-surface-2/40 p-4 flex flex-col justify-between">
              <div className="mb-6 flex items-end gap-2.5 h-20">
                {[36, 62, 54, 78, 70, 88, 82].map((height, index) => (
                  <span
                    key={index}
                    className="w-full rounded-t-lg bg-gradient-to-t from-accent to-[#6366f1] transition-transform duration-500 hover:scale-y-105"
                    style={{ height: `${height}%` }}
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Weekly Submission Trend</p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-border/65 bg-surface-2/40 p-4">
              {["Client A Redesign", "R&D Cloud Migration", "Marketing Hub"].map((project, index) => (
                <div key={project} className="flex items-center justify-between rounded-xl border border-border/40 bg-surface/80 px-3.5 py-2.5 shadow-sm hover:border-accent/40 transition-colors">
                  <span className="text-xs font-bold text-fg truncate max-w-[120px]">{project}</span>
                  <span className="font-mono text-xs font-bold text-muted">{index + 5} hrs</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

