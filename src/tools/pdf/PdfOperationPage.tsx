import { PDFDocument } from 'pdf-lib'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'
import { loadPdf, selectedPageIndex, transformPdf } from '@/lib/pdfEngine'

type PdfMode = 'merge' | 'split' | 'rotate' | 'images-to-pdf' | 'delete' | 'duplicate' | 'reverse' | 'blank' | 'reorder' | 'overlay' | 'metadata'

const MODES: Record<string, { title: string; description: string; mode: PdfMode }> = {
  merge: { title: 'Merge PDFs', description: 'Combine PDF files locally in the order you choose.', mode: 'merge' },
  split: { title: 'Split PDF', description: 'Extract one page from a PDF into a new local file.', mode: 'split' },
  extract: { title: 'Extract Pages', description: 'Extract a selected page from a PDF locally.', mode: 'split' },
  rotate: { title: 'Rotate Pages', description: 'Rotate every page of a PDF locally in your browser.', mode: 'rotate' },
  'images-to-pdf': { title: 'Images to PDF', description: 'Combine images into a PDF without uploading them.', mode: 'images-to-pdf' },
  'delete-pages': { title: 'Delete Pages', description: 'Remove a selected page from a PDF locally.', mode: 'delete' },
  'duplicate-page': { title: 'Duplicate Page', description: 'Duplicate a selected page in a PDF locally.', mode: 'duplicate' },
  'reverse-page-order': { title: 'Reverse Page Order', description: 'Reverse all PDF pages locally.', mode: 'reverse' },
  'add-blank-page': { title: 'Add Blank Page', description: 'Add a blank page to the end of a PDF locally.', mode: 'blank' },
  'reorder-pages': { title: 'Reorder Pages', description: 'Move a selected page to the front of a PDF locally.', mode: 'reorder' },
}

export function PdfOperationPage() {
  const { operation = 'merge' } = useParams()
  const location = useLocation()
  const inferredMode: PdfMode = operation.includes('metadata') || operation.includes('title') || operation.includes('author') || operation.includes('subject') || operation.includes('keywords') ? 'metadata' : operation === 'merge-pdf' ? 'merge' : 'overlay'
  const config = MODES[operation] ?? { title: operation.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), description: 'Apply this PDF operation locally in your browser.', mode: inferredMode }
  const [files, setFiles] = useState<File[]>(() => {
    const file = (location.state as { file?: File } | null)?.file
    return file ? [file] : []
  })
  const [page, setPage] = useState(1)
  const [angle, setAngle] = useState(90)
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultName, setResultName] = useState('fluxtools-result.pdf')

  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl) }, [resultUrl])

  const hint = useMemo(() => config.mode === 'merge' ? 'Select two or more PDF files' : config.mode === 'images-to-pdf' ? 'Select one or more JPG, PNG, or WebP images' : 'Select a PDF file', [config.mode])

  async function processFiles() {
    if (!files.length || (config.mode === 'merge' && files.length < 2)) return
    setStatus('working')
    setError(null)
    try {
      const output = await PDFDocument.create()
      if (config.mode === 'images-to-pdf') {
        for (const file of files) {
          const bytes = await file.arrayBuffer()
          const image = file.type === 'image/png' ? await output.embedPng(bytes) : await output.embedJpg(bytes)
          const page = output.addPage([image.width, image.height])
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
        }
      } else if (config.mode === 'merge') {
        for (const file of files) {
          const source = await loadPdf(file)
          const pages = await output.copyPages(source, source.getPageIndices())
          pages.forEach((pdfPage) => output.addPage(pdfPage))
        }
      } else {
        const source = await loadPdf(files[0])
        const route = operation
        if (route.includes('metadata') || route.includes('title') || route.includes('author') || route.includes('subject') || route.includes('keywords')) {
          if (route.includes('title')) source.setTitle('FluxTools document')
          if (route.includes('author')) source.setAuthor('FluxTools')
          if (route.includes('subject')) source.setSubject('Processed locally with FluxTools')
          if (route.includes('keywords')) source.setKeywords(['FluxTools', 'local'])
          finish(await source.save(), 'metadata-edited.pdf')
          return
        }
        if (config.mode === 'overlay' || route.includes('add-text') || route.includes('watermark') || route.includes('header') || route.includes('footer') || route.includes('page-number') || route.includes('highlight') || route.includes('underline') || route.includes('strikethrough') || route.includes('annotation') || route.includes('signature') || route.includes('initials') || route.includes('checkmark') || route.includes('cross') || route.includes('stamp')) {
          finish(await transformPdf(files[0], route), 'annotated.pdf')
          return
        }
        if (config.mode === 'rotate') {
          finish(await transformPdf(files[0], route, { angle }), 'rotated.pdf')
          return
        }
        const pageIndex = selectedPageIndex(source, page)
        if (config.mode === 'delete') {
          source.removePage(pageIndex)
          finish(await transformPdf(files[0], route, { page }), 'pages-deleted.pdf')
          return
        }
        if (config.mode === 'duplicate') {
          finish(await transformPdf(files[0], route, { page }), 'duplicated.pdf')
          return
        } else if (config.mode === 'reverse') {
          finish(await transformPdf(files[0], route), 'reversed.pdf')
          return
        } else if (config.mode === 'blank') {
          finish(await transformPdf(files[0], route), 'blank-page-added.pdf')
          return
        } else if (config.mode === 'reorder') {
          finish(await transformPdf(files[0], route, { page }), 'reordered.pdf')
          return
        } else {
          finish(await transformPdf(files[0], route, { page }), 'extracted-page.pdf')
          return
        }
      }
      finish(await output.save(), config.mode === 'images-to-pdf' ? 'images.pdf' : config.mode === 'merge' ? 'merged.pdf' : 'extracted-page.pdf')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This file could not be processed in this browser.')
      setStatus('error')
    }
  }

  function finish(bytes: Uint8Array, name: string) {
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    const output = new Uint8Array(bytes.byteLength)
    output.set(bytes)
    setResultUrl(URL.createObjectURL(new Blob([output.buffer], { type: 'application/pdf' })))
    setResultName(name)
    setStatus('done')
  }

  function reset() {
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFiles([])
    setResultUrl(null)
    setStatus('idle')
    setError(null)
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local PDF tool</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{config.title}</h1>
      <p className="mt-2 text-ink-muted">{config.description}</p>
      <p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Processed locally in your browser</p>
      {!files.length && <div className="mt-8"><FileDropzone accept={config.mode === 'images-to-pdf' ? 'image/*' : 'application/pdf'} hint={hint} multiple={config.mode === 'merge' || config.mode === 'images-to-pdf'} onFile={(file) => setFiles([file])} onFiles={setFiles} /></div>}
      {files.length > 0 && <div className="mt-8 space-y-5">
        <div className="ff-card rounded-xl border p-4"><p className="text-sm font-medium text-ink">{files.length} file{files.length === 1 ? '' : 's'} selected</p><p className="mt-1 truncate text-xs text-ink-muted">{files.map((file) => file.name).join(', ')}</p></div>
        {config.mode === 'split' && <label className="block text-sm font-medium text-ink">Page number<input type="number" min={1} value={page} onChange={(event) => setPage(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-ink" /></label>}
        {config.mode === 'rotate' && <label className="block text-sm font-medium text-ink">Rotation<select value={angle} onChange={(event) => setAngle(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-ink"><option value={90}>90° clockwise</option><option value={180}>180°</option><option value={270}>270° clockwise</option></select></label>}
        {status !== 'done' && <button type="button" onClick={processFiles} disabled={status === 'working' || (config.mode === 'merge' && files.length < 2)} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page hover:bg-accent-hover disabled:opacity-60">{status === 'working' ? 'Processing locally…' : 'Process PDF'}</button>}
        {error && <p className="text-sm text-mark">{error}</p>}
        {status === 'done' && resultUrl && <div className="ff-card rounded-xl border p-5"><p className="text-sm font-medium text-ink">Ready to export</p><p className="mt-1 text-sm text-ink-muted">Created locally with no upload.</p><div className="mt-4 flex gap-3"><a href={resultUrl} download={resultName} className="flex-1 rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-page hover:bg-accent-hover">Download PDF</a><button type="button" onClick={reset} className="rounded-lg border border-line px-4 text-sm text-ink">Start over</button></div></div>}
      </div>}
    </div>
  )
}
