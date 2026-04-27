'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PageTransition } from '@/components/layout/page-transition'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show nothing while checking auth
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className='flex min-h-screen'>
      <Sidebar />
      <div
        className='flex flex-1 flex-col'
        style={{ marginLeft: 'var(--sidebar-width, 260px)' }}
      >
        <Header />
        <main className='flex-1 bg-gray-50 p-6 lg:p-8'>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
