/**
 * Satark — ThreatAnalysis and quick-scan types mirroring app/schemas/analysis.py
 */

export type Classification =
  | 'phishing'
  | 'malware'
  | 'fraud'
  | 'espionage'
  | 'opsec_risk'
  | 'safe'

export interface ThreatAnalysis {
  classification: Classification
  threat_score: number
  confidence: number
  summary: string
  indicators: string[]
  mitigation_steps: string[]
  risk_factors: string[]
}

export interface QuickScanRequest {
  input_type: 'text' | 'url'
  content: string
}

export interface QuickScanResponse {
  analysis: ThreatAnalysis
  analyzed_at: string
}
