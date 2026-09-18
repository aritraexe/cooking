import { Link } from 'react-router-dom'
import type { ToolMeta } from '@/types'

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-medium text-ink">{tool.name}</h3>
        {tool.status === 'soon' && (
          <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-xs text-ink-muted">
            Soon
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{tool.description}</p>
    </>
  )

  if (tool.status === 'active') {
    return (
      <Link
        to={`/tools/${tool.path}`}
        className="group block rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/50 hover:bg-surface-hover"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="block cursor-default rounded-xl border border-line/60 p-5 opacity-60">
      {content}
    </div>
  )
}
