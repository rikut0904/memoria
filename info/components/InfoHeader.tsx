'use client'

import Link from 'next/link'

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
        </div>
      </div>
    </nav>
  )
}
