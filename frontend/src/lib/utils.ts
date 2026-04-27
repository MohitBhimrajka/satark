import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes with clsx. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format an ISO date string to a human-readable format. */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Format an ISO date string to include time. */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Format a date string as relative time (e.g. "2 hours ago"). */
export function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(dateString)
}

/** Get Tailwind color class for a threat score value. */
export function threatScoreColor(score: number): string {
  if (score >= 81) return 'text-red-500'
  if (score >= 61) return 'text-orange-500'
  if (score >= 31) return 'text-amber-500'
  return 'text-emerald-500'
}

/** Get Tailwind bg color class for a threat score value. */
export function threatScoreBg(score: number): string {
  if (score >= 81) return 'bg-red-500'
  if (score >= 61) return 'bg-orange-500'
  if (score >= 31) return 'bg-amber-500'
  return 'bg-emerald-500'
}

/** Get Tailwind color class for a classification label. */
export function classificationColor(cls: string): string {
  const map: Record<string, string> = {
    phishing: 'text-red-600 bg-red-50 border-red-200',
    malware: 'text-red-600 bg-red-50 border-red-200',
    fraud: 'text-amber-600 bg-amber-50 border-amber-200',
    espionage: 'text-purple-600 bg-purple-50 border-purple-200',
    opsec_risk: 'text-orange-600 bg-orange-50 border-orange-200',
    safe: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  }
  return map[cls] || 'text-gray-600 bg-gray-50 border-gray-200'
}

/** Get Tailwind color class for an incident status. */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    submitted: 'text-gray-600 bg-gray-100',
    analyzing: 'text-blue-600 bg-blue-50',
    analyzed: 'text-emerald-600 bg-emerald-50',
    analysis_failed: 'text-red-600 bg-red-50',
    investigating: 'text-amber-600 bg-amber-50',
    escalated: 'text-red-600 bg-red-50',
    resolved: 'text-emerald-600 bg-emerald-50',
    closed: 'text-gray-500 bg-gray-100',
  }
  return map[status] || 'text-gray-600 bg-gray-100'
}

/** Get Tailwind color class for a priority. */
export function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    critical: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  }
  return map[priority] || 'text-gray-600 bg-gray-50 border-gray-200'
}

/** Format file size in human-readable format. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
