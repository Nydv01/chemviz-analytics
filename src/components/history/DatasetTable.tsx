
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, formatDistanceToNow } from "date-fns"
import {
  FileSpreadsheet,
  BarChart3,
  Download,
  Trash2,
} from "lucide-react"

import type { EquipmentDataset } from "@/types/equipment"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */

interface DatasetTableProps {
  datasets: EquipmentDataset[]
  onViewAnalytics: (dataset: EquipmentDataset) => void
  onDownloadReport: (dataset: EquipmentDataset) => void
  onDelete: (dataset: EquipmentDataset) => void
  isLoading?: boolean
}

/* ------------------------------------------------------------------ */

export function DatasetTable({
  datasets,
  onViewAnalytics,
  onDownloadReport,
  onDelete,
  isLoading = false,
}: DatasetTableProps) {
  /* ========================== LOADING ========================== */

  if (isLoading) {
    return (
      <div className="data-card p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-muted/50 shimmer"
          />
        ))}
      </div>
    )
  }

  /* ========================== EMPTY ========================== */

  if (datasets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="data-card flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-5">
          <FileSpreadsheet className="h-10 w-10" />
        </div>

        <h3 className="text-xl font-semibold mb-2">
          No Upload History
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Upload a CSV file to begin tracking and analyzing your equipment data.
        </p>
      </motion.div>
    )
  }

  /* ========================== TABLE ========================== */

  return (
    <div className="data-card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[900px]">
          {/* ---------------- HEADER ---------------- */}
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
            <tr>
              <th>File</th>
              <th>Uploaded</th>
              <th className="text-right">Records</th>
              <th className="text-right">Avg Flow</th>
              <th className="text-right">Avg Pressure</th>
              <th className="text-right">Avg Temp</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          {/* ---------------- BODY ---------------- */}
          <tbody>
            <AnimatePresence>
              {datasets.map((dataset, index) => (
                <motion.tr
                  key={dataset.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  {/* FILE */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileSpreadsheet className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[220px]">
                          {dataset.filename}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* DATE */}
                  <td>
                    <div className="text-sm">
                      <p>{format(new Date(dataset.uploaded_at), "MMM d, yyyy")}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(dataset.uploaded_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </td>

                  {/* METRICS */}
                  <td className="text-right font-mono">
                    {dataset.total_records.toLocaleString()}
                  </td>

                  <td className="text-right font-mono">
                    {dataset.avg_flowrate?.toFixed(2) ?? "—"}
                  </td>

                  <td className="text-right font-mono">
                    {dataset.avg_pressure?.toFixed(2) ?? "—"}
                  </td>

                  <td className="text-right font-mono">
                    {dataset.avg_temperature?.toFixed(2) ?? "—"}
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewAnalytics(dataset)}
                        aria-label="View analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownloadReport(dataset)}
                        aria-label="Download report"
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(dataset)}
                        aria-label="Delete dataset"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
