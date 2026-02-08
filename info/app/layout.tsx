import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Memoria - インフォメーション',
  description: 'Memoriaのインフォメーションページです。',
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
      <body>{children}</body>
    </html>
  )
}
