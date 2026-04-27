'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  ShieldCheck,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workbench', label: 'Workbench', icon: Briefcase },
  { href: '/admin', label: 'Admin Panel', icon: ShieldCheck, adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  )

  return (
    <aside
      className='fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white'
      style={{ width: 'var(--sidebar-width, 260px)' }}
      aria-label='Main navigation'
    >
      {/* Logo */}
      <div className='flex h-16 items-center gap-2.5 border-b border-gray-100 px-6'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 shadow-sm'>
          <Shield className='h-5 w-5 text-white' strokeWidth={1.5} />
        </div>
        <span className='text-xl font-bold tracking-tight text-navy-900'>
          Satark
        </span>
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-3 py-4' aria-label='Sidebar navigation'>
        <ul className='flex flex-col gap-1'>
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className='h-5 w-5' strokeWidth={1.5} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className='border-t border-gray-100 px-6 py-4'>
        <p className='text-xs text-gray-400'>
          SIH 2025 • PS 25210
        </p>
      </div>
    </aside>
  )
}
