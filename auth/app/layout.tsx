import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import LogoutSync from './logout-sync'

export const metadata: Metadata = {
  title: 'Memoria - ログイン',
  description: '大切な思い出を安全にプライベートに保存・共有できるWebアプリケーションです。',
  icons: {
    icon: '/img/favicon.png',
  },
  openGraph: {
    title: 'Memoria - ログイン',
    description: '大切な思い出を安全にプライベートに保存・共有できるWebアプリケーションです。',
    images: ['/img/app.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Memoria - ログイン',
    description: '大切な思い出を安全にプライベートに保存・共有できるWebアプリケーションです。',
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
        <script defer src="https://cloud.umami.is/script.js" data-website-id="a9e84c25-b00e-4991-a1d8-38d5b314563b"></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WLKP58YCP3"></script>
        <script>
          {`
            dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-WLKP58YCP3');
          `}
        </script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6748867170638544" crossOrigin="anonymous"></script>
      </head>
      <body>
        <Suspense fallback={null}>
          <LogoutSync />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
