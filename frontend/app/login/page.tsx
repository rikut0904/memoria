'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { normalizeBackPath } from '@/lib/backPath'
import { getAuthToken, setAuthToken, setRefreshToken } from '@/lib/auth'
import VerticalAd from '@/components/VerticalAd'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const backPath = normalizeBackPath(searchParams.get('back-path')) || '/'

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return
    api
      .get('/me')
      .then(() => {
        router.replace(backPath)
      })
      .catch(() => {})
  }, [backPath, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    try {
      const res = await api.post('/login', { email, password, back_path: backPath })
      if (res?.data?.token) {
        setAuthToken(res.data.token)
      }
      if (res?.data?.refresh_token) {
        setRefreshToken(res.data.refresh_token)
      }
      router.push(backPath)
    } catch (err) {
      const code = axios.isAxiosError(err) ? err.response?.data?.code : ''
      const message = getErrorMessage(err, 'ログインに失敗しました。メールアドレスとパスワードを確認してください。')
      if (code === 'EMAIL_NOT_VERIFIED') {
        setInfo(message)
      } else {
        setError(message)
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-ads-layout">
      <div className="auth-ads-side">
        <VerticalAd />
      </div>
      <div className="card w-full max-w-md auth-ads-main">
        <div className="text-3xl font-bold text-center text-primary-600 mb-6">
          Memoria
        </div>
        <p className="text-center text-gray-600 mb-8">
          大切な思い出を安全にプライベートに保存・共有できるWebアプリケーションです。
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでないですか？{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              サインアップ
            </button>
          </p>
        </div>
      </div>
      <div className="auth-ads-side">
        <VerticalAd />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
