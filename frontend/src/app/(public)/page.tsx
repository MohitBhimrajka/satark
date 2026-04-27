import { Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className='flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50'>
      <div className='space-y-6 text-center'>
        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 shadow-lg'>
          <Shield className='h-10 w-10 text-white' strokeWidth={1.5} />
        </div>
        <div className='space-y-2'>
          <h1 className='text-5xl font-bold tracking-tight text-navy-900'>
            Satark
          </h1>
          <p className='text-lg text-gray-500'>
            AI-Powered Cyber Incident Intelligence Portal
          </p>
        </div>
        <div className='flex items-center justify-center gap-3'>
          <Link href='/submit'>
            <Button size='lg'>Report an Incident</Button>
          </Link>
          <Link href='/login'>
            <Button variant='outline' size='lg'>
              Analyst Login
            </Button>
          </Link>
        </div>
        <div className='rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-soft'>
          <p className='text-sm text-gray-600'>
            Phase 4 in progress — Frontend build underway.
            <br />
            <span className='font-mono text-xs text-gray-400'>
              SIH 2025 • PS 25210
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
