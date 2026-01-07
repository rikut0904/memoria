'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  albums?: {
    id: number
    title: string
    description: string
  }[]
  posts?: {
    id: number
    type: string
    title: string
    body: string
    published_at: string
  }[]
}

export default function TripDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.id as string
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login')
        return
      }

      try {
        const res = await api.get(`/trips/${tripId}`)
        setTrip(res.data)
      } catch (err: any) {
        console.error('Failed to fetch trip:', err)
        setError(err.response?.data?.message || '旅行の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, tripId])

  const handleDelete = async () => {
    if (!trip) {
      return
    }
    if (!confirm(`「${trip.title}」を削除しますか？`)) {
      return
    }

    setDeleting(true)
    try {
      await api.delete(`/trips/${trip.id}`)
      router.push('/trips')
    } catch (err: any) {
      console.error('Failed to delete trip:', err)
      setError(err.response?.data?.message || '旅行の削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-700">{error || '旅行が見つかりません'}</p>
          <button
            onClick={() => router.push('/trips')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            旅行一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary-600">旅行詳細</h1>
            <button
              onClick={() => router.push('/trips')}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              旅行一覧に戻る
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{trip.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(trip.start_at).toLocaleDateString('ja-JP')} 〜{' '}
                {new Date(trip.end_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => router.push(`/posts/new?trip_id=${trip.id}&redirect=/trips/${trip.id}`)}
                className="w-24 px-4 py-2 text-sm text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                投稿
              </button>
              <button
                onClick={() => router.push(`/albums/new?trip_id=${trip.id}&redirect=/trips/${trip.id}`)}
                className="w-24 px-4 py-2 text-sm text-center border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50"
              >
                アルバム
              </button>
            </div>
          </div>

          {(trip.albums && trip.albums.length > 0) || (trip.posts && trip.posts.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">紐づけたアルバム</h3>
                {trip.albums && trip.albums.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {trip.albums.map((album) => (
                      <li key={album.id} className="flex items-start gap-2">
                        <span className="text-gray-400">📷</span>
                        <div>
                          <p className="font-medium">{album.title}</p>
                          {album.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{album.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">紐づけられていません</p>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">紐づけた投稿</h3>
                {trip.posts && trip.posts.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {trip.posts.map((post) => (
                      <li key={post.id} className="flex items-start gap-2">
                        <span className="text-gray-400">📝</span>
                        <div>
                          <p className="font-medium">{post.title || '(タイトルなし)'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.published_at).toLocaleDateString('ja-JP')} / {post.type}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">紐づけられていません</p>
                )}
              </div>
            </div>
          ) : null}

          {trip.notify_at && (
            <p className="text-sm text-gray-500">
              通知予定: {new Date(trip.notify_at).toLocaleString('ja-JP')}
            </p>
          )}

          {trip.note && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {trip.note}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {deleting ? '削除中...' : '旅行を削除'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
