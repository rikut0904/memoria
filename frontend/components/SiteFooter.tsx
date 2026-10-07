import Image from "next/image";

const INFO_BASE_URL =
  process.env.NEXT_PUBLIC_INFO_BASE_URL || "http://localhost:23004";
const HELP_BASE_URL =
  process.env.NEXT_PUBLIC_HELP_BASE_URL || "http://localhost:23003";
const CONTACT_BASE_URL =
  process.env.NEXT_PUBLIC_CONTACT_BASE_URL || "http://localhost:23005";

const linkClass =
  "text-sm text-gray-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300";

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-gray-900 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <a
              href={INFO_BASE_URL}
              className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <Image
                src="/img/logo.png"
                alt="思い出memoria"
                width={150}
                height={48}
                className="h-12 w-auto"
              />
            </a>
            <p className="mt-4 text-sm text-gray-200">
              大切な思い出を、いつでも、どこでも。
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold text-white">サービス</h2>
            <nav aria-label="サービス情報">
              <ul className="space-y-3">
                <li>
                  <a href={INFO_BASE_URL} className={linkClass}>
                    サービス紹介
                  </a>
                </li>
                <li>
                  <a href={`${INFO_BASE_URL}/features`} className={linkClass}>
                    機能詳細
                  </a>
                </li>
                <li>
                  <a href={`${INFO_BASE_URL}/tech-stack`} className={linkClass}>
                    技術スタック
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold text-white">サポート</h2>
            <nav aria-label="サポート情報">
              <ul className="space-y-3">
                <li>
                  <a href={HELP_BASE_URL} className={linkClass}>
                    ヘルプ
                  </a>
                </li>
                <li>
                  <a href={CONTACT_BASE_URL} className={linkClass}>
                    お問い合わせ
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@omoide-memoria.com"
                    className={linkClass}
                  >
                    contact@omoide-memoria.com
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} 思い出memoria. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
