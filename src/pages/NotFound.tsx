import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-32 text-center">
      <p className="font-mono text-sm text-ink-muted">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink-muted">
        That tool doesn't exist yet, or the link is off.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
      >
        Back to all tools
      </Link>
    </div>
  )
}
