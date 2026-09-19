import JSZip from 'jszip'
import { useState } from 'react'
import { FileDropzone } from '@/components/FileDropzone'
import type { ImageOperation, TransformResponse } from '@/types'
import { processBatch as runBatch } from '@/lib/batchEngine'

function processFile(file: File, operation: ImageOperation, amount: number) {
  return new Promise<Blob>((resolve, reject) => {
    const worker = new Worker(new URL('../../workers/imageTransform.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<TransformResponse>) => {
      worker.terminate()
      if (event.data.ok) resolve(event.data.blob)
      else reject(new Error(event.data.error))
    }
    worker.onerror = () => { worker.terminate(); reject(new Error('The worker could not process this image.')) }
    worker.postMessage({ file, operation, format: 'image/webp', quality: 0.85, amount })
  })
}

export function BatchImagePage() {
  const [files, setFiles] = useState<File[]>([])
  const [operation, setOperation] = useState<ImageOperation>('compress')
  const [amount, setAmount] = useState(25)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  async function processBatch() {
    if (!files.length) return
    setStatus('working'); setError(null); setProgress(0)
    try {
      const zip = new JSZip()
      const outputs = await runBatch(files, (file) => processFile(file, operation, amount), (completed, total) => setProgress(Math.round((completed / total) * 100)), 2)
      outputs.forEach((output, index) => zip.file(`${files[index].name.replace(/\.[^./]+$/, '')}-${operation}.webp`, output))
      const blob = await zip.generateAsync({ type: 'blob' })
      setDownloadUrl(URL.createObjectURL(blob)); setStatus('done')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Batch processing failed locally.'); setStatus('error') }
  }

  return <div className="mx-auto max-w-2xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local batch workflow</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">Process images in bulk</h1><p className="mt-2 text-ink-muted">Process selected images one at a time in Web Workers, then download one ZIP.</p><p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Files stay on your device</p><div className="mt-8"><FileDropzone accept="image/*" hint="Select up to 100 images" multiple onFile={(file) => setFiles([file])} onFiles={setFiles} /></div>{files.length > 0 && <div className="mt-5 space-y-4"><p className="text-sm text-ink-muted">{files.length} images selected</p><label className="block text-sm font-medium text-ink">Operation<select value={operation} onChange={(event) => setOperation(event.target.value as ImageOperation)} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-ink"><option value="compress">Compress</option><option value="resize">Resize</option><option value="grayscale">Grayscale</option><option value="brightness">Brightness</option><option value="contrast">Contrast</option><option value="saturation">Saturation</option><option value="sepia">Sepia</option></select></label>{['brightness', 'contrast', 'saturation'].includes(operation) && <input type="range" min={-80} max={80} value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="w-full accent-accent" />}{status !== 'done' && <button type="button" onClick={processBatch} disabled={status === 'working'} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page disabled:opacity-60">{status === 'working' ? `Processing locally… ${progress}%` : 'Process batch'}</button>}{error && <p className="text-sm text-mark">{error}</p>}{downloadUrl && <a href={downloadUrl} download="fluxtools-images.zip" className="block rounded-lg border border-line py-2.5 text-center text-sm text-ink">Download ZIP</a>}</div>}</div>
}
