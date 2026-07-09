"use client";

import { useSyncExternalStore } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ProjectDistributionPoint } from "@/types/dashboard";
import { useChartColors } from "@/components/charts/useChartColors";

// Recharts' ResponsiveContainer measures the DOM, so render it only after
// hydration to avoid an SSR mismatch. useSyncExternalStore returns false on the
// server and true on the client without a render-triggering effect.
const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

function EmptyChart() {
  return (
    <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted">
      No project data yet.
    </div>
  );
}

const CustomTooltip = ({ active, payload }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ProjectDistributionPoint;
    return (
      <div className="rounded-2xl border border-border bg-surface/90 p-3.5 shadow-md backdrop-blur-md">
        <p className="mb-1 text-xs font-black text-fg">{data.project}</p>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: payload[0].fill }} />
          <span className="text-muted">Reports:</span>
          <span className="font-mono text-accent font-black">{data.count}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function ProjectDistributionChart({ data }: { data: ProjectDistributionPoint[] }) {
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

  // Show the top projects individually. Aggregating the tail into an "Others"
  // bar dwarfed the real bars (18 small projects summed to ~14x the largest),
  // making the distribution unreadable.
  const chartData = [...data].sort((a, b) => b.count - a.count).slice(0, 8);

  const colors = [
    c.c1 || "var(--chart-1)",
    c.c4 || "var(--chart-4)",
    c.c5 || "var(--chart-5)",
    c.c6 || "var(--chart-6)",
    c.c3 || "var(--chart-3)",
    c.c2 || "var(--chart-2)",
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <XAxis type="number" hide />
        <YAxis
          dataKey="project"
          type="category"
          tickLine={false}
          axisLine={false}
          fontSize={10}
          width={130}
          tick={{ fill: c.muted || "var(--muted)", fontWeight: "bold" }}
        />
        <Tooltip content={CustomTooltip} cursor={{ fill: "var(--border-strong)", opacity: 0.1 }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
