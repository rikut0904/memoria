import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Memoria',
  description: '大切な思い出を安全にプライベートに保存・共有できるWebアプリケーションです。',
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
      <body>{children}</body>
    </html>
  )
}
