import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Providers } from './providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Satark — AI-Powered Cyber Incident Intelligence',
    template: '%s | Satark',
  },
  description:
    'Report and analyze cyber threats with AI. Satark provides instant threat classification, IOC extraction, and mitigation playbooks for defence personnel.',
  keywords: ['cybersecurity', 'incident response', 'threat intelligence', 'AI', 'SIH 2025'],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Satark — AI-Powered Cyber Incident Intelligence',
    description:
      'Submit and analyze cyber threats with AI. Built for Indian defence cyber security operations.',
    siteName: 'Satark',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Satark AI Cyber Intelligence Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Satark — AI-Powered Cyber Incident Intelligence',
    description:
      'Submit and analyze cyber threats with AI. Built for Indian defence.',
  },
}

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        {/* Skip-to-content for accessibility */}
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg'
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
