type IconMarkProps = { className?: string }

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
      {/* threads */}
      <path
        className="icon-thread t1"
        d="M9 14 C15 14, 18 18, 22 21"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-thread t2"
        d="M9 24 C15 24, 18 24, 22 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-thread t3"
        d="M9 34 C15 34, 18 30, 22 27"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* hub */}
      <circle
        className="icon-hub"
        cx="30.5"
        cy="24"
        r="6.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle
        className="icon-core"
        cx="30.5"
        cy="24"
        r="3.75"
        fill="currentColor"
      />
    </svg>
  )
}