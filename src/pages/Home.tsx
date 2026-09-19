import { Layers3, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'
import { WorkflowBuilder } from '@/components/WorkflowBuilder'
import { FILE_CATEGORIES } from '@/data/operations'
import type { FileCategory, OperationMeta } from '@/types'

const VALUE_PROPS = [
  ['Private by default', 'Every file is processed on your device. Nothing is ever uploaded.'],
  ['One workflow', 'Chain simple modifications together instead of starting over for every task.'],
  ['Built to grow', 'The right operation appears when you need it, without a wall of tools.'],
]

function detectCategory(file: File): FileCategory | null {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf'
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type.includes('spreadsheet') || /\.(csv|xls|xlsx)$/i.test(file.name)) return 'spreadsheet'
  if (file.type.includes('word') || file.type.includes('document')) return 'document'
  if (file.type.startsWith('text/')) return 'text'
  if (/\.(zip|tar|gz|rar|7z)$/i.test(file.name)) return 'archive'
  return null
}

export function Home() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [family, setFamily] = useState<FileCategory | null>(null)
  const [selectedOperation, setSelectedOperation] = useState<OperationMeta | null>(null)

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles(incoming)
    setFamily(detectCategory(incoming[0]))
    setSelectedOperation(null)
  }, [])

  function openOperation(operation: OperationMeta) {
    setSelectedOperation(operation)
    if (operation.path && files.length === 1) {
      navigate(`/tools/${operation.path}`, { state: { file: files[0] } })
    }
  }

  const categoryLabel = FILE_CATEGORIES.find((item) => item.id === family)?.label

  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 sm:pt-24">
        <div className="text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your file workspace</p>
          <h1 className="ff-hero-title text-balance text-4xl sm:text-5xl">Make every file work harder.</h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-ink-muted">
            Upload a file, choose what to change, and build a clean workflow you can reuse.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">🔒 Processed locally in your browser</p>
        </div>

        <div className="mt-10">
          <FileDropzone
            accept="*/*"
            hint="PDF, image, video, audio, document, spreadsheet, text, or archive"
            multiple
            onFile={() => undefined}
            onFiles={handleFiles}
          />
        </div>

        {files.length > 0 && (
          <div className="ff-card mt-4 rounded-xl border p-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2 text-accent"><Layers3 className="h-4 w-4" aria-hidden="true" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{files.length} {files.length === 1 ? 'file' : 'files'} ready</p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">{files[0].name}{files.length > 1 ? ` and ${files.length - 1} more` : ''}</p>
                </div>
              </div>
              <button type="button" onClick={() => { setFiles([]); setFamily(null); setSelectedOperation(null) }} aria-label="Clear uploaded files" className="rounded-lg p-2 text-ink-muted hover:bg-page hover:text-ink"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 font-medium text-accent">{categoryLabel ?? 'File type not detected'}</span>
              {files.length > 1 && <span className="rounded-full border border-line px-2.5 py-1 text-ink-muted">Batch workflow</span>}
            </div>
          </div>
        )}

        {selectedOperation && !selectedOperation.path && (
          <div className="ff-card mt-4 rounded-xl border p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-accent/10 p-2 text-accent"><Upload className="h-4 w-4" aria-hidden="true" /></div>
              <div><p className="text-sm font-medium text-ink">{selectedOperation.name} is ready to configure</p><p className="mt-1 text-sm text-ink-muted">This operation has been added to the platform catalog and will open its settings when that processor is available.</p></div>
            </div>
          </div>
        )}

        <WorkflowBuilder family={family} hasFiles={files.length > 0} onFamilyChange={setFamily} onOpenOperation={openOperation} />

        <dl className="mt-16 grid gap-8 text-left sm:grid-cols-3 sm:gap-6">
          {VALUE_PROPS.map(([title, body]) => <div key={title} className="border-t border-line pt-4"><dt className="font-display text-sm font-medium text-ink">{title}</dt><dd className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</dd></div>)}
        </dl>
      </section>
    </div>
  )
}
