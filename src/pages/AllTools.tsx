import { ArrowRight, Check, Clock3, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FILE_CATEGORIES, operations } from '@/data/operations'
import type { FileCategory, OperationMeta } from '@/types'

function OperationCard({ operation }: { operation: OperationMeta }) {
  const isAvailable = operation.status === 'AVAILABLE' && Boolean(operation.path)
  const isBackend = operation.status === 'COMING_SOON_BACKEND'
  const modeLabel = operation.processingMode === 'LOCAL_AI' ? 'Local AI' : operation.processingMode === 'LOCAL_HEAVY' ? 'Local engine' : 'Local'
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{operation.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{operation.description}</p>
        </div>
        {isAvailable ? <span className="flex shrink-0 items-center gap-1 rounded-full border border-accent/25 bg-accent/5 px-2 py-1 text-[11px] text-accent"><Check className="h-3 w-3" aria-hidden="true" /> {modeLabel}</span> : <span className="flex shrink-0 items-center gap-1 rounded-full border border-line px-2 py-1 text-[11px] text-ink-muted"><Clock3 className="h-3 w-3" aria-hidden="true" /> {isBackend ? 'Backend required' : 'Local processor pending'}</span>}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3 text-xs">
        <span className={isAvailable ? 'text-accent' : 'text-ink-muted'}>{isAvailable ? 'Open local tool' : isBackend ? 'Requires backend infrastructure' : 'Local implementation pending'}</span>
        {isAvailable && <ArrowRight className="h-3.5 w-3.5 text-accent" aria-hidden="true" />}
      </div>
    </>
  )

  if (isAvailable) {
    return <Link to={`/tools/${operation.path}`} className="ff-card group rounded-xl border p-4 transition-all hover:-translate-y-1 hover:border-accent/40">{content}</Link>
  }

  return <div className="ff-card rounded-xl border p-4 opacity-75">{content}</div>
}

export function AllTools() {
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState<FileCategory | 'all'>('all')
  const [scope, setScope] = useState<'all' | 'available' | 'local-pending' | 'backend' | 'quick' | 'popular'>('all')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredOperations = useMemo(() => operations.filter((operation) => {
    if (family !== 'all' && operation.family !== family) return false
    if (scope === 'available' && operation.status !== 'AVAILABLE') return false
    if (scope === 'local-pending' && operation.status !== 'LOCAL_NOT_IMPLEMENTED') return false
    if (scope === 'backend' && operation.status !== 'COMING_SOON_BACKEND') return false
    if (scope === 'quick' && !operation.quick) return false
    if (scope === 'popular' && !operation.popular) return false
    if (!normalizedQuery) return true
    return `${operation.name} ${operation.description} ${operation.category}`.toLowerCase().includes(normalizedQuery)
  }), [family, normalizedQuery, scope])

  const grouped = FILE_CATEGORIES.map((category) => ({
    ...category,
    operations: filteredOperations.filter((operation) => operation.family === category.id),
  })).filter((category) => category.operations.length > 0)
  const availableCount = operations.filter((operation) => operation.status === 'AVAILABLE').length
  const localPendingCount = operations.filter((operation) => operation.status === 'LOCAL_NOT_IMPLEMENTED').length
  const backendCount = operations.filter((operation) => operation.status === 'COMING_SOON_BACKEND').length

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-12 sm:pt-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Modification library</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Every tool, in the right place.</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">Browse by file type and category, or search directly for the operation you need. Available tools run locally on your device; future tools stay visible as a roadmap.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">🔒 Your files stay on your device</p>
          <span className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted">{availableCount} available · {localPendingCount} local pending · {backendCount} backend · {operations.length} registered</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-surface/50 p-3 backdrop-blur sm:flex-row">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-page/60 px-3 py-2.5 focus-within:border-accent/50">
          <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modifications..." className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70" />
        </label>
        <div className="flex items-center gap-2 overflow-x-auto px-1 pb-1 sm:pb-0">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
          <button type="button" onClick={() => setFamily('all')} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium ${family === 'all' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-ink-muted hover:text-ink'}`}>All files</button>
          {FILE_CATEGORIES.map((category) => <button key={category.id} type="button" onClick={() => setFamily(category.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium ${family === category.id ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-ink-muted hover:text-ink'}`}>{category.label}</button>)}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {([['all', 'All operations'], ['available', 'Available locally'], ['local-pending', 'Local pending'], ['backend', 'Backend required'], ['quick', 'Quick actions'], ['popular', 'Popular']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setScope(value)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${scope === value ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-ink-muted hover:text-ink'}`}>{label}</button>)}
      </div>
      {scope === 'available' && <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2.5 text-xs text-accent"><span>Showing only the {availableCount} processors that are working right now.</span><button type="button" onClick={() => setScope('all')} className="shrink-0 font-semibold underline underline-offset-4">Show all {operations.length}</button></div>}

      <div className="mt-10 space-y-12">
        {grouped.map((category) => {
          const categoryGroups = [...new Set(category.operations.map((operation) => operation.category))]
          return (
            <section key={category.id}>
              <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{category.label}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{category.description}</p>
                </div>
                <span className="text-xs text-ink-muted">{category.operations.length} {category.operations.length === 1 ? 'operation' : 'operations'}</span>
              </div>
              <div className="mt-6 space-y-7">
                {categoryGroups.map((group) => <div key={group}><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">{group}</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{category.operations.filter((operation) => operation.category === group).map((operation) => <OperationCard key={operation.id} operation={operation} />)}</div></div>)}
              </div>
            </section>
          )
        })}
        {grouped.length === 0 && <div className="rounded-2xl border border-dashed border-line p-12 text-center"><p className="font-display text-lg font-semibold text-ink">No matching modifications</p><p className="mt-2 text-sm text-ink-muted">Try a different file type or search term.</p></div>}
      </div>
    </main>
  )
}
