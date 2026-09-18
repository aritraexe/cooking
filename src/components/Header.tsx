import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Logo />
        <Link
          to="/#all-tools"
          className="font-display text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          All tools
        </Link>
      </div>
    </header>
  )
}
