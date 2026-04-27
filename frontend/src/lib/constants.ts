/**
 * Satark — Frontend constants mirroring app/core/constants.py
 */

export const INCIDENT_STATUSES = [
  'submitted',
  'analyzing',
  'analyzed',
  'analysis_failed',
  'investigating',
  'escalated',
  'resolved',
  'closed',
] as const

export const CLASSIFICATIONS = [
  'phishing',
  'malware',
  'fraud',
  'espionage',
  'opsec_risk',
  'safe',
] as const

export const INPUT_TYPES = [
  'text',
  'url',
  'image',
  'audio',
  'video',
  'document',
] as const

export const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const

export const ROLES = ['guest', 'analyst', 'admin'] as const

/** Human-readable labels for input types. */
export const INPUT_TYPE_LABELS: Record<string, string> = {
  text: 'Text Message',
  url: 'URL / Link',
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
  document: 'Document',
}

/** Human-readable labels for incident statuses. */
export const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  analyzing: 'Analyzing',
  analyzed: 'Analyzed',
  analysis_failed: 'Analysis Failed',
  investigating: 'Investigating',
  escalated: 'Escalated',
  resolved: 'Resolved',
  closed: 'Closed',
}

/** Human-readable labels for classifications. */
export const CLASSIFICATION_LABELS: Record<string, string> = {
  phishing: 'Phishing',
  malware: 'Malware',
  fraud: 'Fraud',
  espionage: 'Espionage',
  opsec_risk: 'OPSEC Risk',
  safe: 'Safe',
}

/** Valid chart types matching backend dashboard router. */
export const CHART_TYPES = [
  'incidents_by_type',
  'classification_breakdown',
  'severity_distribution',
  'status_overview',
  'trend_line',
  'confidence_distribution',
] as const
