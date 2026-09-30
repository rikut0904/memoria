"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
const INFO_BASE_URL =
  process.env.NEXT_PUBLIC_INFO_BASE_URL || "http://localhost:3004";
const HELP_BASE_URL =
  process.env.NEXT_PUBLIC_HELP_BASE_URL || "http://localhost:3003";
const CONTACT_BASE_URL =
  process.env.NEXT_PUBLIC_CONTACT_BASE_URL || "http://localhost:3005";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm">
      <div className="container flex items-center justify-between py-4">
        <a href={INFO_BASE_URL} className="py-2 block h-16">
          <Image
            src="/img/logo.png"
            alt="思い出memoria"
            width={200}
            height={64}
            className="h-full w-auto"
          />
        </a>
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          <a
            href={INFO_BASE_URL}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            サービス紹介
          </a>
          <a
            href={`${INFO_BASE_URL}/features`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            機能詳細
          </a>
          <a
            href={HELP_BASE_URL}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            ヘルプ
          </a>
          <a
            href={CONTACT_BASE_URL}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            お問い合わせ
          </a>
          <a
            href={APP_BASE_URL}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            アプリを開く
          </a>
        </div>
        <button
          type="button"
          className="relative z-[60] inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="auth-mobile-menu"
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="sr-only">{menuOpen ? "メニューを閉じる" : "メニューを開く"}</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
          </svg>
        </button>
      </div>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 sm:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />
      <div
        id="auth-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="認証メニュー"
        className={`fixed inset-y-0 right-0 z-50 w-[min(20rem,85vw)] bg-white px-5 pt-20 shadow-2xl transition-transform duration-300 ease-out sm:hidden ${menuOpen ? "translate-x-0" : "pointer-events-none translate-x-full"}`}
      >
        <div className="container flex flex-col gap-2 py-3">
          <a
            href={INFO_BASE_URL}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700"
          >
            サービス紹介
          </a>
          <a
            href={`${INFO_BASE_URL}/features`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700"
          >
            機能詳細
          </a>
          <a
            href={HELP_BASE_URL}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700"
          >
            ヘルプ
          </a>
          <a
            href={CONTACT_BASE_URL}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700"
          >
            お問い合わせ
          </a>
          <a
            href={APP_BASE_URL}
            className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            アプリを開く
          </a>
        </div>
      </div>
    </nav>
  );
}
