'use client'

import { useRouter } from 'next/navigation'
import { clearCurrentGroup } from '@/lib/group'
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
    const url = new URL('/', appBaseUrl)
    window.location.href = url.toString()
  }

  return <HeaderButton label={label} onClick={handleClick} className={className} />
}
