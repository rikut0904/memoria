'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getAuthToken, getRefreshToken } from '@/lib/auth'

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_BASE_URL || 'http://localhost:3001'
const INFO_BASE_URL = process.env.NEXT_PUBLIC_INFO_BASE_URL || 'http://localhost:3004'
const HELP_BASE_URL = process.env.NEXT_PUBLIC_HELP_BASE_URL || 'http://localhost:3003'
const CONTACT_BASE_URL = process.env.NEXT_PUBLIC_CONTACT_BASE_URL || 'http://localhost:3005'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    const refreshToken = getRefreshToken()
    if (!token && !refreshToken) {
      setIsAuthenticated(false)
      return
    }
    api
      .get('/me')
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
  }, [])

  const loginUrl = `${AUTH_BASE_URL}/login?return_to=${encodeURIComponent(`${APP_BASE_URL}/`)}`
  const startUrl = isAuthenticated ? `${APP_BASE_URL}/` : loginUrl

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div className="container flex items-center justify-between py-4">
        <a href={INFO_BASE_URL} className="py-2 block h-16">
          <img src="/img/logo.png" alt="Memoria" className="h-full" />
        </a>
        <div className="hidden sm:flex items-center gap-2 sm:gap-4">
          <a
            href={`${INFO_BASE_URL}/features-detail`}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400"
          >
            機能詳細
          </a>
          <a
            href={`${INFO_BASE_URL}/tech-stack`}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400"
          >
            技術スタック
          </a>
          <a
            href={CONTACT_BASE_URL}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400"
          >
            お問い合わせ
          </a>
          <a
            href={HELP_BASE_URL}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400"
          >
            ヘルプ
          </a>
          <a
            href={startUrl}
            className="text-sm px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 font-semibold rounded-lg transition-colors"
          >
            始める
          </a>
        </div>
        <button
          type="button"
          className="sm:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-primary-700 dark:text-gray-300 dark:hover:text-primary-400"
          aria-expanded={menuOpen}
          aria-controls="help-mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="sr-only">メニューを開く</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div
        id="help-mobile-menu"
        className={`sm:hidden border-t border-gray-100 dark:border-gray-800 ${menuOpen ? 'block' : 'hidden'}`}
      >
        <div className="container flex flex-col gap-2 py-3">
          <a
            href={`${INFO_BASE_URL}/features-detail`}
            className="text-sm px-3 py-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400"
          >
            機能詳細
          </a>
          <a
            href={`${INFO_BASE_URL}/tech-stack`}
            className="text-sm px-3 py-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400"
          >
            技術スタック
          </a>
          <a
            href={CONTACT_BASE_URL}
            className="text-sm px-3 py-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400"
          >
            お問い合わせ
          </a>
          <a
            href={HELP_BASE_URL}
            className="text-sm px-3 py-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400"
          >
            ヘルプ
          </a>
          <a
            href={startUrl}
            className="text-sm px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-semibold transition-colors"
          >
            始める
          </a>
        </div>
      </div>
    </nav>
  )
}
