'use client'

import { LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className='sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 shadow-sm'>
      <div />

      {/* User info + logout */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5'>
          <UserIcon className='h-4 w-4 text-gray-500' strokeWidth={1.5} />
          <span className='text-sm font-medium text-gray-700'>
            {user?.display_name}
          </span>
          <span className='rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium capitalize text-blue-600'>
            {user?.role}
          </span>
        </div>
        <Button variant='ghost' size='icon' onClick={logout} title='Logout'>
          <LogOut className='h-4 w-4' strokeWidth={1.5} />
        </Button>
      </div>
    </header>
  )
}
