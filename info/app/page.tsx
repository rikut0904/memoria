'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import InfoHeader from '@/components/InfoHeader'
import InfoFooter from '@/components/InfoFooter'
import InfoCTA from '@/components/InfoCTA'

const features = [
  {
    emoji: '\u{1F465}',
    title: 'グループ管理',
    description: '家族や友人とグループを作成し、思い出をまとめて管理できます。',
  },
  {
    emoji: '\u{1F4DD}',
    title: '投稿機能',
    description: 'ブログやメモとして、日々の思い出を記録・共有できます。',
  },
  {
    emoji: '\u{1F5BC}\uFE0F',
    title: 'アルバム・写真管理',
    description: '大切な写真をアルバムで整理し、安全に保存できます。',
  },
  {
    emoji: '\u{1F3F7}\uFE0F',
    title: 'タグ検索',
    description: 'タグを使用して、思い出を簡単に検索・整理できます。',
  },
  {
    emoji: '\u{2764}\uFE0F',
    title: 'いいね・コメント',
    description: 'グループメンバーと思い出を共有し、コミュニケーションできます。',
  },
  {
    emoji: '\u{2708}\uFE0F',
    title: '旅行計画',
    description: '旅行のスケジュール、交通、宿泊、予算を一元管理できます。',
  },
]

export default function InfoPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="landing min-h-screen bg-white dark:bg-[#121212]">
      <InfoHeader />

      {/* ヒーロー セクション */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* テキスト部分 */}
            <div
              className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
                思い出を、<br />
                <span className="text-primary-700 dark:text-primary-400">
                  ひとつの場所に
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                大切な思い出を安全にプライベートに保存・共有できるWebアプリケーション。
                家族や友人とグループを作成し、写真、投稿、旅行計画を一元管理できます。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors">
                  今すぐ始める
                </button>
                <Link
                  href="/features-detail"
                  className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-primary-600 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors text-center"
                >
                  詳細を見る
                </Link>
              </div>
            </div>

            {/* ヒーロー画像 */}
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
            >
              <img
                src="/img/hero.png"
                alt="Memoriaアプリのイメージ"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section className="py-20 lg:py-32 bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              充実した機能
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              思い出を管理・共有するために必要な全ての機能を備えています
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 ${isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 inline-block p-3 bg-primary-100 dark:bg-primary-900 rounded-lg text-2xl">
                  {feature.emoji}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 旅行計画特化セクション */}
      <section className="py-20 lg:py-32 bg-white dark:bg-[#121212]">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              旅行の思い出を、もっと特別に
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              旅行計画から旅中の思い出記録、帰宅後の整理まで。
              すべてを一つのプラットフォームで管理できます。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: '\u{1F5FA}\uFE0F',
                title: '旅行計画',
                description: '目的地、日程、予算、宿泊地をまとめて管理。家族や友人と計画を共有できます。',
                items: ['日程管理', '予算追跡', '宿泊地情報'],
              },
              {
                emoji: '\u{1F4F8}',
                title: '旅中の記録',
                description: '旅行中に撮った写真や動画、思い出をリアルタイムで投稿・共有。',
                items: ['写真・動画投稿', 'リアルタイム共有', '位置情報タグ'],
              },
              {
                emoji: '\u{1F381}',
                title: '思い出の整理',
                description: '旅行の思い出をアルバム化し、後から見返して楽しめます。',
                items: ['アルバム作成', 'コメント共有', 'いいね機能'],
              },
            ].map((card, index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4 text-4xl">{card.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{card.description}</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-primary-600 dark:text-primary-400 font-bold">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InfoCTA />
      <InfoFooter />
    </div>
  )
}
