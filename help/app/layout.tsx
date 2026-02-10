import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import TokenBridge from './token-bridge'

export const metadata: Metadata = {
  title: 'Memoria - ヘルプ',
  description: 'Memoriaのヘルプページです。',
  icons: {
    icon: '/img/favicon.png',
  },
  openGraph: {
    title: 'Memoria - ヘルプ',
    description: 'Memoriaのヘルプページです。',
    images: ['/img/app.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Memoria - ヘルプ',
    description: 'Memoriaのヘルプページです。',
    images: ['/img/app.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=optional"
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <TokenBridge />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
