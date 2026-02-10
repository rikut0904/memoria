import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="card text-center py-16">
          <h1 className="text-3xl font-bold text-primary-600 mb-4 border-none">ヘルプページ</h1>
          <p className="text-gray-600 text-lg">準備中です。</p>
          <p className="text-gray-500 mt-2">このページは現在準備中です。もうしばらくお待ちください。</p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
