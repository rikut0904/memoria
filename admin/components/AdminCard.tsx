type AdminCardProps = {
  title: string
  actionLabel: string
  onClick: () => void
}

export default function AdminCard({ title, actionLabel, onClick }: AdminCardProps) {
  return (
    <button
      onClick={onClick}
      className="card border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-shadow text-left h-28"
    >
      <div className="text-lg font-semibold text-gray-800">{title}</div>
      <div className="flex justify-end text-sm text-primary-600 mt-4">{actionLabel}</div>
    </button>
  )
}
