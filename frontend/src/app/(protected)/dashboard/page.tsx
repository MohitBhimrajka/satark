import type { Metadata } from 'next'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export const metadata: Metadata = {
  title: 'Dashboard — Satark',
  description: 'Real-time analytics and incident intelligence overview for the Satark cybersecurity platform.',
}

export default function DashboardPage() {
  return <DashboardView />
}
