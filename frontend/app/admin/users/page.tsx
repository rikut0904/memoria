'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { auth } from '@/lib/firebase'
import { getErrorMessage } from '@/lib/getErrorMessage'

interface User {
  id: number
  email: string
  display_name: string
  role: string
  firebase_uid: string
  created_at: string
}

type UpdateUserRoleRequest = {
  role: string
}

export default function UsersManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login')
        return
      }

      try {
        // 現在のユーザー情報を取得
        const meRes = await api.get('/me')
        setCurrentUser(meRes.data)

        // 管理者権限チェック
        if (meRes.data.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        // 全ユーザー取得
        const usersRes = await api.get('/users')
        setUsers(usersRes.data || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!confirm(`このユーザーのロールを「${newRole}」に変更しますか？`)) {
      return
    }

    try {
      const payload: UpdateUserRoleRequest = { role: newRole }
      await api.patch(`/users/${userId}/role`, payload)
      // ユーザーリストを更新
      const usersRes = await api.get('/users')
      setUsers(usersRes.data || [])
      alert('ロールを更新しました')
    } catch (error) {
      console.error('Failed to update role:', error)
      alert('ロールの更新に失敗しました')
    }
  }

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`ユーザー「${email}」を削除しますか？この操作は取り消せません。`)) {
      return
    }

    try {
      await api.delete(`/users/${userId}`)
      // ユーザーリストを更新
      setUsers(users.filter(u => u.id !== userId))
      alert('ユーザーを削除しました')
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert(getErrorMessage(error, 'ユーザーの削除に失敗しました'))
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
                className="border-b-2 border-primary-500 py-4 px-1 text-sm font-medium text-primary-600"
              >
                ユーザー管理
              </button>
              <button
                onClick={() => router.push('/admin/invites')}
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 py-4 px-1 text-sm font-medium"
              >
                招待管理
              </button>
            </nav>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">ユーザー管理</h2>
          <p className="text-gray-600 mt-1">全ユーザーの一覧と管理</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  表示名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ロール
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.display_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'admin' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        管理者
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        一般
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {user.role === 'admin' ? (
                      <button
                        onClick={() => handleRoleChange(user.id, 'user')}
                        className="text-yellow-600 hover:text-yellow-900"
                        disabled={currentUser?.id === user.id}
                      >
                        一般に降格
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(user.id, 'admin')}
                        className="text-green-600 hover:text-green-900"
                      >
                        管理者に昇格
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="text-red-600 hover:text-red-900"
                      disabled={currentUser?.id === user.id}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
