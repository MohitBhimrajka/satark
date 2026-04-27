'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Shield, Menu, X, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/submit', label: 'Report Incident' },
]

const AUTH_NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/workbench', label: 'Workbench' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const allLinks = [
    ...NAV_LINKS,
    ...(isAuthenticated ? AUTH_NAV_LINKS : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className='sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2.5'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 shadow-sm'>
            <Shield className='h-5 w-5 text-white' strokeWidth={1.5} />
          </div>
          <span className='text-xl font-bold tracking-tight text-navy-900'>
            Satark
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className='hidden items-center gap-1 md:flex'>
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className='hidden items-center gap-2 md:flex'>
          {isAuthenticated ? (
            <div className='flex items-center gap-3'>
              <span className='text-sm text-gray-500'>
                {user?.display_name}
              </span>
              <Button variant='ghost' size='sm' onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link href='/login'>
                <Button variant='ghost' size='sm'>
                  <LogIn className='mr-1.5 h-4 w-4' strokeWidth={1.5} />
                  Login
                </Button>
              </Link>
              <Link href='/register'>
                <Button size='sm'>
                  <UserPlus className='mr-1.5 h-4 w-4' strokeWidth={1.5} />
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className='rounded-lg p-2 text-gray-600 hover:bg-gray-50 md:hidden'
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label='Toggle menu'
        >
          {mobileOpen ? (
            <X className='h-5 w-5' strokeWidth={1.5} />
          ) : (
            <Menu className='h-5 w-5' strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className='border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden'>
          <div className='flex flex-col gap-1'>
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium',
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className='my-2 border-gray-100' />
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                }}
                className='rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-gray-50'
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href='/login'
                  onClick={() => setMobileOpen(false)}
                  className='rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50'
                >
                  Login
                </Link>
                <Link
                  href='/register'
                  onClick={() => setMobileOpen(false)}
                  className='rounded-lg px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50'
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
