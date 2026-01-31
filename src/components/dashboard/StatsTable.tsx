
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { DatasetSummary } from "@/types/equipment";
import { cn } from "@/lib/utils";

interface StatsTableProps {
  summary: DatasetSummary;
}

export function StatsTable({ summary }: StatsTableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const safe = (v?: number) =>
    typeof v === "number" && !Number.isNaN(v) ? v : 0;

  const rows = [
    {
      key: "flowrate",
      label: "Flowrate",
      unit: "units",
      min: safe(summary.min_flowrate),
      avg: safe(summary.avg_flowrate),
      max: safe(summary.max_flowrate),
      std: safe(summary.std_flowrate),
      color: "bg-blue-500",
    },
    {
      key: "pressure",
      label: "Pressure",
      unit: "bar",
      min: safe(summary.min_pressure),
      avg: safe(summary.avg_pressure),
      max: safe(summary.max_pressure),
      std: safe(summary.std_pressure),
      color: "bg-teal-500",
    },
    {
      key: "temperature",
      label: "Temperature",
      unit: "°C",
      min: safe(summary.min_temperature),
      avg: safe(summary.avg_temperature),
      max: safe(summary.max_temperature),
      std: safe(summary.std_temperature),
      color: "bg-amber-500",
    },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="chart-container overflow-hidden"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Detailed Statistics
        </h3>
        <span className="text-xs text-muted-foreground">
          Statistical summary per parameter
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="bg-muted/60 py-3 px-4 text-left rounded-tl-lg">
                Parameter
              </th>
              <th className="bg-muted/60 py-3 px-4 text-right">Min</th>
              <th className="bg-muted/60 py-3 px-4 text-right">Avg</th>
              <th className="bg-muted/60 py-3 px-4 text-right">Max</th>
              <th className="bg-muted/60 py-3 px-4 text-right">Std</th>
              <th className="bg-muted/60 py-3 px-4 text-right rounded-tr-lg">
                CV %
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => {
              const range = row.max - row.min;
              const cv =
                row.avg !== 0 ? (row.std / row.avg) * 100 : 0;

              return (
                <motion.tr
                  key={row.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    delay: 0.6 + index * 0.12,
                    duration: 0.4,
                  }}
                  className="border-t border-border/50 hover:bg-accent/40 transition-colors"
                >
                  {/* Parameter */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            row.color
                          )}
                        />
                        <span className="font-medium text-foreground">
                          {row.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({row.unit})
                        </span>
                      </div>

                      {/* Range bar */}
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={
                            isInView
                              ? { width: "100%" }
                              : {}
                          }
                          transition={{
                            delay: 0.8 + index * 0.15,
                            duration: 0.6,
                          }}
                          className={cn("h-full", row.color)}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-sm">
                    {row.min.toFixed(2)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-sm font-semibold text-foreground">
                    {row.avg.toFixed(2)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-sm">
                    {row.max.toFixed(2)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-sm text-muted-foreground">
                    ±{row.std.toFixed(2)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-sm">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full",
                        cv < 15
                          ? "bg-success/10 text-success"
                          : cv < 30
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {cv.toFixed(1)}%
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
