
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceDot,
} from "recharts"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */

interface EnhancedRangeChartProps {
  data: {
    avgFlowrate: number
    avgPressure: number
    avgTemperature: number
    minFlowrate: number
    maxFlowrate: number
    minPressure: number
    maxPressure: number
    minTemperature: number
    maxTemperature: number
  }
  className?: string
}

/* ------------------------------------------------------------------ */

const COLORS = {
  Flowrate: {
    base: "hsl(215,100%,50%)",
    gradient: ["hsl(215,100%,65%)", "hsl(215,100%,40%)"],
    unit: "units",
  },
  Pressure: {
    base: "hsl(180,65%,45%)",
    gradient: ["hsl(180,65%,55%)", "hsl(180,65%,35%)"],
    unit: "bar",
  },
  Temperature: {
    base: "hsl(38,92%,50%)",
    gradient: ["hsl(38,92%,60%)", "hsl(38,92%,40%)"],
    unit: "°C",
  },
}

/* ------------------------------------------------------------------ */

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 text-sm shadow-xl"
    >
      <p className="font-semibold mb-2">{d.name}</p>

      <div className="space-y-1">
        <Row label="Min" value={d.min} unit={d.unit} />
        <Row label="Avg" value={d.avg} unit={d.unit} highlight />
        <Row label="Max" value={d.max} unit={d.unit} />
      </div>

      <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
        Operating range spread:{" "}
        <span className="font-mono text-foreground">
          {(d.max - d.min).toFixed(2)} {d.unit}
        </span>
      </div>
    </motion.div>
  )
}

function Row({
  label,
  value,
  unit,
  highlight,
}: {
  label: string
  value: number
  unit: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono",
          highlight && "font-semibold text-foreground"
        )}
      >
        {value.toFixed(2)} {unit}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function EnhancedRangeChart({
  data,
  className,
}: EnhancedRangeChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const chartData = [
    {
      name: "Flowrate",
      min: data.minFlowrate,
      avg: data.avgFlowrate,
      max: data.maxFlowrate,
      unit: COLORS.Flowrate.unit,
      color: COLORS.Flowrate.base,
    },
    {
      name: "Pressure",
      min: data.minPressure,
      avg: data.avgPressure,
      max: data.maxPressure,
      unit: COLORS.Pressure.unit,
      color: COLORS.Pressure.base,
    },
    {
      name: "Temperature",
      min: data.minTemperature,
      avg: data.avgTemperature,
      max: data.maxTemperature,
      unit: COLORS.Temperature.unit,
      color: COLORS.Temperature.base,
    },
  ]

  const maxY = Math.max(...chartData.map((d) => d.max)) * 1.15

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>■ Range (min → max)</span>
        <span>● Average</span>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <defs>
              {Object.entries(COLORS).map(([key, c]) => (
                <linearGradient
                  key={key}
                  id={`grad-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={c.gradient[0]} />
                  <stop offset="100%" stopColor={c.gradient[1]} />
                </linearGradient>
              ))}
            </defs>

            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <YAxis
              domain={[0, maxY]}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Range bar (min → max) */}
            <Bar
              dataKey="max"
              radius={[10, 10, 0, 0]}
              animationDuration={prefersReducedMotion ? 0 : 1000}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={`url(#grad-${entry.name})`}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
              ))}
            </Bar>

            {/* Average marker */}
            {chartData.map((d, i) => (
              <ReferenceDot
                key={d.name}
                x={d.name}
                y={d.avg}
                r={6}
                fill={d.color}
                stroke="white"
                strokeWidth={2}
                isFront
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mini cards */}
      <div className="grid grid-cols-3 gap-3">
        {chartData.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 + i * 0.1 }}
            className={cn(
              "rounded-xl p-3 text-center bg-muted/50 cursor-pointer",
              activeIndex === i && "ring-2 ring-primary/30"
            )}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div
              className="mx-auto mb-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <p className="text-xs text-muted-foreground">{d.name}</p>
            <p className="text-lg font-bold">
              {d.avg.toFixed(1)}
              <span className="text-xs text-muted-foreground ml-0.5">
                {d.unit}
              </span>
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
