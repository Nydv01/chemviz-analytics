/**
 * API Types for Chemical Equipment Parameter Visualizer
 */

// Equipment record from dataset
export interface EquipmentRecord {
  id: number;
  name: string;
  equipment_type: string;
  flowrate: number;
  pressure: number;
  temperature: number;
}

// Dataset metadata
export interface EquipmentDataset {
  id: number;
  filename: string;
  uploaded_at: string;
  total_records: number;
  avg_flowrate: number | null;
  avg_pressure: number | null;
  avg_temperature: number | null;
  username?: string;
}

// Full dataset with records
export interface EquipmentDatasetDetail extends EquipmentDataset {
  records: EquipmentRecord[];
}

// Summary analytics response
export interface DatasetSummary {
  dataset_id: number;
  filename: string;
  uploaded_at: string;
  total_equipment: number;
  avg_flowrate: number;
  avg_pressure: number;
  avg_temperature: number;
  min_flowrate: number;
  max_flowrate: number;
  min_pressure: number;
  max_pressure: number;
  min_temperature: number;
  max_temperature: number;
  std_flowrate: number;
  std_pressure: number;
  std_temperature: number;
  type_distribution: Record<string, number>;
}

// Upload response
export interface UploadResponse {
  message: string;
  dataset: EquipmentDataset;
  records_processed: number;
  summary: {
    total_equipment: number;
    avg_flowrate: number;
    avg_pressure: number;
    avg_temperature: number;
    type_distribution: Record<string, number>;
  };
  warnings?: string[];
}

// History response
export interface HistoryResponse {
  count: number;
  datasets: EquipmentDataset[];
}

// User data
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
}

// Auth response
export interface AuthResponse {
  message: string;
  user: User;
  csrfToken?: string;
}

// API Error
export interface APIError {
  error: string;
  details?: string | Record<string, string[]>;
}

// Chart data point for visualization
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Statistics display
export interface StatisticItem {
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}
