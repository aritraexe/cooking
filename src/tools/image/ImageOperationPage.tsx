import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'
import { useImageTransform } from '@/hooks/useImageTransform'
import type { ImageOperation, OutputFormat } from '@/types'

const operationLabels: Record<string, { title: string; description: string; operation: ImageOperation | 'flip' }> = {
  rotate: { title: 'Rotate Image', description: 'Turn an image 90 degrees clockwise locally in your browser.', operation: 'rotate' },
  flip: { title: 'Flip Image', description: 'Mirror an image horizontally or vertically without uploading it.', operation: 'flip-horizontal' },
  grayscale: { title: 'Grayscale Image', description: 'Convert an image to black and white locally.', operation: 'grayscale' },
  convert: { title: 'Convert Image', description: 'Convert an image between browser-supported formats.', operation: 'convert' },
  crop: { title: 'Crop Image', description: 'Create a centered square crop locally.', operation: 'crop' },
  brightness: { title: 'Adjust Brightness', description: 'Adjust image brightness locally.', operation: 'brightness' },
  contrast: { title: 'Adjust Contrast', description: 'Adjust image contrast locally.', operation: 'contrast' },
  sepia: { title: 'Sepia Image', description: 'Apply a warm sepia effect locally.', operation: 'sepia' },
  invert: { title: 'Invert Image', description: 'Invert image colors locally.', operation: 'invert' },
  blur: { title: 'Blur Image', description: 'Apply a browser-native blur locally.', operation: 'blur' },
  pixelate: { title: 'Pixelate Image', description: 'Create a pixelated image effect locally.', operation: 'pixelate' },
  saturation: { title: 'Adjust Saturation', description: 'Adjust image color intensity locally.', operation: 'saturation' },
  hue: { title: 'Adjust Hue', description: 'Shift image colors locally.', operation: 'hue' },
  vintage: { title: 'Vintage Effect', description: 'Apply a vintage color treatment locally.', operation: 'vintage' },
  vignette: { title: 'Vignette', description: 'Apply a subtle vignette treatment locally.', operation: 'vignette' },
}

function inferOperation(routeOperation: string): ImageOperation | 'flip' {
  if (routeOperation.includes('flip')) return 'flip'
  if (routeOperation.includes('crop') || routeOperation.includes('trim')) return 'crop'
  if (routeOperation.includes('brightness') || routeOperation.includes('exposure') || routeOperation.includes('highlights') || routeOperation.includes('shadows')) return 'brightness'
  if (routeOperation.includes('contrast') || routeOperation.includes('gamma') || routeOperation.includes('detail')) return 'contrast'
  if (routeOperation.includes('saturation') || routeOperation.includes('vibrance') || routeOperation.includes('color')) return 'saturation'
  if (routeOperation.includes('hue') || routeOperation.includes('tint') || routeOperation.includes('temperature')) return 'hue'
  if (routeOperation.includes('sepia') || routeOperation.includes('vintage') || routeOperation.includes('film') || routeOperation.includes('duotone')) return 'sepia'
  if (routeOperation.includes('invert')) return 'invert'
  if (routeOperation.includes('blur') || routeOperation.includes('noise') || routeOperation.includes('denoise')) return 'blur'
  if (routeOperation.includes('pixel') || routeOperation.includes('poster')) return 'pixelate'
  if (routeOperation.includes('grayscale') || routeOperation.includes('black-and-white') || routeOperation.includes('black-white')) return 'grayscale'
  if (routeOperation.includes('rotate')) return 'rotate'
  if (routeOperation.includes('resize') || routeOperation.includes('upscale') || routeOperation.includes('canvas')) return 'resize'
  return 'convert'
}

export function ImageOperationPage() {
  const { operation: routeOperation = 'rotate' } = useParams()
  const location = useLocation()
  const inferred = inferOperation(routeOperation)
  const config = operationLabels[routeOperation] ?? { title: routeOperation.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), description: 'Processed locally in your browser.', operation: inferred }
  const [file, setFile] = useState<File | null>(() => (location.state as { file?: File } | null)?.file ?? null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal')
  const [format, setFormat] = useState<OutputFormat>('image/webp')
  const [amount, setAmount] = useState(25)
  const [width, setWidth] = useState(1200)
  const [height, setHeight] = useState(1200)
  const { status, result, error, run, reset } = useImageTransform()

  useEffect(() => {
    if (!file) return undefined
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const effectiveOperation = config.operation === 'flip' ? `flip-${direction}` as ImageOperation : config.operation
  const outputName = useMemo(() => `${file?.name.replace(/\.[^./]+$/, '') ?? 'image'}.${format === 'image/jpeg' ? 'jpg' : format.split('/')[1]}`, [file, format])

  function process() {
    if (!file) return
    run({ file, operation: effectiveOperation, format, quality: 0.9, amount, width: config.operation === 'resize' ? width : undefined, height: config.operation === 'resize' ? height : undefined })
  }

  function resetFile() {
    reset()
    setFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local image tool</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{config.title}</h1>
      <p className="mt-2 text-ink-muted">{config.description}</p>
      <p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Processed locally in a Web Worker</p>

      <div className="mt-8">
        {!file && <FileDropzone accept="image/*" hint="JPG, PNG, WebP, GIF, BMP, or other browser-supported image" onFile={setFile} />}
        {file && (
          <div className="space-y-5">
            <div className="ff-card flex items-center gap-4 rounded-xl border p-4">
              {previewUrl && <img src={previewUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{file.name}</p>
              <button type="button" onClick={resetFile} className="text-sm text-ink-muted hover:text-ink">Change</button>
            </div>
            {status !== 'done' && (
              <div className="ff-card space-y-4 rounded-xl border p-5">
                {config.operation === 'flip' && <div><label htmlFor="direction" className="text-sm font-medium text-ink">Direction</label><select id="direction" value={direction} onChange={(event) => setDirection(event.target.value as typeof direction)} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink"><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></div>}
                {config.operation === 'convert' && <div><label htmlFor="format" className="text-sm font-medium text-ink">Output format</label><select id="format" value={format} onChange={(event) => setFormat(event.target.value as OutputFormat)} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink"><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option></select></div>}
                {config.operation === 'resize' && <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-ink">Width<input type="number" min={1} value={width} onChange={(event) => setWidth(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink" /></label><label className="text-sm font-medium text-ink">Height<input type="number" min={1} value={height} onChange={(event) => setHeight(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink" /></label></div>}
                {['brightness', 'contrast', 'blur', 'saturation', 'hue'].includes(config.operation) && <div><div className="flex justify-between text-sm font-medium text-ink"><label htmlFor="amount">Amount</label><span className="text-ink-muted">{amount}</span></div><input id="amount" type="range" min={['blur'].includes(config.operation) ? 1 : -80} max={config.operation === 'blur' ? 20 : config.operation === 'hue' ? 180 : 80} value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="mt-2 w-full accent-accent" /></div>}
                <button type="button" onClick={process} disabled={status === 'working'} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page hover:bg-accent-hover disabled:opacity-60">{status === 'working' ? 'Processing locally…' : 'Process image'}</button>
                {error && <p className="text-sm text-mark">{error}</p>}
              </div>
            )}
            {status === 'done' && result && <div className="ff-card rounded-xl border p-5"><p className="text-sm font-medium text-ink">Ready to export</p><p className="mt-1 text-sm text-ink-muted">{result.width} × {result.height} · processed locally</p><div className="mt-4 flex gap-3"><a href={result.url} download={outputName} className="flex-1 rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-page hover:bg-accent-hover">Download</a><button type="button" onClick={resetFile} className="rounded-lg border border-line px-4 text-sm text-ink">Try another</button></div></div>}
          </div>
        )}
      </div>
    </div>
  )
}
