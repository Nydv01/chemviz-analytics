
import { motion, useInView } from "framer-motion"
import { useRef, ReactNode, useState } from "react"
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AnimatedChartProps {
  title: string
  description?: string
  children: ReactNode
  delay?: number

  /* 🔼 NEW (OPTIONAL – NON BREAKING) */
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  onRefresh?: () => void
  headerRight?: ReactNode
}

export function AnimatedChart({
  title,
  description,
  children,
  delay = 0,
  loading = false,
  empty = false,
  emptyMessage = "No data available",
  onRefresh,
  headerRight,
}: AnimatedChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "chart-container relative group",
        fullscreen &&
          "fixed inset-4 z-50 bg-background rounded-3xl shadow-2xl"
      )}
    >
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: delay + 0.1, duration: 0.45 }}
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </motion.h3>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: delay + 0.2, duration: 0.4 }}
              className="text-sm text-muted-foreground mt-1 max-w-xl"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          {headerRight}

          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFullscreen((v) => !v)}
            className="h-8 w-8"
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: delay + 0.25, duration: 0.45 }}
        className="relative"
      >
        {loading ? (
          <div className="h-64 rounded-xl shimmer bg-muted/30" />
        ) : empty ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <Info className="h-6 w-6 mb-2" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </motion.div>
    </motion.section>
  )
}
