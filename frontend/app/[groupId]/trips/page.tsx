'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { getCurrentGroupId, getCurrentGroupName } from '@/lib/group'
import { buildLoginUrl, getCurrentPathWithQuery } from '@/lib/backPath'
import GroupSwitchButton from '@/components/GroupSwitchButton'
import DashboardButton from '@/components/DashboardButton'
import AppHeader from '@/components/AppHeader'

interface User {
  id: number
  email: string
  display_name: string
}

interface Trip {
  id: number
  title: string
  start_at: string
  end_at: string
  note: string
  created_by: number
  notify_at?: string | null
  created_at: string
}

export default function TripsPage() {
  const router = useRouter()
  const params = useParams()
  const groupIdParam = params.groupId as string
  const [user, setUser] = useState<User | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const groupId = getCurrentGroupId()

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const groupId = getCurrentGroupId()
        if (!groupId) {
          router.push('/')
          return
        }
        const userRes = await api.get('/me')
        setUser(userRes.data)
        const res = await api.get('/trips')
        setTrips(res.data || [])
      } catch (err) {
        console.error('Failed to fetch trips:', err)
        setError(getErrorMessage(err, '旅行一覧の取得に失敗しました'))
        router.push(buildLoginUrl(getCurrentPathWithQuery()))
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        title="旅行"
        displayName={user?.display_name}
        email={user?.email}
        right={
          <>
            <GroupSwitchButton label="グループ一覧へ" />
            <DashboardButton label="ダッシュボードへ" />
            <button
              onClick={() => router.push(`/${groupIdParam}/trips/new`)}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              新規旅行
            </button>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getCurrentGroupName() && <h1>{getCurrentGroupName()}</h1>}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {trips.length === 0 ? (
          <div className="card text-center text-gray-500">
            旅行が登録されていません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{trip.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(trip.start_at).toLocaleDateString('ja-JP')} 〜{' '}
                      {new Date(trip.end_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/${groupIdParam}/trips/${trip.id}`)}
                    className="w-24 px-4 py-2 text-sm text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    詳細
                  </button>
                </div>
                {trip.note && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">{trip.note}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/${groupIdParam}/posts/new?trip_id=${trip.id}`)}
                      className="w-24 px-4 py-2 text-sm text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      投稿
                    </button>
                    <button
                      onClick={() => router.push(`/${groupIdParam}/albums/new?trip_id=${trip.id}`)}
                      className="w-24 px-4 py-2 text-sm text-center border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50"
                    >
                      アルバム
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
