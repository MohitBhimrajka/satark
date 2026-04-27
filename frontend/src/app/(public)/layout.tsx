'use client'

import { Navbar } from '@/components/layout/navbar'
import { PageTransition } from '@/components/layout/page-transition'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
    </>
  )
}
