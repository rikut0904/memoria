'use client'

import { useEffect, useState } from 'react'
import InfoHeader from '@/components/InfoHeader'
import InfoFooter from '@/components/InfoFooter'
import InfoCTA from '@/components/InfoCTA'

const techStack = [
  {
    category: 'Frontend',
    description: 'ユーザーインターフェースとクライアント側のロジック',
    items: [
      { name: 'Next.js', description: 'React フレームワーク' },
      { name: 'TypeScript', description: '型安全な JavaScript' },
      { name: 'Tailwind CSS', description: 'ユーティリティベースの CSS' },
      { name: 'Firebase Auth', description: '認証管理' },
    ],
  },
  {
    category: 'Backend',
    description: 'サーバー側のロジックとデータベース',
    items: [
      { name: 'Go', description: 'バックエンド言語' },
      { name: 'Echo', description: 'Web フレームワーク' },
      { name: 'GORM', description: 'ORM ライブラリ' },
      { name: 'PostgreSQL', description: 'リレーショナルデータベース' },
      { name: 'S3', description: 'ファイルストレージ' },
    ],
  },
]

const architecture = [
  {
    layer: 'プレゼンテーション層',
    description: 'ユーザーが直接操作するUI',
    technologies: ['React', 'Tailwind CSS', 'TypeScript'],
  },
  {
    layer: 'ビジネスロジック層',
    description: 'アプリケーションの核となるロジック',
    technologies: ['Go', 'Echo', 'GORM'],
  },
  {
    layer: 'データ層',
    description: 'データの永続化と管理',
    technologies: ['PostgreSQL', 'S3'],
  },
]

export default function TechStackPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="landing min-h-screen bg-[var(--background)]">
      <InfoHeader />

      {/* ヘッダー セクション */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            技術スタック
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
            思い出memoriaは、モダンで信頼性の高い技術を組み合わせて構築されています。
            ユーザーデータの安全性とアプリケーションのパフォーマンスを最優先に設計されています。
          </p>
        </div>
      </section>

      {/* メイン技術スタック セクション */}
      <section className="py-20 lg:py-32 bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {techStack.map((stack, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="p-8 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-700 h-full">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {stack.category}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">{stack.description}</p>
                  <div className="space-y-4">
                    {stack.items.map((item, i) => (
                      <div
                        key={i}
                        className="p-4 bg-gray-50 dark:bg-[#121212] rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* アーキテクチャ セクション */}
      <section className="py-20 lg:py-32 bg-[var(--background)]">
        <div className="container">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
            アーキテクチャ
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            思い出memoriaは、3層アーキテクチャで設計されており、各層が明確に分離されています。
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {architecture.map((arch, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="p-8 bg-gray-50 dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-700 h-full hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-primary-600 dark:bg-primary-400 rounded-full" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{arch.layer}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{arch.description}</p>
                  <div className="space-y-2">
                    {arch.technologies.map((tech, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 技術的な特徴 セクション */}
      <section className="py-20 lg:py-32 bg-[var(--background)]">
        <div className="container">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-16 text-center">
            技術的な特徴
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 bg-gray-50 dark:bg-[#1e1e1e] rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                セキュリティ
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 dark:text-primary-400 font-bold mt-1">&#10003;</span>
                  <span>Firebase Authentication による安全な認証</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 dark:text-primary-400 font-bold mt-1">&#10003;</span>
                  <span>データベースの暗号化とアクセス制御</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 dark:text-primary-400 font-bold mt-1">&#10003;</span>
                  <span>HTTPS による通信の暗号化</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-gray-50 dark:bg-[#1e1e1e] rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                パフォーマンス
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 dark:text-primary-400 font-bold mt-1">&#10003;</span>
                  <span>Next.js による高速なページレンダリング</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 dark:text-primary-400 font-bold mt-1">&#10003;</span>
                  <span>CDN による静的アセット配信の最適化</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 dark:text-primary-400 font-bold mt-1">&#10003;</span>
                  <span>画像最適化と遅延読み込み</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <InfoCTA />
      <InfoFooter />
    </div>
  )
}
