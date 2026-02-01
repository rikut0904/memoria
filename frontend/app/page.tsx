'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { clearCurrentGroup, setCurrentGroup } from '@/lib/group'
import { buildLoginUrl, getCurrentPathWithQuery } from '@/lib/backPath'

interface Group {
  id: number
  name: string
  created_by: number
  created_at: string
}

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [newGroupName, setNewGroupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        await api.get('/me')
        const res = await api.get('/groups')
        setGroups(res.data || [])
      } catch (err) {
        console.error('Failed to fetch groups:', err)
        router.push(buildLoginUrl(getCurrentPathWithQuery()))
      } finally {
        setLoading(false)
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
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to create group:', err)
      setError('グループの作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  const handleOpenGroup = (group: Group) => {
    setCurrentGroup(group.id, group.name)
    router.push('/dashboard')
  }

  const handleManageGroup = (group: Group) => {
    setCurrentGroup(group.id, group.name)
    router.push(`/groups/${group.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">
            Memoria
          </h1>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary-600">Memoria</h1>
            <button
              onClick={async () => {
                clearCurrentGroup()
                try {
                  await api.post('/logout')
                } finally {
                  router.push('/login')
                }
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              ログアウト
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">新規グループ作成</h2>
          <form onSubmit={handleCreateGroup} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="グループ名"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {creating ? '作成中...' : '作成する'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">参加中のグループ</h2>
          {groups.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">
              まだグループがありません。新規作成してください。
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {groups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow p-5">
                  <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    作成日: {new Date(group.created_at).toLocaleDateString('ja-JP')}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleOpenGroup(group)}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      開く
                    </button>
                    <button
                      onClick={() => handleManageGroup(group)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      管理
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
