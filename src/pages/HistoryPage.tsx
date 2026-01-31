import React, { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw,
  History,
  FileSpreadsheet,
  Download,
  Trash2,
  BarChart3,
  Clock,
  Database,
  Info,
  ArrowRight,
  Pin,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { analyticsAPI, mockAPI } from "@/services/api"
import type { EquipmentDataset } from "@/types/equipment"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const LAST_DATASET_KEY = "chemviz:last_dataset"

/* ===================== Dataset Card ===================== */

function DatasetCard({
  dataset,
  index,
  isPinned,
  highlight,
  onViewAnalytics,
  onDownloadReport,
  onDelete,
}: {
  dataset: EquipmentDataset
  index: number
  isPinned: boolean
  highlight: boolean
  onViewAnalytics: () => void
  onDownloadReport: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: highlight
          ? "0 0 0 2px rgba(99,102,241,0.35)"
          : "none",
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 120 }}
      whileHover={{ y: -4 }}
      className={cn(
        "glass-card-hover p-6 group relative overflow-hidden",
        highlight && "ring-2 ring-primary/40"
      )}
    >
      {isPinned && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
          <Pin className="h-3 w-3" />
          Sample
        </div>
      )}

      <div className="flex flex-col xl:flex-row xl:items-center gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-primary/10">
            <FileSpreadsheet className="h-7 w-7 text-primary" />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {dataset.filename}
            </h3>
            <div className="flex gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(dataset.uploaded_at), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                {dataset.total_records} records
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <Stat label="Flowrate" value={dataset.avg_flowrate?.toFixed(1)} />
          <Stat label="Pressure" value={dataset.avg_pressure?.toFixed(2)} />
          <Stat
            label="Temp"
            value={
              dataset.avg_temperature != null
                ? `${dataset.avg_temperature.toFixed(1)}°`
                : "—"
            }
          />
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onViewAnalytics}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>

          <Button variant="ghost" size="sm" onClick={onDownloadReport}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function Stat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="text-center min-w-[90px]">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value ?? "—"}</p>
    </div>
  )
}

/* ===================== MAIN ===================== */

export default function HistoryPage() {
  const [datasets, setDatasets] = useState<EquipmentDataset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] =
    useState<EquipmentDataset | null>(null)

  const { isDemoMode } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const lastViewedRef = useRef<number | null>(null)

  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    const history = isDemoMode
      ? await mockAPI.getHistory()
      : await analyticsAPI.getHistory()

    setDatasets(history.datasets)

    const stored = localStorage.getItem(LAST_DATASET_KEY)
    if (stored) lastViewedRef.current = Number(stored)

    setIsLoading(false)
  }, [isDemoMode])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleDownloadReport = (dataset: EquipmentDataset) => {
    const url = analyticsAPI.getReportUrl(dataset.id)

    const link = document.createElement("a")
    link.href = url
    link.download = `Equipment_Report_${dataset.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: dataset.filename,
    })
  }

  return (
    <motion.div className="space-y-8">
      {isLoading ? (
        <div className="glass-card h-32 shimmer" />
      ) : (
        <AnimatePresence>
          {datasets.map((d, i) => (
            <DatasetCard
              key={d.id}
              dataset={d}
              index={i}
              isPinned={d.filename.toLowerCase().includes("sample")}
              highlight={d.id === lastViewedRef.current}
              onViewAnalytics={() => navigate(`/dashboard/${d.id}`)}
              onDownloadReport={() => handleDownloadReport(d)}
              onDelete={() => setDeleteTarget(d)}
            />
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  )
}
