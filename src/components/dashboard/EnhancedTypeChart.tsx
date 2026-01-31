
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from "recharts"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */

interface EnhancedTypeChartProps {
  data: Record<string, number>
  className?: string
}

/* ------------------------------------------------------------------ */

const COLORS = [
  { main: "hsl(215,100%,50%)", glow: "rgba(59,130,246,.35)" },
  { main: "hsl(180,65%,45%)", glow: "rgba(20,184,166,.35)" },
  { main: "hsl(142,72%,45%)", glow: "rgba(34,197,94,.35)" },
  { main: "hsl(38,92%,50%)", glow: "rgba(251,191,36,.35)" },
  { main: "hsl(280,70%,55%)", glow: "rgba(168,85,247,.35)" },
  { main: "hsl(0,72%,51%)", glow: "rgba(239,68,68,.35)" },
]

/* ------------------------------------------------------------------ */
/* Active Slice Renderer                                              */
/* ------------------------------------------------------------------ */

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: "drop-shadow(0 10px 24px rgba(0,0,0,.25))",
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 6}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */

export function EnhancedTypeChart({ data, className }: EnhancedTypeChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [lockedIndex, setLockedIndex] = useState<number | null>(null)

  const activeIndex = lockedIndex ?? hoverIndex

  const chartData = Object.entries(data).map(([name, value], i) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: COLORS[i % COLORS.length].main,
    glow: COLORS[i % COLORS.length].glow,
  }))

  const total = chartData.reduce((a, b) => a + b.value, 0)

  if (!chartData.length) {
    return (
      <div className="flex h-72 items-center justify-center text-muted-foreground">
        No equipment data available
      </div>
    )
  }

  /* ---------------------------------------------------------------- */

  return (
    <div className={cn("relative", className)}>
      {/* Chart */}
      <div className="h-72 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={104}
              paddingAngle={3}
              dataKey="value"
              activeIndex={activeIndex ?? undefined}
              activeShape={renderActiveShape}
              onMouseEnter={(_, i) => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={(_, i) =>
                setLockedIndex((prev) => (prev === i ? null : i))
              }
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {chartData.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color}
                  opacity={
                    activeIndex === null || activeIndex === i ? 1 : 0.35
                  }
                  style={{
                    cursor: "pointer",
                    transition: "opacity .25s ease",
                  }}
                />
              ))}
            </Pie>
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
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-3xl font-bold">
                  {chartData[activeIndex].value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {chartData[activeIndex].name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((chartData[activeIndex].value / total) * 100).toFixed(1)}%
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-3xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total Equipment</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {chartData.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={() =>
              setLockedIndex((prev) => (prev === i ? null : i))
            }
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition",
              activeIndex === i
                ? "bg-accent ring-2 ring-primary/30"
                : "hover:bg-muted/50"
            )}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm truncate">{item.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
