
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */

interface ParameterRangeChartProps {
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
  flowrate: {
    solid: "hsl(215,100%,50%)",
    gradient: ["hsl(215,100%,60%)", "hsl(215,100%,40%)"],
  },
  pressure: {
    solid: "hsl(180,65%,45%)",
    gradient: ["hsl(180,65%,55%)", "hsl(180,65%,35%)"],
  },
  temperature: {
    solid: "hsl(38,92%,50%)",
    gradient: ["hsl(38,92%,60%)", "hsl(38,92%,40%)"],
  },
}

/* ------------------------------------------------------------------ */

export function ParameterRangeChart({
  data,
  className,
}: ParameterRangeChartProps) {
  const chartData = [
    {
      name: "Flowrate",
      avg: data.avgFlowrate,
      min: data.minFlowrate,
      max: data.maxFlowrate,
      range: data.maxFlowrate - data.minFlowrate,
      unit: "units",
      key: "flowrate",
    },
    {
      name: "Pressure",
      avg: data.avgPressure,
      min: data.minPressure,
      max: data.maxPressure,
      range: data.maxPressure - data.minPressure,
      unit: "bar",
      key: "pressure",
    },
    {
      name: "Temperature",
      avg: data.avgTemperature,
      min: data.minTemperature,
      max: data.maxTemperature,
      range: data.maxTemperature - data.minTemperature,
      unit: "°C",
      key: "temperature",
    },
  ]

  /* ---------------------- Tooltip -------------------------------- */

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 shadow-xl"
      >
        <p className="font-semibold mb-2">{d.name}</p>

        <div className="space-y-1 text-sm font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Min</span>
            <span>{d.min.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-muted-foreground">Avg</span>
            <span>{d.avg.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max</span>
            <span>{d.max.toFixed(2)}</span>
          </div>

          <div className="pt-2 mt-2 border-t border-border flex justify-between">
            <span className="text-muted-foreground">Range</span>
            <span>{d.range.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  /* ---------------------- Render --------------------------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn("space-y-4", className)}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            {/* Gradients */}
            <defs>
              {chartData.map((d) => (
                <linearGradient
                  key={d.key}
                  id={`grad-${d.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={COLORS[d.key as keyof typeof COLORS].gradient[0]}
                  />
                  <stop
                    offset="100%"
                    stopColor={COLORS[d.key as keyof typeof COLORS].gradient[1]}
                  />
                </linearGradient>
              ))}
            </defs>

            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="hsl(var(--muted-foreground))"
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="hsl(var(--muted-foreground))"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Avg Bars */}
            <Bar
              dataKey="avg"
              radius={[10, 10, 4, 4]}
              animationDuration={1200}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={`url(#grad-${entry.key})`}
                />
              ))}
            </Bar>

            {/* Min reference */}
            {chartData.map((d, i) => (
              <ReferenceLine
                key={`min-${i}`}
                y={d.min}
                stroke="hsl(var(--border))"
                strokeDasharray="4 4"
              />
            ))}

            {/* Max reference */}
            {chartData.map((d, i) => (
              <ReferenceLine
                key={`max-${i}`}
                y={d.max}
                stroke="hsl(var(--border))"
                strokeDasharray="4 4"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mini legend */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        {chartData.map((d) => (
          <div key={d.name} className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground">{d.name}</p>
            <p className="text-lg font-bold">
              {d.avg.toFixed(1)}
              <span className="text-xs ml-1">{d.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
