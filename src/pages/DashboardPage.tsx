import type { EquipmentDatasetDetail } from "@/types/equipment"
import React, { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Activity,
  Gauge,
  Thermometer,
  Droplets,
  FileSpreadsheet,
  Upload as UploadIcon,
  Sparkles,
  Clock,
  TrendingUp,
  RefreshCw,
} from "lucide-react"

import { AnimatedStatCard } from "@/components/dashboard/AnimatedStatCard"
import { AnimatedChart } from "@/components/dashboard/AnimatedChart"
import { EnhancedTypeChart } from "@/components/dashboard/EnhancedTypeChart"
import { EnhancedRangeChart } from "@/components/dashboard/EnhancedRangeChart"
import { StatsTable } from "@/components/dashboard/StatsTable"
import { DetailedEquipmentTable } from "@/components/dashboard/DetailedEquipmentTable"
import { Button } from "@/components/ui/button"

import { analyticsAPI, mockAPI } from "@/services/api"
import type { DatasetSummary, EquipmentDataset } from "@/types/equipment"
import { formatDistanceToNow } from "date-fns"

/* ------------------------------------------------------------------ */
/* Skeleton                                                           */
/* ------------------------------------------------------------------ */

function DashboardSkeleton() {
  return <div className="h-96 glass-card shimmer" />
}

/* ------------------------------------------------------------------ */
/* Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({ reason }: { reason: string }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <FileSpreadsheet className="h-12 w-12 text-primary mb-4" />
      <h2 className="text-2xl font-bold mb-2">No Analytics Available</h2>
      <p className="text-muted-foreground mb-6">{reason}</p>
      <Button onClick={() => navigate("/upload")}>
        <UploadIcon className="h-4 w-4 mr-1" />
        Upload Dataset
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* MAIN                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const navigate = useNavigate()

  const [latestDataset, setLatestDataset] =
    useState<EquipmentDataset | null>(null)

  const [summary, setSummary] = useState<DatasetSummary | null>(null)
  const [previousSummary, setPreviousSummary] =
    useState<DatasetSummary | null>(null)

  const [datasetDetail, setDatasetDetail] =
    useState<EquipmentDatasetDetail | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  /* ------------------ DATA LOADER (FIXED) ------------------ */

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const history =
        (await analyticsAPI.getHistory().catch(() =>
          mockAPI.getHistory()
        )) ?? null

      if (!history || history.datasets.length === 0) {
        setLatestDataset(null)
        setSummary(null)
        setDatasetDetail(null)
        return
      }

      const latest = history.datasets[0]
      setLatestDataset(latest)

      const currentSummary = await mockAPI.getSummary(latest.id)
      const prevSummary =
        history.datasets.length > 1
          ? await mockAPI.getSummary(history.datasets[1].id)
          : null

      const detail =
        (await analyticsAPI.getDataset(latest.id).catch(() =>
          mockAPI.getDataset?.(latest.id)
        )) ?? null

      setSummary(currentSummary)
      setPreviousSummary(prevSummary)
      setDatasetDetail(detail)
      setLastRefreshed(new Date())
    } catch {
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  /* ------------------ STATES ------------------ */

  if (isLoading) return <DashboardSkeleton />
  if (error) return <EmptyState reason={error} />
  if (!summary || !latestDataset)
    return <EmptyState reason="Upload a CSV dataset to generate analytics." />

  /* ------------------ RENDER ------------------ */

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Analytics for <strong>{summary.filename}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Updated {formatDistanceToNow(lastRefreshed!, { addSuffix: true })}
          <Button size="sm" variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedStatCard
          label="Total Equipment"
          value={summary.total_equipment}
          previousValue={previousSummary?.total_equipment}
          icon={<Activity className="h-6 w-6" />}
        />
        <AnimatedStatCard
          label="Avg Flowrate"
          value={summary.avg_flowrate}
          previousValue={previousSummary?.avg_flowrate}
          unit="units"
          icon={<Droplets className="h-6 w-6" />}
        />
        <AnimatedStatCard
          label="Avg Pressure"
          value={summary.avg_pressure}
          previousValue={previousSummary?.avg_pressure}
          unit="bar"
          icon={<Gauge className="h-6 w-6" />}
        />
        <AnimatedStatCard
          label="Avg Temperature"
          value={summary.avg_temperature}
          previousValue={previousSummary?.avg_temperature}
          unit="°C"
          icon={<Thermometer className="h-6 w-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedChart title="Equipment Type Distribution">
          <EnhancedTypeChart data={summary.type_distribution} />
        </AnimatedChart>

        <AnimatedChart title="Operational Ranges">
          <EnhancedRangeChart
            data={{
              avgFlowrate: summary.avg_flowrate,
              avgPressure: summary.avg_pressure,
              avgTemperature: summary.avg_temperature,
              minFlowrate: summary.min_flowrate,
              maxFlowrate: summary.max_flowrate,
              minPressure: summary.min_pressure,
              maxPressure: summary.max_pressure,
              minTemperature: summary.min_temperature,
              maxTemperature: summary.max_temperature,
            }}
          />
        </AnimatedChart>
      </div>

      {/* Dataset Stats */}
      <StatsTable summary={summary} />

      {/* ✅ EQUIPMENT LEVEL TABLE (FIXED) */}
      {datasetDetail?.records?.length > 0 && (
        <DetailedEquipmentTable records={datasetDetail.records} />
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => navigate("/upload")}>
          <UploadIcon className="h-4 w-4 mr-1" />
          Upload New
        </Button>
        <Button variant="outline" onClick={() => navigate("/history")}>
          <TrendingUp className="h-4 w-4 mr-1" />
          History
        </Button>
      </div>
    </motion.div>
  )
}
