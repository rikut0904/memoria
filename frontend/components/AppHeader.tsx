'use client'

import { ReactNode } from 'react'

type AppHeaderProps = {
  title: ReactNode
  right?: ReactNode
  maxWidthClassName?: string
  displayName?: string
  email?: string
}

export default function AppHeader({
  title,
  right,
  maxWidthClassName = 'max-w-7xl',
  displayName,
  email,
}: AppHeaderProps) {
  return (
    <header>
      <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          <div>
            <div className="text-2xl font-bold text-primary-600">{title}</div>
          </div>
          <div className="flex items-center gap-3">
            {(displayName || email) && (
              <span className="text-gray-700">{displayName || email}</span>
            )}
            {right}
          </div>
        </div>
      </div>
    </header>
  )
}
