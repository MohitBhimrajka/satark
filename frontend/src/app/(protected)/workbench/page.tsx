import type { Metadata } from 'next'
import { WorkbenchList } from '@/components/workbench/workbench-list'

export const metadata: Metadata = {
  title: 'Workbench — Satark',
  description: 'Triage, investigate, and manage cybersecurity incidents with AI-assisted threat analysis.',
}

export default function WorkbenchPage() {
  return <WorkbenchList />
}
