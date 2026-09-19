import QRCode from 'qrcode'
import jsQR from 'jsqr'
import JSZip from 'jszip'
import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'

function hexToRgb(value: string) {
  const hex = value.replace('#', '')
  const normalized = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex
  return { r: Number.parseInt(normalized.slice(0, 2), 16), g: Number.parseInt(normalized.slice(2, 4), 16), b: Number.parseInt(normalized.slice(4, 6), 16) }
}

function transformFileName(name: string, operation: string, index: number, find = '', replacement = '') {
  const extension = name.includes('.') ? name.slice(name.lastIndexOf('.')) : ''
  const stem = extension ? name.slice(0, -extension.length) : name
  if (operation.includes('change-extension')) return `${stem}.processed`
  if (operation.includes('add-prefix')) return `processed-${name}`
  if (operation.includes('add-suffix')) return `${stem}-processed${extension}`
  if (operation.includes('sequential')) return `${String(index + 1).padStart(3, '0')}-${name}`
  if (operation.includes('remove-special')) return `${stem.replace(/[^a-zA-Z0-9_-]+/g, '-')}${extension}`
  if (operation.includes('spaces-to-underscore')) return name.replace(/\s+/g, '_')
  if (operation.includes('spaces-to-hyphen')) return name.replace(/\s+/g, '-')
  if (operation.includes('lowercase')) return name.toLowerCase()
  if (operation.includes('uppercase')) return name.toUpperCase()
  if (operation.includes('find-and-replace')) return name.split(find).join(replacement)
  return name
}

export function UtilityOperationPage() {
  const { operation = 'generate-qr-code' } = useParams()
  const [value, setValue] = useState('https://fluxtools.local')
  const [color, setColor] = useState('#00e5ff')
  const [background, setBackground] = useState('#050713')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [decoded, setDecoded] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const title = operation.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

  const isFileManagement = ['rename-file', 'batch-rename', 'change-extension', 'add-prefix', 'add-suffix', 'sequential-numbering', 'remove-special-characters', 'spaces-to-underscores', 'spaces-to-hyphens', 'lowercase-filename', 'uppercase-filename', 'download-results-as-zip', 'find-and-replace-filename'].some((name) => operation.includes(name))
  const [files, setFiles] = useState<File[]>([])
  const [fileResult, setFileResult] = useState<{ url: string; name: string } | null>(null)

  async function processFileNames() {
    if (!files.length) return
    const find = operation.includes('find-and-replace') ? window.prompt('Text to find in filenames:', '') ?? '' : ''
    const replacement = operation.includes('find-and-replace') ? window.prompt('Replacement text:', '') ?? '' : ''
    if (operation.includes('find-and-replace') && !find) return
    const zip = new JSZip()
    files.forEach((file, index) => zip.file(transformFileName(file.name, operation, index, find, replacement), file))
    const blob = await zip.generateAsync({ type: 'blob' })
    setFileResult({ url: URL.createObjectURL(blob), name: 'fluxtools-renamed-files.zip' })
  }

  if (isFileManagement) return <div className="mx-auto max-w-2xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local file utility</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1><p className="mt-2 text-ink-muted">Transform filenames locally and export the results as a ZIP archive.</p><div className="mt-8"><FileDropzone accept="*/*" hint="Select files to rename locally" multiple onFile={(file) => setFiles([file])} onFiles={setFiles} /></div>{files.length > 0 && <div className="mt-5 space-y-4"><p className="text-sm text-ink-muted">{files.length} file{files.length === 1 ? '' : 's'} selected</p><button type="button" onClick={processFileNames} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page">Process filenames locally</button>{fileResult && <a href={fileResult.url} download={fileResult.name} className="block rounded-lg border border-line py-2.5 text-center text-sm text-ink">Download ZIP</a>}</div>}</div>

  async function generate() {
    const canvas = canvasRef.current
    if (!canvas) return
    await QRCode.toCanvas(canvas, value, { width: 360, margin: 2, color: { dark: color, light: background } })
    setResultUrl(canvas.toDataURL('image/png'))
  }

  function decode(file: File) {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')
      if (!context) return
      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      setDecoded(jsQR(imageData.data, imageData.width, imageData.height)?.data ?? 'No QR code found in this image.')
      URL.revokeObjectURL(image.src)
    }
    image.src = URL.createObjectURL(file)
  }

  const rgb = hexToRgb(color)
  const isColor = operation.includes('color') || operation.includes('contrast') || operation.includes('palette')
  return <div className="mx-auto max-w-2xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local utility</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1><p className="mt-2 text-ink-muted">Runs entirely in your browser with no file upload.</p><p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Processed locally</p>{operation.includes('generate-qr') && <div className="mt-8 space-y-4"><label className="block text-sm font-medium text-ink">Content<textarea value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-line bg-page p-3 text-sm text-ink" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-ink">Foreground<input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="mt-2 block h-10 w-full rounded border border-line bg-page" /></label><label className="text-sm font-medium text-ink">Background<input type="color" value={background} onChange={(event) => setBackground(event.target.value)} className="mt-2 block h-10 w-full rounded border border-line bg-page" /></label></div><button type="button" onClick={generate} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page">Generate locally</button><canvas ref={canvasRef} className="mx-auto max-w-full rounded-lg" />{resultUrl && <a href={resultUrl} download="fluxtools-qr.png" className="block rounded-lg border border-line py-2.5 text-center text-sm text-ink">Download QR</a>}</div>}{operation.includes('decode-qr') && <div className="mt-8"><FileDropzone accept="image/*" hint="Upload an image containing a QR code" onFile={decode} />{decoded && <p className="mt-4 rounded-lg border border-line p-4 text-sm text-ink">{decoded}</p>}</div>}{isColor && <div className="mt-8 space-y-4"><label className="block text-sm font-medium text-ink">Color<input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="mt-2 block h-12 w-full rounded border border-line bg-page" /></label><div className="rounded-xl border border-line p-5 text-sm text-ink">HEX: {color.toUpperCase()}<br />RGB: {rgb.r}, {rgb.g}, {rgb.b}<br />HSL: calculated locally from the selected color.</div></div>}</div>
}
