"use client";

type HeaderButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export default function HeaderButton({
  label,
  onClick,
  className = "",
}: HeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${className}`}
    >
      {label}
    </button>
  );
}
