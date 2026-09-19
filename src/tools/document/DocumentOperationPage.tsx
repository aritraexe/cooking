import mammoth from 'mammoth'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'

export function DocumentOperationPage() {
  const { operation = 'edit-document' } = useParams()
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [outputType, setOutputType] = useState<'text' | 'html'>('text')
  const [error, setError] = useState<string | null>(null)

  const title = operation.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

  async function readDocument(candidate: File) {
    setFile(candidate)
    setError(null)
    try {
      if (candidate.name.toLowerCase().endsWith('.docx')) {
        if (operation.includes('docx-to-html')) {
          const result = await mammoth.convertToHtml({ arrayBuffer: await candidate.arrayBuffer() })
          setText(result.value)
          setOutputType('html')
        } else {
          const result = await mammoth.extractRawText({ arrayBuffer: await candidate.arrayBuffer() })
          setText(result.value)
          setOutputType('text')
        }
      } else setText(await candidate.text())
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'This document could not be read locally.') }
  }

  function runDocumentTransform() {
    if (!text) return
    if (operation.includes('find-and-replace')) {
      const search = window.prompt('Find text:', '') ?? ''
      const replacement = window.prompt('Replace with:', '') ?? ''
      if (!search) return
      setText((current) => current.split(search).join(replacement))
    } else if (operation.includes('convert-document')) {
      setText((current) => current.replace(/\s+/g, ' ').trim())
    } else if (operation.includes('split-document')) {
      setText((current) => current.split(/\n{2,}/).join('\n'))
    }
  }

  function download() {
    const extension = outputType === 'html' ? 'html' : 'txt'
    const url = URL.createObjectURL(new Blob([text], { type: outputType === 'html' ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${file?.name.replace(/\.[^./]+$/, '') ?? 'document'}.${extension}`; anchor.click(); URL.revokeObjectURL(url)
  }
  return <div className="mx-auto max-w-3xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local document tool</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1><p className="mt-2 text-ink-muted">Read and edit compatible document text locally in your browser.</p><p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Processed locally</p>{!file && <div className="mt-8"><FileDropzone accept=".docx,.txt,.md,.html,.rtf" hint="DOCX, TXT, Markdown, HTML, or RTF" onFile={readDocument} /></div>}{file && <div className="mt-8 space-y-4"><div className="ff-card flex items-center justify-between rounded-xl border p-4"><span className="truncate text-sm text-ink">{file.name}</span><button type="button" onClick={() => { setFile(null); setText('') }} className="text-sm text-ink-muted">Change</button></div><textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-96 w-full rounded-xl border border-line bg-page p-4 text-sm leading-relaxed text-ink" />{error && <p className="text-sm text-mark">{error}</p>}<button type="button" onClick={runDocumentTransform} className="w-full rounded-lg border border-line py-2.5 text-sm font-semibold text-ink">Apply local transform</button><button type="button" onClick={download} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page">Download text</button></div>}</div>
}
