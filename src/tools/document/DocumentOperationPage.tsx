import mammoth from 'mammoth'
import { useState } from 'react'
import { FileDropzone } from '@/components/FileDropzone'

export function DocumentOperationPage() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  async function readDocument(candidate: File) {
    setFile(candidate)
    setError(null)
    try {
      if (candidate.name.toLowerCase().endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await candidate.arrayBuffer() })
        setText(result.value)
      } else setText(await candidate.text())
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'This document could not be read locally.') }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${file?.name.replace(/\.[^./]+$/, '') ?? 'document'}.txt`; anchor.click(); URL.revokeObjectURL(url)
  }
  return <div className="mx-auto max-w-3xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local document tool</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">Edit document text</h1><p className="mt-2 text-ink-muted">Read and edit compatible document text locally in your browser.</p><p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Processed locally</p>{!file && <div className="mt-8"><FileDropzone accept=".docx,.txt,.md,.html,.rtf" hint="DOCX, TXT, Markdown, HTML, or RTF" onFile={readDocument} /></div>}{file && <div className="mt-8 space-y-4"><div className="ff-card flex items-center justify-between rounded-xl border p-4"><span className="truncate text-sm text-ink">{file.name}</span><button type="button" onClick={() => { setFile(null); setText('') }} className="text-sm text-ink-muted">Change</button></div><textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-96 w-full rounded-xl border border-line bg-page p-4 text-sm leading-relaxed text-ink" />{error && <p className="text-sm text-mark">{error}</p>}<button type="button" onClick={download} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page">Download text</button></div>}</div>
}
