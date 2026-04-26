import { Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50'>
      <div className='text-center space-y-6'>
        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 shadow-lg'>
          <Shield className='h-10 w-10 text-white' />
        </div>
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight text-slate-900'>
            Satark
          </h1>
          <p className='text-lg text-slate-500'>
            AI-Powered Cyber Incident Intelligence Portal
          </p>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-soft'>
          <p className='text-sm text-slate-600'>
            Phase 1 complete — Foundation ready.
            <br />
            <span className='font-mono text-xs text-slate-400'>
              SIH 2025 • PS 25210
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
