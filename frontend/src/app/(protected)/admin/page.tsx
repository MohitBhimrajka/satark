'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'
import { Users, Loader2 } from 'lucide-react'
import type { User, ApiListResponse } from '@/types'
import { ROLES } from '@/lib/constants'

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/dashboard')
      return
    }

    api.get<ApiListResponse<User>>('/api/admin/users')
      .then((res) => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [isAdmin, router])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId)
    try {
      const res = await api.patch<{ data: User }>(`/api/admin/users/${userId}`, { role: newRole })
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...res.data, role: newRole as User['role'] } : u))
      )
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!isAdmin) return null

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Admin Panel'
        description='User management and platform administration.'
      />

      <div className='rounded-xl border border-gray-200 bg-white shadow-soft'>
        {loading ? (
          <div className='space-y-0'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-4 border-b border-gray-100 px-5 py-3'>
                <Skeleton className='h-9 w-9 rounded-full' />
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-5 w-20' />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title='No users found'
            description='There are no registered users yet.'
            className='border-none rounded-xl'
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-100'>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    User
                  </th>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Email
                  </th>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Role
                  </th>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Joined
                  </th>
                  <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className='border-b border-gray-50 transition-colors hover:bg-gray-50/50'
                  >
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-blue-50'>
                          <span className='text-sm font-bold text-blue-600'>
                            {user.display_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className='text-sm font-medium text-gray-900'>
                          {user.display_name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className='px-5 py-3.5 text-sm text-gray-500'>
                      {user.email}
                    </td>
                    <td className='px-5 py-3.5'>
                      <Badge variant={user.role === 'admin' ? 'critical' : 'default'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className='px-5 py-3.5 text-sm text-gray-500'>
                      {formatDateTime(user.created_at)}
                    </td>
                    <td className='px-5 py-3.5'>
                      {updatingId === user.id ? (
                        <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className='rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700'
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
