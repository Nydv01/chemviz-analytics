
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface AnimatedStatCardProps {
  label: string
  value: number
  previousValue?: number
  unit?: string
  icon: React.ReactNode
  color?: "blue" | "teal" | "green" | "amber" | "purple"
  delay?: number

  /* 🔼 NEW (OPTIONAL, NON-BREAKING) */
  subtitle?: string
  highlight?: boolean
}

const colorMap = {
  blue: {
    gradient: "from-blue-500/25 to-blue-500/5",
    text: "text-blue-500",
    glow: "shadow-blue-500/20",
  },
  teal: {
    gradient: "from-teal-500/25 to-teal-500/5",
    text: "text-teal-500",
    glow: "shadow-teal-500/20",
  },
  green: {
    gradient: "from-green-500/25 to-green-500/5",
    text: "text-green-500",
    glow: "shadow-green-500/20",
  },
  amber: {
    gradient: "from-amber-500/25 to-amber-500/5",
    text: "text-amber-500",
    glow: "shadow-amber-500/20",
  },
  purple: {
    gradient: "from-purple-500/25 to-purple-500/5",
    text: "text-purple-500",
    glow: "shadow-purple-500/20",
  },
}

/* ---------------- Animated Number (High Precision) ---------------- */

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return

    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }

    const start = 0
    const duration = 900
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (value - start) * eased)

      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value, isInView, prefersReducedMotion])

  return (
    <span ref={ref} className="tabular-nums">
      {value % 1 === 0
        ? Math.round(display).toLocaleString()
        : display.toFixed(2)}
    </span>
  )
}

/* ---------------- MAIN CARD ---------------- */

export function AnimatedStatCard({
  label,
  value,
  previousValue,
  unit,
  icon,
  color = "blue",
  delay = 0,
  subtitle,
  highlight = false,
}: AnimatedStatCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  const safePrev =
    previousValue && previousValue !== 0 ? previousValue : null

  const percentChange = safePrev
    ? ((value - safePrev) / safePrev) * 100
    : null

  const trend =
    percentChange === null
      ? null
      : percentChange > 0
      ? "up"
      : percentChange < 0
      ? "down"
      : "neutral"

  const theme = colorMap[color]

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        delay,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className={cn(
        "stat-card relative overflow-hidden group",
        highlight && "ring-2 ring-primary/30"
      )}
      aria-label={`${label}: ${value}`}
    >
      {/* Glow layer */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-br from-primary/10 via-transparent to-transparent"
        )}
      />

      <div className="relative flex items-start justify-between">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            "bg-gradient-to-br shadow-inner transition-transform duration-300",
            "group-hover:scale-110",
            theme.gradient,
            theme.text,
            theme.glow
          )}
        >
          {icon}
        </div>

        {/* Trend */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: delay + 0.3 }}
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend === "up" && "bg-success/10 text-success",
              trend === "down" && "bg-destructive/10 text-destructive",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
            <span>{Math.abs(percentChange!).toFixed(1)}%</span>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        <p className="text-3xl font-bold text-foreground tracking-tight">
          <AnimatedNumber value={value} />
          {unit && (
            <span className="ml-1 text-lg font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </p>

        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Shine sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
        }}
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 0.7 }}
      />
    </motion.section>
  )
}
