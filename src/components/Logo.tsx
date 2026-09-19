import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <img src="/favicon.png" alt="" width="22" height="22" className="shrink-0" />
      <span className="font-display text-lg font-semibold tracking-tight text-ink">FluxForge</span>
    </Link>
  )
}
