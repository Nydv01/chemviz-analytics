
import type {
  EquipmentDataset,
  EquipmentDatasetDetail,
  DatasetSummary,
  UploadResponse,
  HistoryResponse,
  AuthResponse,
  User,
  EquipmentRecord,
} from "@/types/equipment"

export type AnalyticsAPI = {
  uploadCSV: (file: File) => Promise<UploadResponse>
  getHistory: () => Promise<HistoryResponse>
  getSummary: (id: number) => Promise<DatasetSummary>
  getDataset: (id: number) => Promise<EquipmentDatasetDetail>
  deleteDataset: (id: number) => Promise<void>
  getReportUrl: (id: number) => string
}


/* ===================== CONFIG ===================== */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

const DEMO_STORAGE_KEY = "chemviz_demo_store"
const API_MODE_KEY = "chemviz_api_mode" // backend | demo

/* ===================== CSRF ===================== */

function getCSRFToken(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : null
}

/* ===================== CORE FETCH ===================== */

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = "Request failed"
    try {
      const data = await res.json()
      msg = data?.error || data?.detail || msg
    } catch {
      // Silently ignore JSON parse errors
    }
    throw new Error(msg)
  }
  return res.status === 204 ? ({} as T) : res.json()
}

async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const csrf = getCSRFToken()

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      ...(options.headers ?? {}),
      ...(csrf ? { "X-CSRFToken": csrf } : {}),
    },
    ...options,
  })

  return handleResponse<T>(res)
}

/* ===================== AUTH API ===================== */

export const authAPI = {
  login: (username: string, password: string) =>
    api<AuthResponse>("/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    api<{ message: string }>("/auth/logout/", { method: "POST" }),

  getCurrentUser: () =>
    api<{ user: User; isAuthenticated: boolean }>("/auth/me/"),
}

/* ===================== BACKEND ANALYTICS ===================== */

export const analyticsAPI: AnalyticsAPI = {

  uploadCSV: async (file: File): Promise<UploadResponse> => {
    const form = new FormData()
    form.append("file", file)

    const csrf = getCSRFToken()

    const res = await fetch(`${API_BASE_URL}/upload/`, {
      method: "POST",
      credentials: "include",
      headers: csrf ? { "X-CSRFToken": csrf } : {},
      body: form,
    })

    localStorage.setItem(API_MODE_KEY, "backend")
    return handleResponse(res)
  },

  getHistory: () =>
    api<HistoryResponse>("/history/"),

  getSummary: (id: number) =>
    api<DatasetSummary>(`/summary/${id}/`),

  getDataset: (id: number) =>
    api<EquipmentDatasetDetail>(`/dataset/${id}/`),

  deleteDataset: (id: number) =>
    api<void>(`/dataset/${id}/`, { method: "DELETE" }),

  getReportUrl: (id: number) => {
  return `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/api/report/${id}/`
},


}

/* ===================== DEMO STORE (PERSISTENT) ===================== */

type DemoStore = {
  datasets: EquipmentDataset[]
  records: Record<number, EquipmentRecord[]>
}

function loadDemoStore(): DemoStore {
  const raw = localStorage.getItem(DEMO_STORAGE_KEY)
  return raw ? JSON.parse(raw) : { datasets: [], records: {} }
}

function saveDemoStore(store: DemoStore) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(store))
}

/* ===================== CSV PARSER ===================== */

function parseCSV(text: string): EquipmentRecord[] {
  const lines = text.trim().split("\n").slice(1)

  return lines.map((line, i) => {
    const [name, type, flow, pressure, temp] = line.split(",")

    return {
      id: i + 1,
      name: name.trim(),
      equipment_type: type.trim(),
      flowrate: Number(flow),
      pressure: Number(pressure),
      temperature: Number(temp),
    }
  })
}

/* ===================== STATS ===================== */

const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length
const std = (a: number[]) => {
  const m = avg(a)
  return Math.sqrt(avg(a.map(x => (x - m) ** 2)))
}

function computeSummary(
  dataset: EquipmentDataset,
  records: EquipmentRecord[]
): DatasetSummary {
  const f = records.map(r => r.flowrate)
  const p = records.map(r => r.pressure)
  const t = records.map(r => r.temperature)

  return {
    dataset_id: dataset.id,
    filename: dataset.filename,
    uploaded_at: dataset.uploaded_at,
    total_equipment: records.length,

    avg_flowrate: avg(f),
    avg_pressure: avg(p),
    avg_temperature: avg(t),

    min_flowrate: Math.min(...f),
    max_flowrate: Math.max(...f),
    min_pressure: Math.min(...p),
    max_pressure: Math.max(...p),
    min_temperature: Math.min(...t),
    max_temperature: Math.max(...t),

    std_flowrate: std(f),
    std_pressure: std(p),
    std_temperature: std(t),

    type_distribution: records.reduce((acc, r) => {
      acc[r.equipment_type] = (acc[r.equipment_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }
}

/* ===================== DEMO ANALYTICS API ===================== */

export const mockAPI = {
  async uploadCSV(file: File): Promise<UploadResponse> {
    const text = await file.text()
    const records = parseCSV(text)
    const store = loadDemoStore()

    const id = Date.now()

    const dataset: EquipmentDataset = {
      id,
      filename: file.name,
      uploaded_at: new Date().toISOString(),
      total_records: records.length,
      avg_flowrate: 0,
      avg_pressure: 0,
      avg_temperature: 0,
    }

    const summary = computeSummary(dataset, records)

    dataset.avg_flowrate = summary.avg_flowrate
    dataset.avg_pressure = summary.avg_pressure
    dataset.avg_temperature = summary.avg_temperature

    store.datasets.unshift(dataset)
    store.records[id] = records

    saveDemoStore(store)
    localStorage.setItem(API_MODE_KEY, "demo")

    return {
      message: "Upload successful (Demo Mode)",
      dataset,
      records_processed: records.length,
      summary,
    }
  },

  async getHistory(): Promise<HistoryResponse> {
    const store = loadDemoStore()
    return { count: store.datasets.length, datasets: store.datasets }
  },

  async getSummary(id: number): Promise<DatasetSummary> {
    const store = loadDemoStore()
    const dataset = store.datasets.find(d => d.id === id)!
    return computeSummary(dataset, store.records[id])
  },

  async getDataset(id: number): Promise<EquipmentDatasetDetail> {
    const store = loadDemoStore()
    const dataset = store.datasets.find(d => d.id === id)!

    return {
      ...dataset,
      username: "demo",
      records: store.records[id],
    }
  },
}

/* ===================== SMART UPLOAD (SAFE) ===================== */

export async function uploadCSVSmart(file: File) {
  try {
    return await analyticsAPI.uploadCSV(file)
  } catch {
    console.warn("⚠ Backend unreachable → switching to demo")
    return mockAPI.uploadCSV(file)
  }
}
