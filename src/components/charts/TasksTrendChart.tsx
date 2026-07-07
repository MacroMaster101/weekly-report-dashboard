"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { TasksTrendPoint } from "@/types/dashboard";
import { useChartColors } from "@/components/charts/useChartColors";

function EmptyChart() {
  return (
    <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted">
      No trend data yet.
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface/90 p-3 shadow-md backdrop-blur-md">
        <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-muted">{label}</p>
        {payload.map((pld) => (
          <div key={pld.name ?? "reports"} className="flex items-center gap-2 text-xs font-bold text-fg">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pld.color || pld.fill }} />
            <span>Reports:</span>
            <span className="font-mono text-accent font-black">{pld.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TasksTrendChart({ data }: { data: TasksTrendPoint[] }) {
  const c = useChartColors();
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={c.grid || "var(--chart-grid)"} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="week" fontSize={10} tickLine={false} tick={{ fill: c.muted || "var(--muted)" }} />
        <YAxis allowDecimals={false} fontSize={10} tickLine={false} tick={{ fill: c.muted || "var(--muted)" }} />
        <Tooltip content={CustomTooltip} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Line
          type="monotone"
          dataKey="reports"
          stroke={c.c1 || "var(--chart-1)"}
          strokeWidth={3}
          dot={{ r: 3, strokeWidth: 1, fill: c.c1 || "var(--chart-1)" }}
          activeDot={{ r: 6, stroke: "var(--surface)", strokeWidth: 2, fill: c.c1 || "var(--chart-1)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}