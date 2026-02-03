'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import api from '@/lib/api'
import { getCurrentGroupId, getCurrentGroupName } from '@/lib/group'
import { buildLoginUrl, getCurrentPathWithQuery } from '@/lib/backPath'
import GroupSwitchButton from '@/components/GroupSwitchButton'
import DashboardButton from '@/components/DashboardButton'
import AppHeader from '@/components/AppHeader'

export default function NewPostClient() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.groupId as string
  const searchParams = useSearchParams()
  const [user, setUser] = useState<{ display_name: string; email: string } | null>(null)
  const tripId = searchParams.get('trip_id')
  const redirect = searchParams.get('redirect')
  const backPath = redirect && redirect.startsWith('/')
    ? redirect
    : `/${groupId}/trips`

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const groupId = getCurrentGroupId()
        if (!groupId) {
          router.push('/')
          return
        }
        const meRes = await api.get('/me')
        setUser(meRes.data)
      } catch {
        router.push(buildLoginUrl(getCurrentPathWithQuery()))
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen">
      <AppHeader
        title="投稿作成"
        displayName={user?.display_name}
        email={user?.email}
        right={
          <>
            <GroupSwitchButton label="グループ一覧へ" />
            <DashboardButton label="ダッシュボードへ" />
          </>
        }
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getCurrentGroupName() && <h1>{getCurrentGroupName()}</h1>}
        <div className="card text-center max-w-md mx-auto">
          <div className="text-2xl font-bold text-primary-600 mb-2">投稿作成</div>
          <p className="text-gray-600">この画面は準備中です。</p>
          {tripId && (
            <p className="text-sm text-gray-500 mt-2">
              旅程ID: {tripId}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => router.push(backPath)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              旅行一覧に戻る
            </button>
            <GroupSwitchButton label="グループ一覧へ" className="w-full" />
          </div>
        </div>
      </main>
    </div>
  )
}
