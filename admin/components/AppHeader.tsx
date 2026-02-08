'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { clearAuthToken, clearRefreshToken } from '@/lib/auth'
import { signalLogout } from '@/lib/logoutSync'

type AppHeaderProps = {
  title: ReactNode
  right?: ReactNode
  maxWidthClassName?: string
  displayName?: string
  email?: string
  showLogout?: boolean
}

export default function AppHeader({
  title,
  right,
  maxWidthClassName = 'max-w-7xl',
  displayName,
  email,
  showLogout = true,
}: AppHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    clearAuthToken()
    clearRefreshToken()
    signalLogout()
    try {
      await api.post('/logout')
    } finally {
      router.push('/login')
    }
  }

  return (
    <header>
      <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          <div>
            <div className="text-2xl font-bold text-primary-600">{title}</div>
          </div>
          <div className="flex items-center gap-3">
            {(displayName || email) && (
              <span className="text-gray-700">{displayName || email}</span>
            )}
            {right}
            {showLogout && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                ログアウト
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
