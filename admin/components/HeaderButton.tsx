'use client'

type HeaderButtonProps = {
  label: string
  onClick: () => void
  className?: string
}

export default function HeaderButton({ label, onClick, className = '' }: HeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm border border-purple-200 text-purple-700 rounded-lg bg-white/80 hover:bg-purple-50 ${className}`}
    >
      {label}
    </button>
  )
}
