
import React from "react"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react"
import { motion } from "framer-motion"

interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ReactNode
  className?: string

  /* 🔼 NEW (OPTIONAL, NON-BREAKING) */
  subtitle?: string
  tooltip?: string
  loading?: boolean
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  className,
  subtitle,
  tooltip,
  loading = false,
}: StatCardProps) {
  const TrendIcon =
    trend === "up"
      ? TrendingUp
      : trend === "down"
      ? TrendingDown
      : Minus

  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-destructive"
      : "text-muted-foreground"

  const glow =
    trend === "up"
      ? "shadow-success/20"
      : trend === "down"
      ? "shadow-destructive/20"
      : "shadow-primary/10"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "stat-card relative overflow-hidden",
        glow,
        loading && "animate-pulse-subtle",
        className
      )}
    >
      {/* Gradient hover overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
            {tooltip && (
              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            )}
          </div>

          {subtitle && (
            <span className="text-xs text-muted-foreground">
              {subtitle}
            </span>
          )}
        </div>

        {icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            {icon}
          </motion.div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3 flex items-end gap-1.5">
        <motion.span
          key={value.toString()}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-semibold text-foreground font-mono"
        >
          {typeof value === "number"
            ? value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : value}
        </motion.span>

        {unit && (
          <span className="text-sm text-muted-foreground mb-1">
            {unit}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend && trendValue && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 flex items-center gap-1.5"
        >
          <TrendIcon className={cn("h-4 w-4", trendColor)} />
          <span
            className={cn(
              "text-sm font-medium tracking-tight",
              trendColor
            )}
          >
            {trendValue}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
