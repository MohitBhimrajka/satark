'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { SWRConfig } from 'swr'
import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      <AuthProvider>
        {children}
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              background: '#fff',
              color: '#1E293B',
              fontSize: '14px',
              boxShadow:
                '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </AuthProvider>
    </SWRConfig>
  )
}
