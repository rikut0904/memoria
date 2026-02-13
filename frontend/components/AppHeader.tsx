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
  return (
    <header>
      <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="py-2 block h-16">
            <Image
              src="/img/logo.png"
              alt="Memoria"
              width={200}
              height={64}
              className="h-full w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            {(displayName || email) && (
              <span className="text-gray-700">{displayName || email}</span>
            )}
            {right}
          </div>
        </div>
      </div>
    </header>
  );
}
