'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '@/lib/firebase'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/getErrorMessage'

interface InviteInfo {
  email: string
  expires_at: string
  status: string
}

export default function InviteAcceptPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const verifyInvite = async () => {
      try {
        const res = await api.get(`/invites/${token}`)
        setInviteInfo(res.data)
        setDisplayName(res.data.email.split('@')[0]) // デフォルトの表示名
      } catch (err) {
        setError(getErrorMessage(err, '招待が無効または期限切れです'))
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      verifyInvite()
    }
  }, [token])

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    setAccepting(true)

    try {
      // 1. Firebase で認証アカウントを作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        inviteInfo!.email,
        password
      )

      // 2. バックエンドで招待を承認してDBユーザーを作成
      await api.post(`/invites/${token}/accept`, {
        firebase_uid: userCredential.user.uid,
        email: inviteInfo!.email,
        display_name: displayName,
      })

      alert('アカウントが作成されました！ログインしてください。')
      router.push('/login')
    } catch (err) {
      console.error('Failed to accept invite:', err)
      if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています。ログインしてください。')
      } else {
        setError(getErrorMessage(err, 'アカウント作成に失敗しました'))
      }
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">招待を確認中...</p>
      </div>
    )
  }

  if (error && !inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">招待が無効です</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              ログインページへ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Memoria</h1>
          <h2 className="text-xl font-semibold text-gray-800">招待を受け取りました</h2>
          <p className="text-gray-600 mt-2">
            {inviteInfo?.email} でアカウントを作成します
          </p>
        </div>

        <form onSubmit={handleAccept} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              表示名
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="あなたの名前"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（8文字以上）
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認）
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={accepting}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {accepting ? 'アカウント作成中...' : 'アカウントを作成'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            既にアカウントをお持ちですか？{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ログイン
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            招待の有効期限: {new Date(inviteInfo?.expires_at || '').toLocaleDateString('ja-JP')}
          </p>
        </div>
      </div>
    </div>
  )
}
