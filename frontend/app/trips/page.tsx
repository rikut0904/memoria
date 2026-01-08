'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { auth } from '@/lib/firebase'

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
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login')
        return
      }

      try {
        const res = await api.get('/trips')
        setTrips(res.data || [])
      } catch (err: any) {
        console.error('Failed to fetch trips:', err)
        setError(err.response?.data?.message || '旅行一覧の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary-600">旅行</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                ダッシュボードに戻る
              </button>
              <button
                onClick={() => router.push('/trips/new')}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                新規旅行
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            旅行が登録されていません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
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
                    onClick={() => router.push(`/trips/${trip.id}`)}
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
                      onClick={() => router.push(`/posts/new?trip_id=${trip.id}`)}
                      className="w-24 px-4 py-2 text-sm text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      投稿
                    </button>
                    <button
                      onClick={() => router.push(`/albums/new?trip_id=${trip.id}`)}
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
