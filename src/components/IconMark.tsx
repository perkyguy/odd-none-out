type IconMarkProps = {
  className?: string
}

export function IconMark({ className }: IconMarkProps) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="4.5" fill="currentColor" />
      <circle cx="30" cy="14" r="4.5" fill="currentColor" />
      <circle cx="14" cy="30" r="4.5" fill="currentColor" />
      <circle
        cx="30"
        cy="30"
        r="6"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M26 8 L38 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M38 20 L42 16 L43 24 Z" fill="currentColor" />
    </svg>
  )
}
