'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { setAuthToken, setRefreshToken } from '@/lib/auth'

export default function TokenBridge() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('auth_token')
    const refresh = searchParams.get('refresh_token')
    if (!token && !refresh) return

    if (token) setAuthToken(token)
    if (refresh) setRefreshToken(refresh)

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete('auth_token')
    nextParams.delete('refresh_token')
    const nextQuery = nextParams.toString()
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname
    router.replace(nextUrl)
  }, [pathname, router, searchParams])

  return null
}
