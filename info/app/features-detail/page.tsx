'use client'

import InfoHeader from '@/components/InfoHeader'
import InfoFooter from '@/components/InfoFooter'
import InfoCTA from '@/components/InfoCTA'

const featuresDetail = [
  {
    emoji: '\u{1F465}',
    title: 'グループ管理',
    description: '家族や友人とグループを作成し、一元管理',
    details: [
      '複数のグループを作成・管理できます',
      'グループメンバーの招待・管理が可能です',
      'グループごとに異なるプライバシー設定が可能です',
      'グループの権限設定で、メンバーの操作を制限できます',
    ],
    benefits: [
      '家族全体で思い出を共有できます',
      '友人グループごとに異なる思い出を管理できます',
      'プライベートな思い出は保護されます',
    ],
  },
  {
    emoji: '\u{1F4DD}',
    title: '投稿機能',
    description: '日々の思い出をテキストと共に記録',
    details: [
      'テキスト、画像、動画を含む投稿ができます',
      '投稿に日付やタグを付けて整理できます',
      'グループメンバーとの共有が可能です',
      '投稿の編集・削除はいつでも可能です',
    ],
    benefits: [
      '日々の出来事を記録して思い出を保存できます',
      '後から見返して懐かしさを感じられます',
      '家族や友人と思い出を共有できます',
    ],
  },
  {
    emoji: '\u{1F5BC}\uFE0F',
    title: 'アルバム・写真管理',
    description: '写真を整理して、思い出をアルバムに',
    details: [
      '複数のアルバムを作成して写真を整理できます',
      'アルバムごとにテーマを設定できます',
      '写真にキャプションを追加できます',
      'アルバムの共有範囲を設定できます',
    ],
    benefits: [
      '大量の写真を効率的に整理できます',
      'テーマごとに思い出を分類できます',
      '家族や友人と写真を共有できます',
    ],
  },
  {
    emoji: '\u{1F3F7}\uFE0F',
    title: 'タグ検索',
    description: 'タグを使って思い出を簡単に検索',
    details: [
      '投稿や写真にタグを付けられます',
      'タグで思い出を素早く検索できます',
      '複数のタグで絞り込み検索ができます',
      'よく使うタグを保存できます',
    ],
    benefits: [
      '膨大な思い出の中から目的のものを素早く見つけられます',
      '特定のテーマの思い出をまとめて確認できます',
      '思い出の整理が簡単になります',
    ],
  },
  {
    emoji: '\u{2764}\uFE0F',
    title: 'いいね・コメント',
    description: 'グループメンバーとコミュニケーション',
    details: [
      '投稿や写真にいいねができます',
      'コメント機能でメンバーと会話できます',
      '通知機能で新しいコメントを受け取れます',
      'コメント履歴を保存できます',
    ],
    benefits: [
      'グループメンバーとの絆が深まります',
      '思い出の共有がより楽しくなります',
      '家族や友人との繋がりを感じられます',
    ],
  },
  {
    emoji: '\u{2708}\uFE0F',
    title: '旅行計画',
    description: '旅行のスケジュール・予算を一元管理',
    details: [
      '旅行の日程を計画・共有できます',
      '予算管理機能で費用を追跡できます',
      '宿泊地や観光地、交通手段の情報を記録できます',
      '旅行中の思い出をリアルタイムで記録できます',
      '家族や友人と旅行計画を共有できます',
    ],
    benefits: [
      '旅行の計画がスムーズになります',
      '予算を効果的に管理できます',
      '旅行中の思い出をリアルタイムで共有できます',
      '旅行の思い出を後から見返せます',
    ],
  },
]

export default function FeaturesDetailPage() {
  return (
    <div className="landing min-h-screen bg-[var(--background)]">
      <InfoHeader />

      {/* メインコンテンツ */}
      <main className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              充実した機能
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              思い出memoriaが提供する全ての機能を詳しく紹介します
            </p>
          </div>

          {/* 機能詳細 */}
          <div className="space-y-12">
            {featuresDetail.map((feature, index) => (
              <div
                key={index}
                className="p-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center text-3xl">
                      {feature.emoji}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{feature.description}</p>

                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">機能の詳細</h4>
                      <ul className="space-y-2">
                        {feature.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <span className="text-primary-600 dark:text-primary-400 font-bold mt-1">&#10003;</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">このような方に最適です</h4>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <span className="text-yellow-500 font-bold mt-1">&#9733;</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <InfoCTA />
      <InfoFooter />
    </div>
  )
}
