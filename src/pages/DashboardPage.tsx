import type { EquipmentDatasetDetail } from "@/types/equipment"
import React, { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Gauge,
  Thermometer,
  Droplets,
  FileSpreadsheet,
  Upload as UploadIcon,
  Clock,
  TrendingUp,
  RefreshCw,
  Layers,
  Lock,
  CheckCircle2,
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
import { format, formatDistanceToNow } from "date-fns"

const LAST_DATASET_KEY = "chemviz:last_dashboard_dataset"
const SAMPLE_LIMIT = 5

/* ===================== Skeleton ===================== */
function DashboardSkeleton() {
  return <div className="h-[520px] glass-card shimmer" />
}

/* ===================== Empty State ===================== */
function EmptyState({ reason }: { reason: string }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <FileSpreadsheet className="h-14 w-14 text-primary mb-4" />
      <h2 className="text-2xl font-bold mb-2">No Analytics Available</h2>
      <p className="text-muted-foreground mb-6">{reason}</p>
      <Button onClick={() => navigate("/upload")}>
        <UploadIcon className="h-4 w-4 mr-1" />
        Upload Dataset
      </Button>
    </div>
  )
}

/* ===================== MAIN ===================== */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { datasetId } = useParams<{ datasetId: string }>()

  const [datasets, setDatasets] = useState<EquipmentDataset[]>([])
  const [currentDataset, setCurrentDataset] =
    useState<EquipmentDataset | null>(null)

  const [summary, setSummary] = useState<DatasetSummary | null>(null)
  const [previousSummary, setPreviousSummary] =
    useState<DatasetSummary | null>(null)

  const [datasetDetail, setDatasetDetail] =
    useState<EquipmentDatasetDetail | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  /* ===================== DATA LOADER ===================== */
  const loadDashboardData = useCallback(
    async (soft = false) => {
      if (!soft) setIsLoading(true)
      setIsRefreshing(soft)
      setError(null)

      try {
        const history =
          (await analyticsAPI.getHistory().catch(() =>
            mockAPI.getHistory()
          )) ?? null

        if (!history || history.datasets.length === 0) {
          setDatasets([])
          setCurrentDataset(null)
          setSummary(null)
          setDatasetDetail(null)
          return
        }

        const sorted = [...history.datasets].sort(
          (a, b) =>
            new Date(b.uploaded_at).getTime() -
            new Date(a.uploaded_at).getTime()
        )

        setDatasets(sorted)

        const persisted =
          datasetId ??
          localStorage.getItem(LAST_DATASET_KEY) ??
          sorted[0].id

        const resolved =
          sorted.find((d) => d.id === Number(persisted)) ??
          sorted[0]

        setCurrentDataset(resolved)
        localStorage.setItem(LAST_DATASET_KEY, String(resolved.id))

        const index = sorted.findIndex((d) => d.id === resolved.id)

        const [summaryData, detailData] = await Promise.all([
          analyticsAPI
            .getSummary(resolved.id)
            .catch(() => mockAPI.getSummary(resolved.id)),
          analyticsAPI
            .getDataset(resolved.id)
            .catch(() => mockAPI.getDataset?.(resolved.id)),
        ])

        const prev =
          index + 1 < sorted.length
            ? await analyticsAPI
                .getSummary(sorted[index + 1].id)
                .catch(() =>
                  mockAPI.getSummary(sorted[index + 1].id)
                )
            : null

        setSummary(summaryData)
        setPreviousSummary(prev)
        setDatasetDetail(detailData ?? null)
        setLastRefreshed(new Date())
      } catch {
        setError("Failed to load dashboard analytics")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [datasetId]
  )

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  /* ===================== STATES ===================== */
  if (isLoading) return <DashboardSkeleton />
  if (error) return <EmptyState reason={error} />
  if (!summary || !currentDataset)
    return <EmptyState reason="Upload a CSV dataset to generate analytics." />

  /* ===================== RENDER ===================== */
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Dashboard
            <CheckCircle2 className="h-5 w-5 text-success" />
          </h1>
          <p className="text-muted-foreground">
            Analytics for <strong>{currentDataset.filename}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Updated{" "}
          {lastRefreshed
            ? formatDistanceToNow(lastRefreshed, { addSuffix: true })
            : "—"}
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadDashboardData(true)}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* DATASET SWITCHER – PREMIUM */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="h-4 w-4" />
          Switch Dataset
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {datasets.map((d, index) => {
            const active = d.id === currentDataset.id
            const isSample = index < SAMPLE_LIMIT

            return (
              <motion.button
                key={d.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/dashboard/${d.id}`)}
                className={`relative min-w-[260px] rounded-xl border p-4 text-left transition
                  ${active
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "hover:bg-muted/40"}
                `}
              >
                {active && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
                )}

                <div className="relative space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{d.filename}</p>
                    {isSample && (
                      <span className="flex items-center gap-1 text-xs text-warning">
                        <Lock className="h-3 w-3" /> Sample
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(d.uploaded_at), "MMM d, yyyy")}</span>
                    <span>{d.total_records} records</span>
                  </div>

                  {active && (
                    <div className="text-xs font-medium text-primary flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Currently Viewing
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* METRICS */}
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

      {/* CHARTS */}
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

      <StatsTable summary={summary} />

      {datasetDetail?.records?.length > 0 && (
        <DetailedEquipmentTable records={datasetDetail.records} />
      )}

      {/* ACTIONS */}
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
