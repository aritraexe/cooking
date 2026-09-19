import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'

const MEDIA_TOOLS: Record<string, { title: string; accept: string; audio?: boolean; args: (file: string, output: string, start: number, duration: number, quality: number) => string[] }> = {
  'trim-video': { title: 'Trim Video', accept: 'video/*', args: (file, output, start, duration) => ['-ss', String(start), '-i', file, '-t', String(duration), '-c', 'copy', output] },
  'compress-video': { title: 'Compress Video', accept: 'video/*', args: (file, output, _start, _duration, quality) => ['-i', file, '-vf', `scale=${quality < 70 ? '1280:-2' : '-2:720'}`, '-c:v', 'libx264', '-crf', String(Math.round(34 - quality / 5)), '-c:a', 'aac', output] },
  'convert-video': { title: 'Convert Video', accept: 'video/*', args: (file, output) => ['-i', file, '-c:v', 'libx264', '-c:a', 'aac', output] },
  'extract-audio': { title: 'Extract Audio', accept: 'video/*', audio: true, args: (file, output) => ['-i', file, '-vn', '-c:a', 'libmp3lame', output] },
  'trim-audio': { title: 'Trim Audio', accept: 'audio/*', audio: true, args: (file, output, start, duration) => ['-ss', String(start), '-i', file, '-t', String(duration), '-c:a', 'libmp3lame', output] },
  'convert-audio': { title: 'Convert Audio', accept: 'audio/*', audio: true, args: (file, output) => ['-i', file, '-c:a', 'libmp3lame', output] },
  'compress-audio': { title: 'Compress Audio', accept: 'audio/*', audio: true, args: (file, output) => ['-i', file, '-b:a', '96k', output] },
}

export function MediaOperationPage() {
  const { operation = 'trim-video' } = useParams()
  const config = MEDIA_TOOLS[operation] ?? MEDIA_TOOLS['trim-video']
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [start, setStart] = useState(0)
  const [duration, setDuration] = useState(10)
  const [quality, setQuality] = useState(70)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); ffmpegRef.current?.terminate() }, [result])

  async function process() {
    if (!file) return
    setError(null)
    setStatus('loading')
    try {
      const ffmpeg = ffmpegRef.current ?? new FFmpeg()
      ffmpegRef.current = ffmpeg
      ffmpeg.on('progress', ({ progress: value }) => setProgress(Math.round(value * 100)))
      if (!ffmpeg.loaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
        await ffmpeg.load({ coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'), wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm') })
      }
      setStatus('working')
      const input = `input.${file.name.split('.').pop() || 'bin'}`
      const extension = config.audio ? 'mp3' : operation === 'convert-video' ? 'mp4' : file.name.split('.').pop() || 'mp4'
      const output = `output.${extension}`
      await ffmpeg.writeFile(input, await fetchFile(file))
      await ffmpeg.exec(config.args(input, output, start, duration, quality))
      const data = await ffmpeg.readFile(output)
      const bytes = data instanceof Uint8Array ? new Uint8Array(data) : new Uint8Array()
      const url = URL.createObjectURL(new Blob([bytes.buffer], { type: config.audio ? 'audio/mpeg' : 'video/mp4' }))
      setResult({ url, name: `${file.name.replace(/\.[^./]+$/, '')}-${operation}.${extension}` })
      setStatus('done')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This media file could not be processed locally.')
      setStatus('error')
    }
  }

  return <div className="mx-auto max-w-2xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local media tool</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">{config.title}</h1><p className="mt-2 text-ink-muted">Runs in your browser with a local WebAssembly media engine.</p><p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Your media stays on this device</p>{!file && <div className="mt-8"><FileDropzone accept={config.accept} hint={config.audio ? 'MP3, WAV, M4A, OGG, or other supported audio' : 'MP4, WebM, MOV, AVI, MKV, or other supported video'} onFile={setFile} /></div>}{file && <div className="mt-8 space-y-4"><div className="ff-card flex items-center justify-between rounded-xl border p-4"><p className="truncate text-sm font-medium text-ink">{file.name}</p><button type="button" onClick={() => setFile(null)} className="text-sm text-ink-muted hover:text-ink">Change</button></div>{(operation.includes('trim') || operation === 'compress-video') && <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-ink">Start seconds<input type="number" min={0} value={start} onChange={(event) => setStart(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-ink" /></label><label className="text-sm font-medium text-ink">Duration seconds<input type="number" min={1} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-ink" /></label></div>}{operation === 'compress-video' && <label className="block text-sm font-medium text-ink">Quality: {quality}%<input type="range" min={20} max={95} value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="mt-2 w-full accent-accent" /></label>}{status !== 'done' && <button type="button" onClick={process} disabled={status === 'loading' || status === 'working'} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-page hover:bg-accent-hover disabled:opacity-60">{status === 'loading' ? 'Loading local engine…' : status === 'working' ? `Processing locally… ${progress}%` : 'Process locally'}</button>}{error && <p className="text-sm text-mark">{error}</p>}{result && <div className="ff-card rounded-xl border p-5"><p className="text-sm font-medium text-ink">Ready to export</p><a href={result.url} download={result.name} className="mt-4 block rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-page hover:bg-accent-hover">Download result</a></div>}</div>}</div>
}
