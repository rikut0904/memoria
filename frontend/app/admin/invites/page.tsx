'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { auth } from '@/lib/firebase'
import { getErrorMessage } from '@/lib/getErrorMessage'

interface Invite {
  id: number
  email: string
  token: string
  status: string
  role: string
  expires_at: string
  invited_by: number
  created_at: string
}

export default function InvitesManagementPage() {
  const router = useRouter()
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [newInviteEmail, setNewInviteEmail] = useState('')
  const [newInviteRole, setNewInviteRole] = useState('user')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login')
        return
      }

      try {
        // 現在のユーザー情報を取得
        const meRes = await api.get('/me')

        // 管理者権限チェック
        if (meRes.data.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        // 全招待取得
        await fetchInvites()
      } catch (error) {
        console.error('Failed to fetch data:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchInvites = async () => {
    try {
      const invitesRes = await api.get('/invites')
      setInvites(invitesRes.data || [])
    } catch (error) {
      console.error('Failed to fetch invites:', error)
    }
  }

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newInviteEmail || !newInviteEmail.includes('@')) {
      alert('有効なメールアドレスを入力してください')
      return
    }

    setCreating(true)
    try {
      await api.post('/invites', { email: newInviteEmail, role: newInviteRole })
      setNewInviteEmail('')
      setNewInviteRole('user')
      await fetchInvites()
      alert('招待を作成しました')
    } catch (error) {
      console.error('Failed to create invite:', error)
      alert(getErrorMessage(error, '招待の作成に失敗しました'))
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteInvite = async (inviteId: number, email: string) => {
    if (!confirm(`「${email}」への招待を削除しますか？`)) {
      return
    }

    try {
      await api.delete(`/invites/${inviteId}`)
      setInvites(invites.filter(i => i.id !== inviteId))
      alert('招待を削除しました')
    } catch (error) {
      console.error('Failed to delete invite:', error)
      alert('招待の削除に失敗しました')
    }
  }

  const copyInviteLink = (token: string) => {
    const baseUrl = window.location.origin
    const inviteUrl = `${baseUrl}/invites/${token}`
    navigator.clipboard.writeText(inviteUrl)
    alert('招待リンクをコピーしました')
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '未使用', color: 'bg-blue-100 text-blue-800' }
      case 'accepted':
        return { text: '使用済み', color: 'bg-green-100 text-green-800' }
      case 'expired':
        return { text: '期限切れ', color: 'bg-gray-100 text-gray-800' }
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' }
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
            <h1 className="text-2xl font-bold text-primary-600">Memoria - 管理</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => router.push('/admin/users')}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 py-4 px-1 text-sm font-medium"
              >
                ユーザー管理
              </button>
              <button
                onClick={() => router.push('/admin/invites')}
                className="border-b-2 border-primary-500 py-4 px-1 text-sm font-medium text-primary-600"
              >
                招待管理
              </button>
            </nav>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">招待管理</h2>
          <p className="text-gray-600 mt-1">新規ユーザーの招待と管理</p>
        </div>

        {/* 招待作成フォーム */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">新規招待を作成</h3>
          <form onSubmit={handleCreateInvite} className="flex flex-wrap gap-4">
            <input
              type="email"
              value={newInviteEmail}
              onChange={(e) => setNewInviteEmail(e.target.value)}
              placeholder="招待するメールアドレス"
              className="flex-1 min-w-[240px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <select
              value={newInviteRole}
              onChange={(e) => setNewInviteRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="user">一般ユーザー</option>
              <option value="admin">管理者</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {creating ? '作成中...' : '招待を作成'}
            </button>
          </form>
        </div>

        {/* 招待一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  権限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  有効期限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invites.map((invite) => {
                const status = getStatusLabel(invite.status)
                return (
                  <tr key={invite.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invite.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.role === 'admin' ? '管理者' : '一般ユーザー'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invite.expires_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invite.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {invite.status === 'pending' && (
                        <button
                          onClick={() => copyInviteLink(invite.token)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          リンクをコピー
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteInvite(invite.id, invite.email)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {invites.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              招待が登録されていません
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
