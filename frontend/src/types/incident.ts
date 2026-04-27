/**
 * Satark — Incident types mirroring app/schemas/incident.py
 */

import type { EvidenceFile } from './evidence'

export type InputType = 'text' | 'url' | 'image' | 'audio' | 'video' | 'document'

export type IncidentStatus =
  | 'submitted'
  | 'analyzing'
  | 'analyzed'
  | 'analysis_failed'
  | 'investigating'
  | 'escalated'
  | 'resolved'
  | 'closed'

export type Priority = 'critical' | 'high' | 'medium' | 'low'

export interface AuditLogEntry {
  id: string
  actor_label: string
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

export interface Incident {
  id: string
  case_number: string
  input_type: InputType
  input_content: string | null
  description: string | null
  status: IncidentStatus
  priority: Priority | null
  classification: string | null
  threat_score: number | null
  confidence: number | null
  ai_analysis: Record<string, unknown> | null
  analyst_notes: string | null
  guest_token: string | null
  assigned_to: string | null
  evidence_files: EvidenceFile[]
  audit_logs: AuditLogEntry[]
  created_at: string
  updated_at: string
}

export interface IncidentListItem {
  id: string
  case_number: string
  input_type: InputType
  status: IncidentStatus
  priority: Priority | null
  classification: string | null
  threat_score: number | null
  created_at: string
}

export interface IncidentCreate {
  input_type: InputType
  input_content?: string
  description?: string
}

export interface IncidentUpdate {
  status?: string
  priority?: string
  analyst_notes?: string
  assigned_to?: string
}

export interface IncidentFilter {
  status?: string
  priority?: string
  classification?: string
  start_date?: string
  end_date?: string
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}
