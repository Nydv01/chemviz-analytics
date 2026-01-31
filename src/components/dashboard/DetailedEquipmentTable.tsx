import { motion } from "framer-motion"
import { useState, useMemo } from "react"
import { Search, AlertTriangle, Thermometer, Gauge, Droplets } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { EquipmentRecord } from "@/types/equipment"

interface Props {
  records: EquipmentRecord[]
}

export function DetailedEquipmentTable({ records }: Props) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return records.filter((r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.equipment_type.toLowerCase().includes(query.toLowerCase())
    )
  }, [records, query])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Equipment-Level Details</h3>
          <p className="text-sm text-muted-foreground">
            Individual equipment parameters & health indicators
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment or type"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Flowrate</th>
              <th>Pressure</th>
              <th>Temperature</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, i) => {
              const tempAlert = r.temperature > 80
              const pressureAlert = r.pressure > 6

              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td className="font-medium">{r.name}</td>
                  <td className="capitalize">{r.equipment_type}</td>

                  <td className="font-mono">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      {r.flowrate.toFixed(1)}
                    </div>
                  </td>

                  <td className="font-mono">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-green-500" />
                      {r.pressure.toFixed(2)}
                    </div>
                  </td>

                  <td className="font-mono">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-amber-500" />
                      {r.temperature.toFixed(1)}°C
                    </div>
                  </td>

                  <td>
                    {tempAlert || pressureAlert ? (
                      <span className="inline-flex items-center gap-1 text-destructive text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Attention
                      </span>
                    ) : (
                      <span className="text-success text-sm font-medium">
                        Normal
                      </span>
                    )}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground text-sm">
          No equipment matches your search.
        </p>
      )}
    </motion.div>
  )
}
