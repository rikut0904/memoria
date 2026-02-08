'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { clearAuthToken, clearRefreshToken } from '@/lib/auth'
import { readLogoutSignal } from '@/lib/logoutSync'

const SEEN_KEY = 'memoria_logout_seen'

export default function LogoutSync() {
  const pathname = usePathname()

  useEffect(() => {
    const check = () => {
      const ts = readLogoutSignal()
      if (!ts) return
      const seen = Number(window.localStorage.getItem(SEEN_KEY) || '0')
      if (ts <= seen) return

      window.localStorage.setItem(SEEN_KEY, String(ts))
      clearAuthToken()
      clearRefreshToken()

      if (pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    check()
    const id = window.setInterval(check, 2000)
    return () => window.clearInterval(id)
  }, [pathname])

  return null
}
