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
      <circle cx="10" cy="24" r="5" fill="currentColor" />
      <circle cx="22" cy="24" r="5" fill="currentColor" />
      <circle cx="34" cy="24" r="5" fill="currentColor" />
      <circle
        cx="44"
        cy="24"
        r="5"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  )
}
