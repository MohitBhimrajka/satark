/**
 * Satark — Dashboard types mirroring app/schemas/dashboard.py
 */

export interface DashboardStats {
  total_incidents: number
  by_status: Record<string, number>
  by_priority: Record<string, number>
  by_classification: Record<string, number>
  avg_threat_score: number | null
}

export interface ChartDataPoint {
  label: string
  value: number
  [key: string]: string | number
}

export interface ChartData {
  chart_type: string
  data: ChartDataPoint[]
}
