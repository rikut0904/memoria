'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { clearCurrentGroup, getCurrentGroupId, getCurrentGroupName } from '@/lib/group'
import { clearAuthToken, clearRefreshToken } from '@/lib/auth'
import { signalLogout } from '@/lib/logoutSync'
import { buildLoginUrl, getCurrentPathWithQuery } from '@/lib/backPath'
import GroupSwitchButton from '@/components/GroupSwitchButton'
import AppHeader from '@/components/AppHeader'

interface User {
  id: number
  email: string
  display_name: string
  role: string
}

interface Post {
  id: number
  type: string
  title: string
  body: string
  author_id: number
  published_at: string
}

interface Album {
  id: number
  title: string
  description: string
  created_by: number
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const params = useParams()
  const groupIdParam = params.groupId as string
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [groupName, setGroupName] = useState<string | null>(null)
  const [isManager, setIsManager] = useState(false)
  const groupId = getCurrentGroupId()

  useEffect(() => {
    const fetchData = async () => {
      const groupId = getCurrentGroupId()
      if (!groupId) {
        router.push('/')
        return
      }

      try {
        const userRes = await api.get('/me')
        setUser(userRes.data)
        setGroupName(getCurrentGroupName())

        const [postsRes, albumsRes, membersRes] = await Promise.all([
          api.get('/posts'),
          api.get('/albums'),
          groupId ? api.get(`/groups/${groupId}/members`) : Promise.resolve({ data: [] }),
        ])
        setPosts(postsRes.data || [])
        setAlbums(albumsRes.data || [])
        const meMember = (membersRes.data || []).find((m: { user_id: number; role: string }) => m.user_id === userRes.data.id)
        setIsManager(meMember?.role === 'manager')
      } catch (error) {
        console.error('Failed to fetch data:', error)
        router.push(buildLoginUrl(getCurrentPathWithQuery()))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      clearCurrentGroup()
      clearAuthToken()
      clearRefreshToken()
      signalLogout()
      await api.post('/logout')
      router.push(buildLoginUrl(getCurrentPathWithQuery()))
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

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
        title="Memoria"
        displayName={user?.display_name}
        email={user?.email}
        right={
          <>
            <GroupSwitchButton label="グループ一覧へ" />
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              ログアウト
            </button>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {groupName && <h1>{groupName}</h1>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">投稿</h2>
              <button
                onClick={() => router.push(`/${groupIdParam}/posts/new`)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
              >
                新規投稿
              </button>
            </div>
            {posts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">投稿がありません</p>
            ) : (
              <div className="space-y-3">
                {posts.slice(0, 5).map((post) => (
                  <div
                    key={post.id}
                    className="border-l-4 border-primary-500 pl-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/${groupIdParam}/posts/${post.id}`)}
                  >
                    <div className="font-semibold text-gray-800">{post.title || '(タイトルなし)'}</div>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.published_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">アルバム</h2>
              <button
                onClick={() => router.push(`/${groupIdParam}/albums/new`)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
              >
                新規アルバム
              </button>
            </div>
            {albums.length === 0 ? (
              <p className="text-gray-500 text-center py-4">アルバムがありません</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {albums.slice(0, 6).map((album) => (
                  <div
                    key={album.id}
                    className="border rounded-lg p-3 hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => router.push(`/${groupIdParam}/albums/${album.id}`)}
                  >
                    <div className="bg-gray-200 h-32 rounded mb-2 flex items-center justify-center text-gray-400">
                      📷
                    </div>
                    <div className="font-semibold text-sm text-gray-800">{album.title}</div>
                    <p className="text-xs text-gray-500 truncate">{album.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push(`/${groupIdParam}/posts`)}
            className="card hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📝</div>
            <div className="font-semibold text-gray-800">投稿一覧</div>
            <p className="text-sm text-gray-600 mt-1">すべての投稿を見る</p>
          </button>

          <button
            onClick={() => router.push(`/${groupIdParam}/albums`)}
            className="card hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📸</div>
            <div className="font-semibold text-gray-800">アルバム一覧</div>
            <p className="text-sm text-gray-600 mt-1">すべてのアルバムを見る</p>
          </button>

          <button
            onClick={() => router.push(`/${groupIdParam}/trips`)}
            className="card hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">🧳</div>
            <div className="font-semibold text-gray-800">旅行</div>
            <p className="text-sm text-gray-600 mt-1">旅行の予定を管理</p>
          </button>

          {isManager && (
            <button
              onClick={() => {
                if (groupId) {
                  router.push(`/${groupIdParam}/manage`)
                }
              }}
              disabled={!groupId}
              className="card hover:shadow-lg transition-shadow text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-2">👥</div>
              <div className="font-semibold text-gray-800">招待・管理</div>
              <p className="text-sm text-gray-600 mt-1">メンバー招待と権限管理</p>
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
