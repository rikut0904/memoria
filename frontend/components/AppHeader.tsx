"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

type AppHeaderProps = {
  right?: ReactNode;
  maxWidthClassName?: string;
  displayName?: string;
  email?: string;
};

export default function AppHeader({
  right,
  maxWidthClassName = "max-w-7xl",
  displayName,
  email,
}: AppHeaderProps) {
  const normalizedDisplayName = displayName?.trim() || "";
  const emailName = email?.split("@")[0]?.trim() || "";
  const userLabel =
    normalizedDisplayName && normalizedDisplayName !== email
      ? normalizedDisplayName
      : emailName || normalizedDisplayName || "ユーザー";
  const userInitial = userLabel.slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="block h-16 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
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
                title={email && email !== userLabel ? `${userLabel}（${email}）` : userLabel}
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
            {right}
          </div>
        </div>
      </div>
    </header>
  );
}
