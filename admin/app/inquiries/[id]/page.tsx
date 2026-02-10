'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { buildLoginUrl, getCurrentPathWithQuery } from '@/lib/backPath'
import AppHeader from '@/components/AppHeader'
import GroupSwitchButton from '@/components/GroupSwitchButton'

interface User {
  id: number
  email: string
  display_name: string
  role: string
}

type InquiryStatus = 'pending' | 'in_progress' | 'resolved'

interface InquiryReply {
  id: number
  message: string
  sender_type: string
  sender_name: string
  created_at: string
}

interface InquiryDetail {
  id: number
  subject: string
  message: string
  category: string
  status: InquiryStatus
  contact_name: string
  contact_email: string
  user_id: string
  user_name: string
  user_email: string
  thread_id: string
  created_at: string
  replies: InquiryReply[]
}

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ja-JP')
}

const statusLabel = (status?: InquiryStatus) => {
  switch (status) {
    case 'pending':
      return '対応前'
    case 'in_progress':
      return '対応中'
    case 'resolved':
      return '対応済み'
    default:
      return '-'
  }
}

const statusBadgeClass = (status?: InquiryStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'resolved':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function AdminInquiryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const inquiryId = useMemo(() => {
    const value = params?.id
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [detail, setDetail] = useState<InquiryDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyError, setReplyError] = useState<string | null>(null)
  const [replyLoading, setReplyLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const meRes = await api.get('/me')
        setCurrentUser(meRes.data)

        if (meRes.data.role !== 'admin') {
          router.push('/')
          return
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        router.push(buildLoginUrl(getCurrentPathWithQuery()))
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [router])

  const fetchDetail = async () => {
    if (!inquiryId) return
    try {
      setError(null)
      const res = await api.get(`/admin/inquiries/${inquiryId}`)
      setDetail(res.data)
    } catch (err) {
      console.error('failed to fetch inquiry detail', err)
      setError('お問い合わせ詳細の取得に失敗しました')
    }
  }

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return
    fetchDetail()
  }, [currentUser, inquiryId])

  const handleStatusUpdate = async (status: InquiryStatus) => {
    if (!detail) return
    try {
      setStatusLoading(true)
      await api.patch(`/admin/inquiries/${detail.id}`, { status })
      await fetchDetail()
    } catch (err) {
      console.error('failed to update status', err)
      setError('対応状況の更新に失敗しました')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleReply = async () => {
    if (!detail) return
    setReplyError(null)
    if (!replyMessage.trim()) {
      setReplyError('返信内容を入力してください')
      return
    }
    try {
      setReplyLoading(true)
      await api.post(`/admin/inquiries/${detail.id}/replies`, { message: replyMessage.trim() })
      setReplyMessage('')
      await fetchDetail()
    } catch (err) {
      console.error('failed to send reply', err)
      setReplyError('返信の送信に失敗しました')
    } finally {
      setReplyLoading(false)
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
    <div className="min-h-screen admin">
      <AppHeader
        title="Memoria - 管理"
        displayName={currentUser?.display_name}
        email={currentUser?.email}
        right={<GroupSwitchButton label="グループ一覧へ" />}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/inquiries')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            お問い合わせ一覧へ戻る
          </button>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            管理トップ
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800">お問い合わせ詳細</h2>
          <p className="text-gray-600 mt-1">お問い合わせ内容の確認と返信ができます</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && !detail && <p className="text-sm text-gray-500">読み込み中...</p>}

        {detail && (
          <>
            {/* 基本情報 */}
            <div className="card space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(detail.status)}`}>
                  {statusLabel(detail.status)}
                </span>
                <span>受付日時: {formatDateTime(detail.created_at)}</span>
                {detail.thread_id && <span>スレッドID: {detail.thread_id}</span>}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{detail.subject || '-'}</h3>
              <p className="text-sm text-gray-500">カテゴリ: {detail.category || '-'}</p>
            </div>

            {/* お問い合わせ内容 */}
            <div className="card">
              <p className="text-xs text-gray-500 mb-2">お問い合わせ内容</p>
              <p className="whitespace-pre-wrap text-sm text-gray-900">{detail.message || '-'}</p>
            </div>

            {/* 連絡先 */}
            <div className="card">
              <p className="text-xs text-gray-500 mb-2">連絡先</p>
              <p className="text-sm text-gray-900">{detail.contact_name || '-'}</p>
              <p className="text-xs text-gray-500">{detail.contact_email || '-'}</p>
            </div>

            {/* 対応状況の更新 */}
            <div className="card space-y-2">
              <span className="block text-sm font-medium text-gray-700">対応状況を更新</span>
              <div className="flex flex-wrap gap-2">
                {(['pending', 'in_progress', 'resolved'] as InquiryStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusUpdate(status)}
                    disabled={statusLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      detail.status === status
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {statusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* 返信 */}
            <div className="card space-y-3">
              <span className="block text-sm font-medium text-gray-700">返信内容</span>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical min-h-[140px]"
                placeholder="回答内容を記載してください"
              />
              {replyError && <p className="text-sm text-red-600">{replyError}</p>}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={replyLoading}
                  className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {replyLoading ? '送信中...' : '返信を送信する'}
                </button>
              </div>
            </div>

            {/* 返信履歴 */}
            {detail.replies && detail.replies.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">返信履歴</p>
                {detail.replies.map((reply) => (
                  <div key={reply.id} className="card">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{reply.sender_type === 'admin' ? '運営' : reply.sender_name || 'お問い合わせ者'}</span>
                      <span>{formatDateTime(reply.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-900">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
