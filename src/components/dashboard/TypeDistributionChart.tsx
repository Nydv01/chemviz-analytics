
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */

interface TypeDistributionChartProps {
  data: Record<string, number>
  variant?: "pie" | "bar"
  className?: string
}

/* ------------------------------------------------------------------ */

const CHART_COLORS = [
  { main: "hsl(215,100%,50%)", soft: "hsl(215,100%,60%)" },
  { main: "hsl(180,65%,45%)", soft: "hsl(180,65%,55%)" },
  { main: "hsl(142,72%,45%)", soft: "hsl(142,72%,55%)" },
  { main: "hsl(38,92%,50%)", soft: "hsl(38,92%,60%)" },
  { main: "hsl(280,70%,55%)", soft: "hsl(280,70%,65%)" },
  { main: "hsl(0,72%,51%)", soft: "hsl(0,72%,61%)" },
]

/* ------------------------------------------------------------------ */

export function TypeDistributionChart({
  data,
  variant = "bar",
  className,
}: TypeDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const chartData = Object.entries(data).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: CHART_COLORS[index % CHART_COLORS.length].main,
    soft: CHART_COLORS[index % CHART_COLORS.length].soft,
  }))

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  if (chartData.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-muted-foreground", className)}>
        No data available
      </div>
    )
  }

  /* ========================== PIE MODE ========================== */

  if (variant === "pie") {
    return (
      <div className={cn("relative h-80", className)}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              activeIndex={activeIndex ?? undefined}
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={1200}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  style={{
                    filter:
                      activeIndex === index
                        ? "drop-shadow(0 6px 16px rgba(0,0,0,0.25))"
                        : "none",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {activeIndex !== null ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="text-center"
              >
                <p className="text-3xl font-bold">
                  {chartData[activeIndex].value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {chartData[activeIndex].name}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="text-center"
              >
                <p className="text-3xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total Equipment</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer",
                activeIndex === i ? "bg-accent" : "hover:bg-muted/50"
              )}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm truncate">{item.name}</span>
              <span className="ml-auto text-sm text-muted-foreground">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  /* ========================== BAR MODE ========================== */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("h-72", className)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 30, right: 20 }}
        >
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip content={<BarTooltip />} />
          <Bar
            dataKey="value"
            radius={[6, 6, 6, 6]}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                style={{
                  filter:
                    activeIndex === index
                      ? "drop-shadow(0 4px 12px rgba(0,0,0,0.2))"
                      : "none",
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

/* ========================== TOOLTIPS ========================== */

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload

  return (
    <div className="glass-card p-3 text-sm">
      <p className="font-semibold">{d.name}</p>
      <p className="text-muted-foreground">
        Count: <span className="font-mono text-foreground">{d.value}</span>
      </p>
    </div>
  )
}

function BarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload

  return (
    <div className="glass-card p-3 text-sm">
      <p className="font-semibold">{d.name}</p>
      <p className="text-muted-foreground">
        Equipment: <span className="font-mono text-foreground">{d.value}</span>
      </p>
    </div>
  )
}
