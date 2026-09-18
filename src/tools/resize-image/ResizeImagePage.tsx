import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'
import { useImageTransform } from '@/hooks/useImageTransform'
import { formatBytes } from '@/lib/format'
import type { OutputFormat } from '@/types'

const PRESETS = [100, 75, 50, 25]

function outputFormatFor(file: File): OutputFormat {
  if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') {
    return file.type as OutputFormat
  }
  return 'image/png'
}

export function ResizeImagePage() {
  const location = useLocation()
  const [file, setFile] = useState<File | null>(
    () => (location.state as { file?: File } | null)?.file ?? null,
  )
  const [fileError, setFileError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [original, setOriginal] = useState<{ width: number; height: number } | null>(null)
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [lockAspect, setLockAspect] = useState(true)
  const { status, result, error, run, reset } = useImageTransform()

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
    setOriginal(null)
    setFile(candidate)
  }

  function handleImageLoad(img: HTMLImageElement) {
    const dims = { width: img.naturalWidth, height: img.naturalHeight }
    setOriginal(dims)
    setWidth(dims.width)
    setHeight(dims.height)
  }

  function applyPreset(percent: number) {
    if (!original) return
    setWidth(Math.round((original.width * percent) / 100))
    setHeight(Math.round((original.height * percent) / 100))
  }

  function handleWidthChange(value: number) {
    setWidth(value)
    if (lockAspect && original) {
      setHeight(Math.round((value * original.height) / original.width))
    }
  }

  function handleHeightChange(value: number) {
    setHeight(value)
    if (lockAspect && original) {
      setWidth(Math.round((value * original.width) / original.height))
    }
  }

  function handleResize() {
    if (!file || !width || !height) return
    run({ file, width, height, format: outputFormatFor(file), quality: 0.92 })
  }

  function handleReset() {
    reset()
    setFile(null)
    setOriginal(null)
    setFileError(null)
  }

  const outputName = file ? file.name : 'image'

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Resize Image</h1>
      <p className="mt-2 text-ink-muted">Set exact pixel dimensions, keeping the aspect ratio if you want.</p>

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
                  onLoad={(event) => handleImageLoad(event.currentTarget)}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                <p className="font-mono text-xs tabular-nums text-ink-muted">
                  {original ? `${original.width} \u00d7 ${original.height} \u00b7 ` : ''}
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

            {status !== 'done' && original && (
              <div className="space-y-5 rounded-xl border border-line bg-surface p-5">
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => applyPreset(percent)}
                      className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-accent/50 hover:text-ink"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label htmlFor="width" className="text-sm font-medium text-ink">
                      Width
                    </label>
                    <input
                      id="width"
                      type="number"
                      min={1}
                      value={width}
                      onChange={(event) => handleWidthChange(Number(event.target.value))}
                      className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 font-mono text-sm tabular-nums text-ink"
                    />
                  </div>
                  <span className="pb-2.5 text-ink-muted">&times;</span>
                  <div className="flex-1">
                    <label htmlFor="height" className="text-sm font-medium text-ink">
                      Height
                    </label>
                    <input
                      id="height"
                      type="number"
                      min={1}
                      value={height}
                      onChange={(event) => handleHeightChange(Number(event.target.value))}
                      className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 font-mono text-sm tabular-nums text-ink"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={lockAspect}
                    onChange={(event) => setLockAspect(event.target.checked)}
                    className="accent-accent"
                  />
                  Lock aspect ratio
                </label>

                <button
                  type="button"
                  onClick={handleResize}
                  disabled={status === 'working'}
                  className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  {status === 'working' ? 'Resizing\u2026' : 'Resize'}
                </button>
                {error && <p className="text-sm text-mark">{error}</p>}
              </div>
            )}

            {status === 'done' && result && (
              <div className="rounded-xl border border-line bg-surface p-5">
                <p className="text-sm font-medium text-ink">Done</p>
                <p className="mt-1 font-mono text-sm tabular-nums text-ink-muted">
                  {result.width} &times; {result.height} &middot; {formatBytes(result.blob.size)}
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
