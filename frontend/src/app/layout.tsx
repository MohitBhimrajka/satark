import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Satark — AI-Powered Cyber Incident Intelligence',
  description:
    'Report and analyze cyber threats with AI. Satark provides instant threat classification, IOC extraction, and mitigation playbooks for defence personnel.',
  keywords: ['cybersecurity', 'incident response', 'threat intelligence', 'AI'],
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
        {children}
      </body>
    </html>
  )
}
