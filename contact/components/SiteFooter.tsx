import Image from "next/image";

const INFO_BASE_URL =
  process.env.NEXT_PUBLIC_INFO_BASE_URL || "http://localhost:3004";
const HELP_BASE_URL =
  process.env.NEXT_PUBLIC_HELP_BASE_URL || "http://localhost:3003";
const CONTACT_BASE_URL =
  process.env.NEXT_PUBLIC_CONTACT_BASE_URL || "http://localhost:3005";

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <a href={INFO_BASE_URL}>
                <Image
                  src="/img/logo.png"
                  alt="Memoria"
                  width={150}
                  height={48}
                  className="h-12 w-auto"
                />
              </a>
            </div>
            <p className="text-gray-400 mb-4">
              大切な思い出を、いつでも、どこでも。
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">サービス</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href={`${INFO_BASE_URL}/features-detail`}
                  className="hover:text-white transition-colors"
                >
                  機能詳細
                </a>
              </li>
              <li>
                <a
                  href={`${INFO_BASE_URL}/tech-stack`}
                  className="hover:text-white transition-colors"
                >
                  技術スタック
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">サポート</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href={CONTACT_BASE_URL}
                  className="hover:text-white transition-colors"
                >
                  お問い合わせ
                </a>
              </li>
              <li>
                <a
                  href={HELP_BASE_URL}
                  className="hover:text-white transition-colors"
                >
                  ヘルプ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">連絡先</h4>
            <a
              href="mailto:contact@ml.omoide-memoria.com"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              {"\u{2709}\uFE0F"} contact@ml.omoide-memoria.com
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; 2026 memoria. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              利用規約
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              プライバシーポリシー
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
