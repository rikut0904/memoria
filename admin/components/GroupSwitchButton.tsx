'use client'

import { useRouter } from 'next/navigation'
import { clearCurrentGroup } from '@/lib/group'
import { getAuthToken, getRefreshToken } from '@/lib/auth'
import HeaderButton from '@/components/HeaderButton'

type GroupSwitchButtonProps = {
  label?: string
  className?: string
}

export default function GroupSwitchButton({
  label = 'グループ一覧',
  className = '',
}: GroupSwitchButtonProps) {
  const router = useRouter()
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'

  const handleClick = () => {
    clearCurrentGroup()
    const token = getAuthToken()
    const refresh = getRefreshToken()
    const url = new URL('/', appBaseUrl)
    if (token) url.searchParams.set('auth_token', token)
    if (refresh) url.searchParams.set('refresh_token', refresh)
    window.location.href = url.toString()
  }

  return <HeaderButton label={label} onClick={handleClick} className={className} />
}
