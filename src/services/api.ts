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

/* ===================== Configuration ===================== */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

/* ===================== Base Helpers ===================== */

const baseFetchOptions: RequestInit = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
}

function getCSRFToken(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : null
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Request failed"
    try {
      const data = await response.json()
      message = data?.error || data?.detail || data?.message || message
    } catch (error) {
      // Ignore JSON parse errors
    }
    throw new Error(message)
  }

  if (response.status === 204) return {} as T
  return response.json()
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const csrfToken = getCSRFToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...baseFetchOptions,
    ...options,
    headers: {
      ...baseFetchOptions.headers,
      ...options.headers,
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    },
  })

  return handleResponse<T>(response)
}

/* ===================== Auth API ===================== */

export const authAPI = {
  login: (username: string, password: string) =>
    apiRequest<AuthResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    apiRequest<{ message: string }>("/auth/logout/", { method: "POST" }),

  getCurrentUser: () =>
    apiRequest<{ user: User; isAuthenticated: boolean }>("/auth/me/"),
}

/* ===================== Analytics API CONTRACT ===================== */

export type AnalyticsAPI = {
  uploadCSV: (file: File) => Promise<UploadResponse>
  getHistory: () => Promise<HistoryResponse>
  getSummary: (id: number) => Promise<DatasetSummary>
  getDataset: (id: number) => Promise<EquipmentDatasetDetail>
  deleteDataset?: (id: number) => Promise<void>
  getReportUrl?: (id: number) => string
}

/* ===================== Backend Analytics API ===================== */

export const analyticsAPI: AnalyticsAPI = {
  uploadCSV: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const csrfToken = getCSRFToken()

    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: "POST",
      credentials: "include",
      headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
      body: formData,
    })

    return handleResponse<UploadResponse>(response)
  },

  getHistory: () => apiRequest<HistoryResponse>("/history/"),

  getSummary: (id: number) =>
    apiRequest<DatasetSummary>(`/summary/${id}/`),

  getDataset: (id: number) =>
    apiRequest<EquipmentDatasetDetail>(`/dataset/${id}/`),

  deleteDataset: (id: number) =>
    apiRequest<void>(`/dataset/${id}/`, { method: "DELETE" }),

  getReportUrl: (id: number) =>
    `${API_BASE_URL}/report/${id}/`,
}

/* ===================== MOCK DATA ===================== */

const mockDatasets: EquipmentDataset[] = [
  {
    id: 1,
    filename: "equipment_batch_001.csv",
    uploaded_at: new Date().toISOString(),
    total_records: 12,
    avg_flowrate: 120.4,
    avg_pressure: 3.1,
    avg_temperature: 46.8,
  },
]

function generateMockRecords(): EquipmentRecord[] {
  const types = ["pump", "valve", "reactor", "compressor"]

  return Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    name: `EQ-${100 + i}`,
    equipment_type: types[i % types.length],
    flowrate: 80 + Math.random() * 120,
    pressure: 1.5 + Math.random() * 6,
    temperature: 25 + Math.random() * 70,
  }))
}

/* ===================== MOCK ANALYTICS API (FULL MATCH) ===================== */

export const mockAPI: AnalyticsAPI = {
  async uploadCSV(file: File): Promise<UploadResponse> {
    await new Promise((r) => setTimeout(r, 800))

    const dataset: EquipmentDataset = {
      id: Date.now(),
      filename: file.name,
      uploaded_at: new Date().toISOString(),
      total_records: 12,
      avg_flowrate: 118.7,
      avg_pressure: 3.4,
      avg_temperature: 44.9,
    }

    mockDatasets.unshift(dataset)

    return {
      message: "Upload successful (Demo Mode)",
      dataset,
      records_processed: dataset.total_records,
      summary: {
        total_equipment: dataset.total_records,
        avg_flowrate: dataset.avg_flowrate!,
        avg_pressure: dataset.avg_pressure!,
        avg_temperature: dataset.avg_temperature!,
        type_distribution: {
          pump: 4,
          valve: 3,
          reactor: 3,
          compressor: 2,
        },
      },
    }
  },

  async getHistory(): Promise<HistoryResponse> {
    return { count: mockDatasets.length, datasets: mockDatasets }
  },

  async getSummary(id: number): Promise<DatasetSummary> {
    const d = mockDatasets.find((x) => x.id === id)!
    return {
      dataset_id: id,
      filename: d.filename,
      uploaded_at: d.uploaded_at,
      total_equipment: d.total_records,
      avg_flowrate: d.avg_flowrate!,
      avg_pressure: d.avg_pressure!,
      avg_temperature: d.avg_temperature!,
      min_flowrate: 20,
      max_flowrate: 280,
      min_pressure: 0.5,
      max_pressure: 8,
      min_temperature: 18,
      max_temperature: 95,
      std_flowrate: 38,
      std_pressure: 1.6,
      std_temperature: 15,
      type_distribution: {
        pump: 4,
        valve: 3,
        reactor: 3,
        compressor: 2,
      },
    }
  },

  async getDataset(id: number): Promise<EquipmentDatasetDetail> {
    const d = mockDatasets.find((x) => x.id === id)!
    return {
      ...d,
      username: "demo",
      records: generateMockRecords(),
    }
  },
}

/* ===================== SMART UPLOAD (SAFE FALLBACK) ===================== */

export async function uploadCSVSmart(file: File) {
  try {
    return await analyticsAPI.uploadCSV(file)
  } catch {
    console.warn("⚠️ Backend unavailable → switching to demo mode")
    return mockAPI.uploadCSV(file)
  }
}
