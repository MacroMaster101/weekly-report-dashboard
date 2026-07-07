"use client";

import { useSyncExternalStore } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { SubmissionStatusPoint } from "@/types/dashboard";
import { useChartColors } from "@/components/charts/useChartColors";

// Recharts' ResponsiveContainer measures the DOM, so render it only after
// hydration to avoid an SSR mismatch. useSyncExternalStore returns false on the
// server and true on the client without a render-triggering effect.
const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

function EmptyChart() {
  return (
    <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted">
      No member status data yet.
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface/90 p-3.5 shadow-md backdrop-blur-md min-w-[140px]">
        <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted">{label}</p>
        <div className="flex flex-col gap-1.5">
          {payload.map((pld) => (
            <div key={pld.name ?? "status"} className="flex items-center justify-between gap-4 text-xs font-bold">
              <div className="flex items-center gap-2 text-fg">
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: pld.fill }} />
                <span className="capitalize">{pld.name}</span>
              </div>
              <span className="font-mono text-accent font-black">{pld.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function SubmissionStatusChart({ data }: { data: SubmissionStatusPoint[] }) {
  const c = useChartColors();
  const mounted = useHydrated();

  if (!mounted) {
    return (
      <div className="h-60 flex items-center justify-center text-xs font-semibold text-muted/60">
        Loading chart...
      </div>
    );
  }

  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }} barSize={16}>
        <CartesianGrid stroke={c.grid || "var(--chart-grid)"} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="member" fontSize={10} tickLine={false} tick={{ fill: c.muted || "var(--muted)" }} />
        <YAxis allowDecimals={false} fontSize={10} tickLine={false} tick={{ fill: c.muted || "var(--muted)" }} />
        <Tooltip content={CustomTooltip} cursor={{ fill: "var(--border-strong)", opacity: 0.1 }} />
        <Legend wrapperStyle={{ color: "var(--muted)", fontSize: 10, fontWeight: "bold", paddingTop: 8 }} iconSize={8} iconType="circle" />
        <Bar dataKey="submitted" stackId="a" fill={c.c1 || "var(--chart-1)"} radius={[0, 0, 0, 0]} />
        <Bar dataKey="late" stackId="a" fill={c.c2 || "var(--chart-2)"} radius={[0, 0, 0, 0]} />
        <Bar dataKey="pending" stackId="a" fill={c.c3 || "var(--chart-3)"} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
