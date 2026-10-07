"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearAuthToken, clearRefreshToken } from "@/lib/auth";
import { clearCurrentGroup, setCurrentGroup } from "@/lib/group";
import { signalLogout } from "@/lib/logoutSync";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";


type AppHeaderProps = {
  menuItems?: ReactNode;
  menuHeading?: ReactNode;
  groupOptions?: ReadonlyArray<{ id: number; name: string }>;
  maxWidthClassName?: string;
  displayName?: string;
  email?: string;
};

type UserTagProps = {
  userLabel: string;
  userInitial: string;
  email?: string;
  onLogout?: () => void;
};

function LogoutIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.09 15.59 11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59ZM19 3h-6v2h6v14h-6v2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UserTag({ userLabel, userInitial, email, onLogout }: UserTagProps) {
  return (
    <div
      className="flex min-w-0 items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-2 text-gray-700 shadow-sm"
      title={email && email !== userLabel ? `${userLabel}（${email}）` : userLabel}
      aria-label={`ログイン中: ${userLabel}`}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700"
      >
        {userInitial}
      </span>
      <span className="min-w-0 truncate text-sm font-semibold">{userLabel}</span>
      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="ログアウト"
          title="ログアウト"
        >
          <LogoutIcon />
        </button>
      )}
    </div>
  );
}

export default function AppHeader({
  menuItems: pageMenuItems,
  menuHeading = "思い出をひとつの場所に",
  groupOptions,
  maxWidthClassName = "max-w-7xl",
  displayName,
  email,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Esc") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);
  const normalizedDisplayName = displayName?.trim() || "";
  const emailName = email?.split("@")[0]?.trim() || "";
  const userLabel =
    normalizedDisplayName && normalizedDisplayName !== email
      ? normalizedDisplayName
      : emailName || normalizedDisplayName || "ユーザー";
  const userInitial = userLabel.slice(0, 1).toUpperCase();
  const menuItems = (
    <>
      {pageMenuItems}
    </>
  );

  const handleLogout = async () => {
    clearCurrentGroup();
    clearAuthToken();
    clearRefreshToken();
    signalLogout();
    try {
      await api.post("/logout");
    } finally {
      router.push(buildLoginUrl(getCurrentPathWithQuery()));
    }
  };

  const handleGroupSelect = (group: { id: number; name: string }) => {
    setCurrentGroup(group.id, group.name);
    setMenuOpen(false);
    router.push(`/${group.id}`);
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
              <div className="hidden sm:block">
                <UserTag userLabel={userLabel} userInitial={userInitial} email={email} />
              </div>
            )}
            <div className="hidden items-center gap-2 sm:flex sm:gap-3">
              {menuItems}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="ログアウト"
                title="ログアウト"
              >
                <LogoutIcon />
              </button>
            </div>
            <button
              type="button"
              className="relative z-[60] inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:hidden"
              aria-expanded={menuOpen}
              aria-controls="app-mobile-menu"
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
          className={`fixed inset-x-0 bottom-0 top-20 z-40 bg-black/30 transition-opacity duration-200 sm:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
        <div
          id="app-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="アプリメニュー"
          className={`fixed inset-y-0 right-0 z-50 h-full w-[min(20rem,85vw)] overflow-y-auto bg-white px-5 pb-6 pt-20 shadow-2xl transition-[opacity,transform] duration-200 ease-out sm:hidden ${menuOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"}`}
          onClick={() => setMenuOpen(false)}
        >
          <div className="flex min-h-full flex-col">
            {menuHeading && (
              <p className="mb-5 border-b border-gray-200 pb-4 text-base font-semibold text-primary-700">
                {menuHeading}
              </p>
            )}
            {groupOptions && (
              <section className="mb-5 border-b border-gray-200 pb-5">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">
                  グループを選択
                </h2>
                {groupOptions.length === 0 ? (
                  <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                    グループなし
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {groupOptions.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => handleGroupSelect(group)}
                        className="w-full rounded-lg border border-primary-200 bg-white px-4 py-2 text-left text-sm font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      >
                        {group.name}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
            <div className="flex flex-col items-stretch gap-2 [&>button]:w-full [&>button]:text-left">
              {menuItems}
            </div>
            {(displayName || email) && (
              <div className="mt-auto border-t border-gray-200 pt-5">
                <UserTag
                  userLabel={userLabel}
                  userInitial={userInitial}
                  email={email}
                  onLogout={handleLogout}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
