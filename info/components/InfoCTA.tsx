'use client'

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'

export default function InfoCTA() {
  return (
    <section className="py-20 lg:py-32 bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="container text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          今すぐ始めよう
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          大切な思い出を安全に保存し、家族や友人と共有しましょう。
          思い出memoriaがあなたの思い出を特別なものにします。
        </p>
        <a
          href={APP_BASE_URL}
          className="inline-block px-8 py-3 bg-primary-600 text-white hover:bg-primary-700 font-semibold rounded-lg transition-colors"
        >
          無料で始める
        </a>
      </div>
    </section>
  )
}
