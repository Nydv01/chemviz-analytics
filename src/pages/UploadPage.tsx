import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileSpreadsheet,
  HelpCircle,
  Upload,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  FileText,
  Table2,
  AlertTriangle,
  Server,
  Cpu,
  Hash,
} from "lucide-react"
import { useDropzone } from "react-dropzone"

import { analyticsAPI, mockAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

type UploadResult = {
  success: boolean
  message: string
  datasetId?: number
  recordsProcessed?: number
  warnings?: string[]
  mode?: "backend" | "demo"
}

const MAX_FILE_SIZE_MB = 5

export default function UploadPage() {
  const navigate = useNavigate()
  const redirectTimer = useRef<NodeJS.Timeout | null>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  /* ===================== UPLOAD ===================== */

  const handleUpload = async (file: File) => {
    setValidationError(null)

    if (!file.name.endsWith(".csv")) {
      setValidationError("Only CSV files are allowed.")
      return
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationError(`File must be under ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult(null)
    setSelectedFile(file)

    const progressTimer = setInterval(() => {
      setUploadProgress((p) => (p < 94 ? p + Math.random() * 8 : p))
    }, 120)

    try {
      let response: any
      let mode: "backend" | "demo" = "backend"

      try {
        response = await analyticsAPI.uploadCSV(file)
      } catch {
        mode = "demo"
        response = await mockAPI.uploadCSV(file)
      }

      clearInterval(progressTimer)
      setUploadProgress(100)

      setUploadResult({
        success: true,
        message: response.message,
        datasetId: response.dataset?.id,
        recordsProcessed:
          response.records_processed ?? response.recordsProcessed,
        warnings: response.warnings,
        mode,
      })

      if (response.dataset?.id) {
        redirectTimer.current = setTimeout(() => {
          navigate(`/dashboard/${response.dataset.id}`)
        }, 3000)
      }
    } catch (error: any) {
      clearInterval(progressTimer)
      setUploadResult({
        success: false,
        message: error?.message || "Upload failed",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current)
    setUploadResult(null)
    setUploadProgress(0)
    setSelectedFile(null)
    setValidationError(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleUpload(files[0]),
    accept: { "text/csv": [".csv"] },
    multiple: false,
    disabled: isUploading,
  })

  /* ===================== RENDER ===================== */

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Upload Dataset</h1>
          <p className="text-muted-foreground">
            Import chemical equipment data securely
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <AnimatePresence mode="wait">
        {!uploadResult ? (
          <motion.div key="drop" initial={{ y: 20 }} animate={{ y: 0 }}>
            <div
              {...getRootProps()}
              className={cn(
                "upload-zone p-10 text-center",
                isDragActive && "border-primary bg-primary/5",
                isUploading && "pointer-events-none"
              )}
            >
              <input {...getInputProps()} />

              {isUploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                    className="mx-auto w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center"
                  >
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                  </motion.div>

                  <p className="mt-4 font-medium">{selectedFile?.name}</p>
                  <Progress value={uploadProgress} className="mt-4" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadProgress.toFixed(0)}%
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-xl font-semibold">
                    Drag & drop CSV here
                  </p>
                  <p className="text-muted-foreground">or click to browse</p>

                  {validationError && (
                    <div className="mt-4 flex justify-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      {validationError}
                    </div>
                  )}

                  <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
                    <span className="flex gap-2">
                      <FileText className="h-4 w-4" /> CSV only
                    </span>
                    <span className="flex gap-2">
                      <Table2 className="h-4 w-4" /> 5 columns
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-10 text-center space-y-6">
            {uploadResult.success ? (
              <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            )}

            <h2 className="text-2xl font-bold">
              {uploadResult.success ? "Upload Complete" : "Upload Failed"}
            </h2>

            <p className="text-muted-foreground">{uploadResult.message}</p>

            {uploadResult.datasetId && (
              <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm">
                <Hash className="h-4 w-4" />
                Dataset ID: {uploadResult.datasetId}
              </div>
            )}

            <div className="flex justify-center gap-2 text-xs text-muted-foreground">
              {uploadResult.mode === "backend" ? (
                <>
                  <Server className="h-4 w-4" /> Backend processed
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" /> Demo mode
                </>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-4">
              {uploadResult.success ? (
                <>
                  <Button
                    onClick={() =>
                      uploadResult.datasetId
                        ? navigate(`/dashboard/${uploadResult.datasetId}`)
                        : navigate("/history")
                    }
                  >
                    View Dashboard
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Upload Another
                  </Button>
                </>
              ) : (
                <Button onClick={handleReset}>Retry</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSV Help */}
      <div className="glass-card">
        <Accordion type="single" collapsible>
          <AccordionItem value="format">
            <AccordionTrigger>
              <HelpCircle className="h-4 w-4 mr-2" />
              CSV Format
            </AccordionTrigger>
            <AccordionContent>
              <pre className="bg-muted p-4 rounded-lg text-sm">
{`Equipment Name,Equipment Type,Flowrate,Pressure,Temperature
Pump-A1,pump,150.5,3.2,45.8
Valve-B2,valve,75.0,2.1,38.5`}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </motion.div>
  )
}
