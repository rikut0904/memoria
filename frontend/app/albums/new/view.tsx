'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { getCurrentGroupId } from '@/lib/group'
import { buildLoginUrl, getCurrentPathWithQuery } from '@/lib/backPath'

export default function NewAlbumClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tripId = searchParams.get('trip_id')
  const redirect = searchParams.get('redirect')
  const backPath = redirect && redirect.startsWith('/') ? redirect : '/trips'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const groupId = getCurrentGroupId()
        if (!groupId) {
          router.push('/')
          return
        }
        await api.get('/me')
      } catch {
        router.push(buildLoginUrl(getCurrentPathWithQuery()))
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow p-8 text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-primary-600 mb-2">アルバム作成</h1>
        <p className="text-gray-600">この画面は準備中です。</p>
        {tripId && (
          <p className="text-sm text-gray-500 mt-2">
            旅程ID: {tripId}
          </p>
        )}
        <button
          onClick={() => router.push(backPath)}
          className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          旅行一覧に戻る
        </button>
      </div>
    </div>
  )
}
