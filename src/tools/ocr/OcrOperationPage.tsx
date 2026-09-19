import { createWorker } from 'tesseract.js'
import { useState } from 'react'
import { FileDropzone } from '@/components/FileDropzone'

export function OcrOperationPage() {
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('eng')
  const [progress, setProgress] = useState(0)
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function runOcr() {
    if (!file) return
    setStatus('working')
    setError(null)
    setProgress(0)
    const worker = await createWorker(language, 1, { logger: (message) => { if (message.status === 'recognizing text') setProgress(Math.round(message.progress * 100)) } })
    try {
      const result = await worker.recognize(file)
      setText(result.data.text)
      setStatus('done')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'OCR could not process this file locally.')
      setStatus('error')
    } finally {
      await worker.terminate()
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${file?.name.replace(/\.[^./]+$/, '') ?? 'ocr'}-text.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <div className="mx-auto max-w-3xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local OCR</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">Extract text with OCR</h1><p className="mt-2 text-ink-muted">Recognize text from images locally in your browser. Files are never uploaded.</p><p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Processed locally with Tesseract.js</p>{!file && <div className="mt-8"><FileDropzone accept="image/*" hint="PNG, JPG, WebP, or another browser-readable image" onFile={setFile} /></div>}{file && <div className="mt-8 space-y-4"><div className="ff-card flex items-center justify-between rounded-xl border p-4"><p className="truncate text-sm font-medium text-ink">{file.name}</p><button type="button" onClick={() => { setFile(null); setText('') }} className="text-sm text-ink-muted hover:text-ink">Change</button></div><label className="block text-sm font-medium text-ink">Language<select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-ink"><option value="eng">English</option><option value="spa">Spanish</option><option value="fra">French</option><option value="deu">German</option></select></label>{status !== 'done' && <button type="button" onClick={runOcr} disabled={status === 'working'} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page hover:bg-accent-hover disabled:opacity-60">{status === 'working' ? `Recognizing locally… ${progress}%` : 'Extract text locally'}</button>}{error && <p className="text-sm text-mark">{error}</p>}{text && <><textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-72 w-full rounded-xl border border-line bg-page p-4 text-sm leading-relaxed text-ink" /><button type="button" onClick={download} className="w-full rounded-lg border border-line py-2.5 text-sm text-ink hover:bg-surface-hover">Download text</button></>}</div>}</div>
}
