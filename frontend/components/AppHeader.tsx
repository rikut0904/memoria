"use client";

import { ReactNode, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearAuthToken, clearRefreshToken } from "@/lib/auth";
import { clearCurrentGroup, setCurrentGroup } from "@/lib/group";
import { signalLogout } from "@/lib/logoutSync";
import { buildLoginUrl, getCurrentPathWithQuery } from "@/lib/backPath";
import MobileDialog from "@/components/MobileDialog";

type AppHeaderProps = {
  menuItems?: ReactNode;
  menuHeading?: ReactNode;
  groupOptions?: ReadonlyArray<{ id: number; name: string }>;
  maxWidthClassName?: string;
  displayName?: string;
  email?: string;
  role?: string;
};

type UserTagProps = {
  userLabel: string;
  userInitial: string;
  email?: string;
  onClick: () => void;
  expanded: boolean;
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

function UserTag({ userLabel, userInitial, email, onClick, expanded }: UserTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="menu"
      aria-expanded={expanded}
      className="flex min-w-0 items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-2 text-left text-gray-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      title={
        email && email !== userLabel ? `${userLabel}（${email}）` : userLabel
      }
      aria-label={`ログイン中: ${userLabel}`}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700"
      >
        {userInitial}
      </span>
      <span className="min-w-0 truncate text-sm font-semibold">
        {userLabel}
      </span>
      <span aria-hidden="true" className="ml-1 text-xs text-gray-500">▾</span>
    </button>
  );
}

function UserMenu({ mobile, onClose, onLogout }: { mobile?: boolean; onClose: () => void; onLogout: () => void }) {
  return (
    <div className={mobile ? "mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" : "absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"} role="menu">
      <Link
        href="/settings"
        onClick={onClose}
        className="block px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 focus-visible:bg-primary-50 focus-visible:outline-none"
        role="menuitem"
      >
        アカウント設定
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-red-50 hover:text-red-700 focus-visible:bg-red-50 focus-visible:outline-none"
        role="menuitem"
      >
        <LogoutIcon />
        ログアウト
      </button>
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
  role,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const normalizedDisplayName = displayName?.trim() || "";
  const emailName = email?.split("@")[0]?.trim() || "";
  const userLabel =
    normalizedDisplayName && normalizedDisplayName !== email
      ? normalizedDisplayName
      : emailName || normalizedDisplayName || "ユーザー";
  const userInitial = userLabel.slice(0, 1).toUpperCase();
  const menuItems = <>{pageMenuItems}</>;
  const adminAction =
    role === "admin" && process.env.NEXT_PUBLIC_ADMIN_BASE_URL ? (
      <a
        href={process.env.NEXT_PUBLIC_ADMIN_BASE_URL}
        className="inline-flex items-center justify-center rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        管理画面
      </a>
    ) : null;
  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
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
    setUserMenuOpen(false);
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
              <div className="relative hidden xl:block">
                <UserTag
                  userLabel={userLabel}
                  userInitial={userInitial}
                  email={email}
                  expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((previous) => !previous)}
                />
                {userMenuOpen && <UserMenu onClose={() => setUserMenuOpen(false)} onLogout={handleLogout} />}
              </div>
            )}
            <div className="hidden items-center gap-2 xl:flex xl:gap-3">
              {adminAction}
              {menuItems}
            </div>
            <button
              type="button"
              ref={menuTriggerRef}
              className="relative z-[60] inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 xl:hidden"
              aria-expanded={menuOpen}
              aria-controls="app-mobile-menu"
              aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        <MobileDialog
          open={menuOpen}
          id="app-mobile-menu"
          label="アプリメニュー"
          triggerRef={menuTriggerRef}
          onClose={() => {
            setMenuOpen(false);
            setUserMenuOpen(false);
          }}
          className="fixed inset-y-0 right-0 z-50 h-full w-[min(20rem,85vw)] overflow-y-auto bg-white px-5 pb-6 pt-20 shadow-2xl xl:hidden"
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
              {adminAction}
              {menuItems}
            </div>
            {(displayName || email) && (
              <div className="relative mt-auto border-t border-gray-200 pt-5">
                <UserTag
                  userLabel={userLabel}
                  userInitial={userInitial}
                  email={email}
                  expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((previous) => !previous)}
                />
                {userMenuOpen && <UserMenu mobile onClose={() => setUserMenuOpen(false)} onLogout={handleLogout} />}
              </div>
            )}
          </div>
        </MobileDialog>
      </div>
    </header>
  );
}
