import { ArrowDown, ArrowUp, ChevronRight, GripVertical, Plus, Search, Settings2, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FILE_CATEGORIES, getOperationsFor, getQuickOperationsFor, operations } from '@/data/operations'
import type { FileCategory, OperationMeta } from '@/types'

interface WorkflowBuilderProps {
  family: FileCategory | null
  hasFiles: boolean
  onFamilyChange: (family: FileCategory) => void
  onOpenOperation: (operation: OperationMeta) => void
}

function OperationButton({ operation, onClick }: { operation: OperationMeta; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-line/70 bg-page/45 px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-hover"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">{operation.name}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-muted">{operation.description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
    </button>
  )
}

export function WorkflowBuilder({ family, hasFiles, onFamilyChange, onOpenOperation }: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<OperationMeta[]>([])
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [recentOperations, setRecentOperations] = useState<OperationMeta[]>([])
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const availableOperations = getOperationsFor(family)
  const quickOperations = getQuickOperationsFor(family).slice(0, 4)
  const normalizedSearch = search.trim().toLowerCase()
  const searchResults = useMemo(
    () => operations.filter((operation) => {
      if (family && operation.family !== family) return false
      if (!normalizedSearch) return true
      return `${operation.name} ${operation.description} ${operation.category}`.toLowerCase().includes(normalizedSearch)
    }),
    [family, normalizedSearch],
  )
  const visibleOperations = normalizedSearch
    ? searchResults
    : category
      ? availableOperations.filter((operation) => operation.category === category)
      : availableOperations
  const categories = [...new Set(availableOperations.map((operation) => operation.category))]
  const suggestions = family === 'pdf' ? ['OCR scanned PDF', 'Compress PDF', 'Clean scan'] : family === 'image' ? ['Resize image', 'Compress image', 'Convert format'] : []

  function addOperation(operation: OperationMeta) {
    setWorkflow((current) => [...current, operation])
    setRecentOperations((current) => [operation, ...current.filter((item) => item.id !== operation.id)].slice(0, 3))
    setSelectorOpen(false)
    setSearch('')
    setCategory(null)
  }

  function moveOperation(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= workflow.length) return
    setWorkflow((current) => {
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function dropOperation(targetIndex: number) {
    if (draggingIndex === null || draggingIndex === targetIndex) return
    setWorkflow((current) => {
      const next = [...current]
      const [moved] = next.splice(draggingIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setDraggingIndex(null)
  }

  return (
    <div className="mt-12 text-left">
      {family && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Quick actions</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-ink">Start with a common task</h2>
          </div>
          <span className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted">{hasFiles ? 'Ready for your files' : 'Choose a file to begin'}</span>
        </div>
      )}

      {family && (
        <div className="grid gap-2 sm:grid-cols-2">
          {quickOperations.map((operation) => (
            <OperationButton key={operation.id} operation={operation} onClick={() => onOpenOperation(operation)} />
          ))}
          <button
            type="button"
            onClick={() => setSelectorOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-accent/30 px-3.5 py-3 text-sm font-medium text-accent transition-colors hover:border-accent/60 hover:bg-accent/5 sm:col-span-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            More modifications
          </button>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Workflow</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-ink">Build your process</h2>
          </div>
          <span className="text-xs text-ink-muted">{workflow.length} {workflow.length === 1 ? 'step' : 'steps'}</span>
        </div>

        {workflow.length > 0 && (
          <div className="mt-4 space-y-2">
            {workflow.map((operation, index) => (
              <div key={`${operation.id}-${index}`} draggable onDragStart={() => setDraggingIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropOperation(index)} className="ff-card flex items-center gap-3 rounded-xl border p-3">
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-muted/60 active:cursor-grabbing" aria-label="Drag to reorder" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{operation.name}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{operation.category} · Ready to configure</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" title="Move up" aria-label={`Move ${operation.name} up`} onClick={() => moveOperation(index, -1)} disabled={index === 0} className="rounded-md p-1.5 text-ink-muted hover:bg-page hover:text-ink disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button type="button" title="Move down" aria-label={`Move ${operation.name} down`} onClick={() => moveOperation(index, 1)} disabled={index === workflow.length - 1} className="rounded-md p-1.5 text-ink-muted hover:bg-page hover:text-ink disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                  <button type="button" title="Edit settings" onClick={() => onOpenOperation(operation)} className="rounded-md p-1.5 text-ink-muted hover:bg-page hover:text-accent"><Settings2 className="h-3.5 w-3.5" /></button>
                  <button type="button" title="Remove" aria-label={`Remove ${operation.name}`} onClick={() => setWorkflow((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-md p-1.5 text-ink-muted hover:bg-page hover:text-mark"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setSelectorOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm font-medium text-ink-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Modification
        </button>
      </div>

      {selectorOpen && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-page/65 p-4 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectorOpen(false) }}>
          <div className="ff-card max-h-[min(700px,calc(100vh-2rem))] w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="modification-title">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Modification library</p>
                <h2 id="modification-title" className="mt-1 font-display text-lg font-semibold text-ink">What would you like to change?</h2>
              </div>
              <button type="button" aria-label="Close modification library" onClick={() => setSelectorOpen(false)} className="rounded-lg p-2 text-ink-muted hover:bg-page hover:text-ink"><X className="h-4 w-4" /></button>
            </div>
            <div className="border-b border-line p-4">
              <label className="flex items-center gap-2 rounded-xl border border-line bg-page/55 px-3 py-2.5 focus-within:border-accent/50">
                <Search className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search modifications..." className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70" />
                {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="text-ink-muted hover:text-ink"><X className="h-4 w-4" /></button>}
              </label>
            </div>
            <div className="max-h-[calc(100vh-14rem)] overflow-y-auto p-4">
              {!search && !family && (
                <div>
                  <p className="mb-3 text-xs font-medium text-ink-muted">Choose a file type</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {FILE_CATEGORIES.map((item) => <button key={item.id} type="button" onClick={() => onFamilyChange(item.id)} className="rounded-xl border border-line p-3 text-left text-sm transition-colors hover:border-accent/40 hover:bg-surface-hover"><span className="block font-medium text-ink">{item.label}</span><span className="mt-1 block text-xs text-ink-muted">{item.description}</span></button>)}
                  </div>
                </div>
              )}
              {family && !search && (
                <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                  <button type="button" onClick={() => setCategory(null)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${category === null ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-ink-muted hover:text-ink'}`}>All</button>
                  {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${category === item ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-ink-muted hover:text-ink'}`}>{item}</button>)}
                </div>
              )}
              {!search && family && recentOperations.length > 0 && <div className="mb-5"><p className="mb-2 text-xs font-medium text-ink-muted">Recently used</p><div className="flex flex-wrap gap-2">{recentOperations.map((operation) => <button key={operation.id} type="button" onClick={() => addOperation(operation)} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted hover:border-accent/40 hover:text-accent">{operation.name}</button>)}</div></div>}
              {!search && family && !category && suggestions.length > 0 && <div className="mb-5"><p className="mb-2 text-xs font-medium text-ink-muted">Suggested for this file</p><div className="flex flex-wrap gap-2">{suggestions.map((name) => { const operation = operations.find((item) => item.name === name); return operation ? <button key={name} type="button" onClick={() => addOperation(operation)} className="rounded-full border border-accent/25 bg-accent/5 px-3 py-1.5 text-xs text-accent hover:border-accent/50">{name}</button> : null })}</div></div>}
              <p className="mb-2 text-xs font-medium text-ink-muted">{search ? `${visibleOperations.length} results` : category ?? 'All modifications'}</p>
              <div className="space-y-2">{visibleOperations.map((operation) => <OperationButton key={operation.id} operation={operation} onClick={() => addOperation(operation)} />)}</div>
              {visibleOperations.length === 0 && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">No modifications match that search.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
