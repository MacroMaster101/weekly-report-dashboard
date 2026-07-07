"use client";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ProjectDistributionPoint } from "@/types/dashboard";
import { useChartColors } from "@/components/charts/useChartColors";

function EmptyChart() {
  return (
    <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted">
      No project data yet.
    </div>
  );
}

const CustomTooltip = ({ active, payload }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ProjectDistributionPoint & { fill?: string };
    return (
      <div className="rounded-2xl border border-border bg-surface/90 p-3.5 shadow-md backdrop-blur-md">
        <p className="mb-1 text-xs font-black text-fg">{data.project}</p>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: data.fill || payload[0].fill }} />
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
  const [activeIndex, setActiveIndex] = useState(-1);

  if (data.length === 0) return <EmptyChart />;

  const colors = [
    c.c1 || "var(--chart-1)",
    c.c2 || "var(--chart-2)",
    c.c3 || "var(--chart-3)",
    c.c4 || "var(--chart-4)",
    c.c5 || "var(--chart-5)",
    c.c6 || "var(--chart-6)",
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="project"
          cx="50%"
          cy="46%"
          innerRadius={48}
          outerRadius={75}
          paddingAngle={3}
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(-1)}
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={colors[i % colors.length]}
              style={{
                outline: "none",
                cursor: "pointer",
                transition: "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              opacity={activeIndex === -1 || activeIndex === i ? 1 : 0.45}
            />
          ))}
        </Pie>
        <Tooltip content={CustomTooltip} />
        <Legend wrapperStyle={{ color: "var(--muted)", fontSize: 10, fontWeight: "bold", paddingTop: 8 }} iconSize={8} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}