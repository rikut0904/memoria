"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { getAuthToken, getRefreshToken } from "@/lib/auth";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:23000";
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:23001";
const INFO_BASE_URL = process.env.NEXT_PUBLIC_INFO_BASE_URL || "http://localhost:23004";
const HELP_BASE_URL = process.env.NEXT_PUBLIC_HELP_BASE_URL || "http://localhost:23003";
const CONTACT_BASE_URL = process.env.NEXT_PUBLIC_CONTACT_BASE_URL || "http://localhost:23005";
const linkClass = "rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";
const mobileLinkClass = "rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700";

export default function InfoHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const token = getAuthToken();
    const refreshToken = getRefreshToken();
    if (!token && !refreshToken) { setIsAuthenticated(false); return; }
    api.get("/me").then(() => setIsAuthenticated(true)).catch(() => setIsAuthenticated(false));
  }, []);
  const loginUrl = `${AUTH_BASE_URL}/login?return_to=${encodeURIComponent(`${APP_BASE_URL}/`)}`;
  const startUrl = isAuthenticated ? `${APP_BASE_URL}/` : loginUrl;
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="container flex min-h-20 items-center justify-between gap-4">
        <a href={INFO_BASE_URL} className="block h-16 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><Image src="/img/logo.png" alt="思い出memoria" width={200} height={64} className="h-full w-auto" /></a>
        <div className="hidden items-center gap-2 sm:flex">
          <a href={INFO_BASE_URL} className={linkClass}>サービス紹介</a>
          <a href={`${INFO_BASE_URL}/features-detail`} className={linkClass}>機能詳細</a>
          <a href={HELP_BASE_URL} className={linkClass}>ヘルプ</a>
          <a href={CONTACT_BASE_URL} className={linkClass}>お問い合わせ</a>
          <a href={startUrl} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">アプリを開く</a>
        </div>
        <button type="button" className="rounded-lg p-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 sm:hidden" aria-expanded={menuOpen} aria-controls="info-mobile-menu" onClick={() => setMenuOpen((prev) => !prev)}><span className="sr-only">メニューを開く</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
      </div>
      <div id="info-mobile-menu" className={`border-t border-gray-200 ${menuOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="container flex flex-col gap-2 py-3">
          <a href={INFO_BASE_URL} className={mobileLinkClass}>サービス紹介</a>
          <a href={`${INFO_BASE_URL}/features-detail`} className={mobileLinkClass}>機能詳細</a>
          <a href={HELP_BASE_URL} className={mobileLinkClass}>ヘルプ</a>
          <a href={CONTACT_BASE_URL} className={mobileLinkClass}>お問い合わせ</a>
          <a href={startUrl} className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700">アプリを開く</a>
        </div>
      </div>
    </nav>
  );
}
