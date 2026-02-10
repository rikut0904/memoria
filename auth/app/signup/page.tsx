'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { getAuthToken } from '@/lib/auth'
import VerticalAd from '@/components/VerticalAd'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return
    api
      .get('/me')
      .then(() => {
        router.replace('/')
      })
      .catch(() => {})
  }, [router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)
    try {
      await api.post('/signup', { email, password, display_name: displayName })
      router.push('/')
    } catch (err) {
      console.error('Signup failed:', err)
      const code = axios.isAxiosError(err) ? err.response?.data?.code : ''
      const message = getErrorMessage(err, 'サインアップに失敗しました')
      if (code === 'EMAIL_NOT_VERIFIED') {
        setInfo(message)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 auth-ads-layout">
      <div className="auth-ads-side">
        <VerticalAd />
      </div>
      <div className="card w-full max-w-md auth-ads-main">
        <p className="text-center text-gray-600 mb-8">
          新しいアカウントを作成
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              表示名
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="あなたの名前"
              required
            />
          </div>

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
              パスワード（8文字以上）
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認）
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              minLength={8}
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
            {loading ? '作成中...' : 'サインアップ'}
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
      </div>
      <div className="auth-ads-side">
        <VerticalAd />
      </div>
      </div>
      <SiteFooter />
    </div>
  )
}
