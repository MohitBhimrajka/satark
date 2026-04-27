import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50'>
      <div className='w-full max-w-md space-y-6 text-center'>
        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100'>
          <Shield className='h-10 w-10 text-blue-500' strokeWidth={1.5} />
        </div>
        <div className='space-y-2'>
          <h1 className='text-6xl font-bold tracking-tight text-navy-900'>
            404
          </h1>
          <p className='text-lg text-gray-500'>
            Page not found. The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Link href='/'>
          <Button variant='outline' size='lg'>
            <ArrowLeft className='mr-2 h-4 w-4' strokeWidth={1.5} />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
