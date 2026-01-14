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
        cx="34"
        cy="34"
        r="6"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M8 40 L22 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M22 26 L26 22 L27 28 Z" fill="currentColor" />
    </svg>
  )
}
