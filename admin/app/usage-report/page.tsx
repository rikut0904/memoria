'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { buildLoginUrl, getCurrentPathWithQuery } from '@/lib/backPath'
import GroupSwitchButton from '@/components/GroupSwitchButton'
import AppHeader from '@/components/AppHeader'

interface User {
  id: number
  email: string
  display_name: string
  role: string
}

export default function AdminUsageReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const meRes = await api.get('/me')
        setCurrentUser(meRes.data)

        if (meRes.data.role !== 'admin') {
          router.push('/')
          return
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        router.push(buildLoginUrl(getCurrentPathWithQuery()))
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen admin">
      <AppHeader
        title="Memoria - 管理"
        displayName={currentUser?.display_name}
        email={currentUser?.email}
        right={
          <>
            <GroupSwitchButton label="グループ一覧へ" />
          </>
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            管理トップへ戻る
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800">利用レポートの表示</h2>
          <p className="text-gray-600 mt-1">アクティブユーザーなどの利用状況を確認するページです。</p>
        </div>

        <div className="card text-gray-600">準備中です。</div>
      </main>
    </div>
  )
}
