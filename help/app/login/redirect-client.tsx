'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_BASE_URL || 'http://localhost:3001'
const DEFAULT_SCOPE = 'app'

export default function LoginRedirectClient() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const raw = searchParams.get('back-path')
    const url = new URL('/login', AUTH_BASE_URL)
    if (!raw) {
      url.searchParams.set('back_path', DEFAULT_SCOPE)
      window.location.replace(url.toString())
      return
    }
    if (raw.startsWith('/')) {
      url.searchParams.set('back_path', `${DEFAULT_SCOPE}${raw}`)
    } else {
      url.searchParams.set('back_path', raw)
    }
    window.location.replace(url.toString())
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">リダイレクト中...</p>
    </div>
  )
}
