"use client";
import { useEffect, useState } from "react";

export function useChartColors() {
  const [c, setC] = useState<Record<string, string>>({});
  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const v = (n: string) => s.getPropertyValue(n).trim();
      setC({
        c1: v("--chart-1"),
        c2: v("--chart-2"),
        c3: v("--chart-3"),
        c4: v("--chart-4"),
        c5: v("--chart-5"),
        c6: v("--chart-6"),
        grid: v("--chart-grid"),
        fg: v("--fg"),
        muted: v("--muted"),
      });
    };
    read();
    // re-read when data-theme attribute changes or OS theme changes
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", read);
    };
  }, []);
  return c;
}
