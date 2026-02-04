'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { clearCurrentGroup, setCurrentGroup } from '@/lib/group'
import { clearAuthToken, clearRefreshToken, getAuthToken } from '@/lib/auth'
import { buildLoginUrl, getCurrentPathWithQuery } from '@/lib/backPath'
import AppHeader from '@/components/AppHeader'

interface User {
  id: number
  email: string
  display_name: string
  role: string
}

interface Group {
  id: number
  name: string
  created_by: number
  created_at: string
}

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [newGroupName, setNewGroupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = getAuthToken()
        if (!token) {
          router.replace(buildLoginUrl(getCurrentPathWithQuery()))
          return
        }
        const userRes = await api.get('/me')
        setUser(userRes.data)
        const res = await api.get('/groups')
        setGroups(res.data || [])
      } catch (err) {
        console.error('Failed to fetch groups:', err)
        clearAuthToken()
        clearRefreshToken()
        router.replace(buildLoginUrl(getCurrentPathWithQuery()))
      } finally {
        setLoading(false)
        setAuthChecked(true)
      }
    }

    fetchGroups()
  }, [router])

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return
    setCreating(true)
    setError('')

    try {
      const res = await api.post('/groups', { name: newGroupName.trim() })
      const created = res.data as Group
      setGroups((prev) => [created, ...prev])
      setNewGroupName('')
      setCurrentGroup(created.id, created.name)
      router.push(`/${created.id}`)
    } catch (err) {
      console.error('Failed to create group:', err)
      setError('グループの作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  const handleOpenGroup = (group: Group) => {
    setCurrentGroup(group.id, group.name)
    router.push(`/${group.id}`)
  }


  if (!authChecked) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-4">
            Memoria
          </div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Memoria"
        maxWidthClassName="max-w-5xl"
        displayName={user?.display_name}
        email={user?.email}
        right={
          <>
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin/users')}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                管理画面
              </button>
            )}
            <button
              onClick={async () => {
                clearCurrentGroup()
                clearAuthToken()
                clearRefreshToken()
                try {
                  await api.post('/logout')
                } finally {
                  router.push('/login')
                }
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              ログアウト
            </button>
          </>
        }
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="card border border-primary-200 bg-white/90">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h1>思い出を、ひとつの場所に</h1>
              <p className="text-sm text-gray-600">
                Memoriaは、写真・投稿・旅行の記録をグループ単位でまとめて保存できます。
                まずは参加するグループを選ぶか、新しいグループを作成してください。
              </p>
            </div>
            <div className="card border border-purple-200 bg-white">
              <div className="text-sm font-semibold text-gray-800 mb-3">新しいグループを作る</div>
              <form onSubmit={handleCreateGroup} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="例: 旅の記録"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {creating ? '作成中...' : 'グループを作成'}
                </button>
              </form>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">参加中のグループ</h2>
          {groups.length === 0 ? (
            <div className="card text-gray-600 border border-dashed border-gray-300">
              まだグループがありません。上のフォームから作成してください。
            </div>
          ) : (
            <div className="grid-card">
              {groups.map((group) => (
                <div key={group.id} className="card border border-gray-200 hover:border-primary-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-lg font-semibold text-gray-800">{group.name}
                      <p className="text-xs text-gray-500 mt-1">
                        作成日: {new Date(group.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleOpenGroup(group)}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      グループへ移動
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
