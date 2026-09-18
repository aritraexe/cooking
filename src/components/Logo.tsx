import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <svg width="22" height="22" viewBox="0 0 32 32" className="shrink-0">
        <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" />
        <path
          d="M16 4v6M16 22v6M4 16h6M22 16h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-accent"
        />
        <circle cx="16" cy="16" r="2" fill="currentColor" className="text-mark" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-ink">FileKit</span>
    </Link>
  )
}
