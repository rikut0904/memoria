'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { clearCurrentGroup, getCurrentGroupId, getCurrentGroupName } from '@/lib/group'

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
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [groupName, setGroupName] = useState<string | null>(null)

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

        const postsRes = await api.get('/posts')
        setPosts(postsRes.data || [])

        const albumsRes = await api.get('/albums')
        setAlbums(albumsRes.data || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      clearCurrentGroup()
      await api.post('/logout')
      router.push('/login')
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-primary-600">Memoria</h1>
              {groupName && (
                <p className="text-xs text-gray-500 mt-1">グループ: {groupName}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.display_name || user?.email}</span>
              {user?.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin/users')}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  管理画面
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">投稿</h2>
              <button
                onClick={() => router.push('/posts/new')}
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
                    onClick={() => router.push(`/posts/${post.id}`)}
                  >
                    <h3 className="font-semibold text-gray-800">{post.title || '(タイトルなし)'}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(post.published_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">アルバム</h2>
              <button
                onClick={() => router.push('/albums/new')}
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
                    onClick={() => router.push(`/albums/${album.id}`)}
                  >
                    <div className="bg-gray-200 h-32 rounded mb-2 flex items-center justify-center text-gray-400">
                      📷
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800">{album.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{album.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/posts')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-800">投稿一覧</h3>
            <p className="text-sm text-gray-600 mt-1">すべての投稿を見る</p>
          </button>

          <button
            onClick={() => router.push('/albums')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📸</div>
            <h3 className="font-semibold text-gray-800">アルバム一覧</h3>
            <p className="text-sm text-gray-600 mt-1">すべてのアルバムを見る</p>
          </button>

          <button
            onClick={() => router.push('/anniversaries')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">🎂</div>
            <h3 className="font-semibold text-gray-800">記念日</h3>
            <p className="text-sm text-gray-600 mt-1">記念日を管理</p>
          </button>

          <button
            onClick={() => router.push('/trips')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">🧳</div>
            <h3 className="font-semibold text-gray-800">旅行</h3>
            <p className="text-sm text-gray-600 mt-1">旅行の予定を管理</p>
          </button>
        </div>
      </main>
    </div>
  )
}
