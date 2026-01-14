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
      <circle cx="14" cy="14" r="5" fill="currentColor" />
      <circle cx="34" cy="14" r="5" fill="currentColor" />
      <circle cx="14" cy="34" r="5" fill="currentColor" />
      <circle
        cx="34"
        cy="34"
        r="6.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  )
}
