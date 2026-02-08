import { Suspense } from 'react'
import LoginRedirectClient from './redirect-client'

export default function LoginRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">リダイレクト中...</p>
        </div>
      }
    >
      <LoginRedirectClient />
    </Suspense>
  )
}
