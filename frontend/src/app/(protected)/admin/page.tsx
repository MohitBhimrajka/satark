import type { Metadata } from 'next'
import { AdminPanel } from '@/components/admin/admin-panel'

export const metadata: Metadata = {
  title: 'Admin — Satark',
  description: 'User management and platform administration for Satark cybersecurity portal.',
}

export default function AdminPage() {
  return <AdminPanel />
}
