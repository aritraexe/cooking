import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'
import { useImageTransform } from '@/hooks/useImageTransform'
import { formatBytes, formatPercentChange } from '@/lib/format'
import type { OutputFormat } from '@/types'

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'image/webp', label: 'WebP (recommended)' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG — lossless, larger' },
]

function extensionFor(format: OutputFormat) {
  if (format === 'image/webp') return 'webp'
  if (format === 'image/png') return 'png'
  return 'jpg'
}

export function CompressImagePage() {
  const location = useLocation()
  const [file, setFile] = useState<File | null>(
    () => (location.state as { file?: File } | null)?.file ?? null,
  )
  const [fileError, setFileError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<OutputFormat>('image/webp')
  const { status, result, error, run, reset } = useImageTransform()

  // Pick up a file handed off from the homepage's hero dropzone, if any (see useState above).

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleFile(candidate: File) {
    if (!candidate.type.startsWith('image/')) {
      setFileError('That doesn\u2019t look like an image. Try a JPG, PNG, or WebP file.')
      return
    }
    setFileError(null)
    reset()
    setDimensions(null)
    setFile(candidate)
  }

  function handleCompress() {
    if (!file) return
    run({ file, format, quality: quality / 100 })
  }

  function handleReset() {
    reset()
    setFile(null)
    setDimensions(null)
    setFileError(null)
  }

  const outputName = file ? `${file.name.replace(/\.[^./]+$/, '')}.${extensionFor(format)}` : 'image'

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Compress Image</h1>
      <p className="mt-2 text-ink-muted">Shrink a JPG, PNG, or WebP file while keeping it sharp.</p>

      <div className="mt-8">
        {!file && (
          <>
            <FileDropzone accept="image/*" hint="JPG, PNG, or WebP" onFile={handleFile} />
            {fileError && <p className="mt-3 text-sm text-mark">{fileError}</p>}
          </>
        )}

        {file && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  onLoad={(event) => {
                    const img = event.currentTarget
                    setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
                  }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                <p className="font-mono text-xs tabular-nums text-ink-muted">
                  {dimensions ? `${dimensions.width} \u00d7 ${dimensions.height} \u00b7 ` : ''}
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="shrink-0 text-sm text-ink-muted hover:text-ink"
              >
                Change
              </button>
            </div>

            {status !== 'done' && (
              <div className="space-y-5 rounded-xl border border-line bg-surface p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="quality" className="text-sm font-medium text-ink">
                      Quality
                    </label>
                    <span className="font-mono text-sm tabular-nums text-ink-muted">{quality}%</span>
                  </div>
                  <input
                    id="quality"
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    disabled={format === 'image/png'}
                    onChange={(event) => setQuality(Number(event.target.value))}
                    className="mt-2 w-full accent-accent disabled:opacity-40"
                  />
                  {format === 'image/png' && (
                    <p className="mt-1.5 text-xs text-ink-muted">
                      PNG is lossless, so quality doesn&rsquo;t apply here.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="format" className="text-sm font-medium text-ink">
                    Output format
                  </label>
                  <select
                    id="format"
                    value={format}
                    onChange={(event) => setFormat(event.target.value as OutputFormat)}
                    className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink"
                  >
                    {FORMAT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleCompress}
                  disabled={status === 'working'}
                  className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  {status === 'working' ? 'Compressing\u2026' : 'Compress'}
                </button>
                {error && <p className="text-sm text-mark">{error}</p>}
              </div>
            )}

            {status === 'done' && result && (
              <div className="rounded-xl border border-line bg-surface p-5">
                <p className="text-sm font-medium text-ink">Done</p>
                <p className="mt-1 font-mono text-sm tabular-nums text-ink-muted">
                  {formatBytes(file.size)} &rarr; {formatBytes(result.blob.size)} (
                  {formatPercentChange(file.size, result.blob.size)})
                </p>
                <div className="mt-4 flex gap-3">
                  <a
                    href={result.url}
                    download={outputName}
                    className="flex-1 rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-page transition-colors hover:bg-accent-hover"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-line px-4 py-2.5 text-sm text-ink transition-colors hover:bg-surface-hover"
                  >
                    Try another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
