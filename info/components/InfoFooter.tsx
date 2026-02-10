import Link from 'next/link'

export default function InfoFooter() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <Link href="/">
                <img src="/img/logo.png" alt="Memoria" className="h-12" />
              </Link>
            </div>
            <p className="text-gray-400 mb-4">
              大切な思い出を、いつでも、どこでも。
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">サービス</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/features-detail" className="hover:text-white transition-colors">
                  機能詳細
                </Link>
              </li>
              <li>
                <Link href="/tech-stack" className="hover:text-white transition-colors">
                  技術スタック
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">お問い合わせ</h4>
            <a
              href="mailto:contact@ml.omoide-memoria.com"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              {'\u{2709}\uFE0F'} contact@ml.omoide-memoria.com
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; 2026 memoria. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              利用規約
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              プライバシーポリシー
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
