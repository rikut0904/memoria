"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearAuthToken, clearRefreshToken } from "@/lib/auth";
import { signalLogout } from "@/lib/logoutSync";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";

type AppHeaderProps = {
  right?: ReactNode;
  maxWidthClassName?: string;
  displayName?: string;
  email?: string;
  showLogout?: boolean;
};

export default function AppHeader({
  right,
  maxWidthClassName = "max-w-7xl",
  displayName,
  email,
  showLogout = true,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);
  const router = useRouter();
  const normalizedDisplayName = displayName?.trim() || "";
  const emailName = email?.split("@")[0]?.trim() || "";
  const userLabel =
    normalizedDisplayName && normalizedDisplayName !== email
      ? normalizedDisplayName
      : emailName || normalizedDisplayName || "ユーザー";
  const userInitial = userLabel.slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    clearAuthToken();
    clearRefreshToken();
    signalLogout();
    try {
      await api.post("/logout");
    } finally {
      router.push(buildLoginUrl(getCurrentPathWithQuery()));
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 shadow-sm">
      <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link
            href="/"
            className="block h-16 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Image
              src="/img/logo.png"
              alt="思い出memoria"
              width={200}
              height={64}
              className="h-full w-auto"
            />
          </Link>
          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
            {(displayName || email) && (
              <div
                className="flex min-w-0 items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 text-gray-700 shadow-sm"
                title={
                  email && email !== userLabel
                    ? `${userLabel}（${email}）`
                    : userLabel
                }
                aria-label={`ログイン中: ${userLabel}`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700"
                >
                  {userInitial}
                </span>
                <span className="hidden max-w-40 truncate text-sm font-semibold sm:block">
                  {userLabel}
                </span>
              </div>
            )}
            <div className="hidden items-center gap-2 sm:flex sm:gap-3">
              {right}
              {showLogout && (
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                ログアウト
              </button>
              )}
            </div>
            <button
              type="button"
              className="relative z-[60] inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:hidden"
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-menu"
              aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
              </svg>
            </button>
          </div>
        </div>
        <div
          className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 sm:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
        <div
          id="admin-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="管理メニュー"
          className={`fixed inset-y-0 right-0 z-50 w-[min(20rem,85vw)] bg-white px-5 pb-6 pt-5 shadow-2xl transition-transform duration-300 ease-out sm:hidden ${menuOpen ? "translate-x-0" : "pointer-events-none translate-x-full"}`}
        >
          <div className="flex flex-col gap-2">
            {right}
            {showLogout && (
              <button
                onClick={handleLogout}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                ログアウト
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
