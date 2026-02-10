'use client'

import Link from 'next/link'

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'

export default function InfoHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="py-2 block h-16">
          <img src="/img/logo.png" alt="Memoria" className="h-full" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/features-detail"
            className="text-sm px-3 py-1.5 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400"
          >
            機能詳細
          </Link>
          <Link
            href="/tech-stack"
            className="text-sm px-3 py-1.5 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400"
          >
            技術スタック
          </Link>
          <a
            href={APP_BASE_URL}
            className="text-sm px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 font-semibold rounded-lg transition-colors"
          >
            始める
          </a>
        </div>
      </div>
    </nav>
  )
}
