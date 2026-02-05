'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { buildLoginUrl, getCurrentPathWithQuery } from '@/lib/backPath'
import GroupSwitchButton from '@/components/GroupSwitchButton'
import AppHeader from '@/components/AppHeader'
import AdminCard from '@/components/AdminCard'

interface User {
  id: number
  email: string
  display_name: string
  role: string
}

const adminSections = [
  {
    title: '収益管理',
    items: [
      {
        title: '支払者情報',
        href: '/admin/payers',
        actionLabel: '支払者情報を確認',
      },
      {
        title: '売上レポート',
        href: '/admin/sales-report',
        actionLabel: '売上レポートを表示',
      },
      {
        title: '広告インプレッション',
        href: '/admin/ads-impressions',
        actionLabel: '広告インプレッションを表示',
      },
    ],
  },
  {
    title: '利用状況',
    items: [
      {
        title: '利用レポート',
        href: '/admin/usage-report',
        actionLabel: '利用レポートを表示',
      },
    ],
  },
  {
    title: 'サポート',
    items: [
      {
        title: 'お問い合わせ',
        href: '/admin/inquiries',
        actionLabel: 'お問い合わせを表示',
      },
    ],
  },
  {
    title: 'システム設定',
    items: [
      {
        title: 'システム設定',
        href: '/admin/system-settings',
        actionLabel: '設定を管理',
      },
    ],
  },
]

const adminTools = [
  {
    title: 'ユーザー管理',
    href: '/admin/users',
    actionLabel: 'ユーザーを管理',
  },
]

export default function AdminTopPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

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
        right={
          <>
            <GroupSwitchButton label="グループ一覧へ" />
          </>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800">管理者が行える操作一覧</h2>
          <p className="text-gray-600 mt-1">日次の管理業務へすぐ移動できます。</p>
        </section>

        <section className="grid-card">
          <div className="card border border-gray-200">
            <div className="text-sm text-gray-500">今月の売上</div>
            <div className="text-2xl font-semibold text-gray-800 mt-2">--</div>
          </div>
          <div className="card border border-gray-200">
            <div className="text-sm text-gray-500">未対応お問い合わせ</div>
            <div className="text-2xl font-semibold text-gray-800 mt-2">--</div>
          </div>
          <div className="card border border-gray-200">
            <div className="text-sm text-gray-500">アクティブユーザー</div>
            <div className="text-2xl font-semibold text-gray-800 mt-2">--</div>
          </div>
        </section>

        {adminSections.map((section) => (
          <section key={section.title}>
            <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
            <div className="grid-card mt-4">
              {section.items.map((item) => (
                <AdminCard
                  key={item.title}
                  title={item.title}
                  actionLabel={item.actionLabel}
                  onClick={() => router.push(item.href)}
                />
              ))}
            </div>
          </section>
        ))}

        <section>
          <h3 className="text-lg font-semibold text-gray-800">管理ツール</h3>
          <div className="grid-card mt-4">
            {adminTools.map((tool) => (
              <AdminCard
                key={tool.title}
                title={tool.title}
                actionLabel={tool.actionLabel}
                onClick={() => router.push(tool.href)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
