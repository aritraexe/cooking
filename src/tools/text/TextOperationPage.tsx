import { useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FileDropzone } from '@/components/FileDropzone'

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function transformText(value: string, operation: string) {
  if (operation.includes('sort-lines')) return value.split('\n').sort((a, b) => a.localeCompare(b)).join('\n')
  if (operation.includes('remove-duplicate-lines')) return [...new Set(value.split('\n'))].join('\n')
  if (operation.includes('remove-blank-lines')) return value.split('\n').filter(Boolean).join('\n')
  if (operation.includes('trim-whitespace')) return value.split('\n').map((line) => line.trim()).join('\n')
  if (operation.includes('uppercase')) return value.toUpperCase()
  if (operation.includes('lowercase')) return value.toLowerCase()
  if (operation.includes('title-case')) return value.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
  if (operation.includes('line-numbering')) return value.split('\n').map((line, index) => `${index + 1}: ${line}`).join('\n')
  if (operation.includes('minify') || operation.includes('compress-or-minify')) return value.replace(/\s+/g, ' ').trim()
  if (operation.includes('remove-html-tags')) return value.replace(/<[^>]*>/g, '')
  if (operation.includes('unescape')) return value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  if (operation.includes('escape')) return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  if (operation.includes('extract-text-from-html')) return value.replace(/<[^>]*>/g, '')
  if (operation === 'encode') return btoa(unescape(encodeURIComponent(value)))
  if (operation === 'decode') {
    try { return decodeURIComponent(escape(atob(value))) } catch { return 'Unable to decode this value as Base64.' }
  }
  if (operation.includes('validate-html')) {
    const document = new DOMParser().parseFromString(value, 'text/html')
    return document.querySelector('parsererror') ? 'Invalid HTML document.' : 'Valid HTML document.'
  }
  if (operation.includes('validate-json')) {
    try { JSON.parse(value); return 'Valid JSON document.' } catch { return 'Invalid JSON document.' }
  }
  if (operation.includes('validate-xml')) {
    const document = new DOMParser().parseFromString(value, 'application/xml')
    return document.querySelector('parsererror') ? 'Invalid XML document.' : 'Valid XML document.'
  }
  if (operation.includes('json-to-csv')) {
    const rows = JSON.parse(value)
    const matrix = Array.isArray(rows) ? rows : [rows]
    return matrix.map((row) => Object.values(row).join(',')).join('\n')
  }
  if (operation.includes('json-to-xml')) {
    const parsed = JSON.parse(value) as Record<string, unknown>
    const toXml = (obj: Record<string, unknown>, rootName = 'root'): string => {
      const entries = Object.entries(obj).map(([childKey, childValue]) => {
        if (Array.isArray(childValue)) {
          return childValue.map((item) => `<${childKey}>${typeof item === 'object' && item !== null ? toXml(item as Record<string, unknown>, childKey) : String(item)}</${childKey}>`).join('')
        }
        if (typeof childValue === 'object' && childValue !== null) {
          return `<${childKey}>${toXml(childValue as Record<string, unknown>, childKey)}</${childKey}>`
        }
        return `<${childKey}>${String(childValue)}</${childKey}>`
      })
      return `<${rootName}>${entries.join('')}</${rootName}>`
    }
    return toXml(parsed)
  }
  if (operation.includes('xml-to-json')) {
    const normalized = value.replace(/<\/?[A-Za-z0-9_-]+>/g, '').trim()
    return JSON.stringify({ raw: normalized }, null, 2)
  }
  if (operation.includes('xml-to-csv')) {
    const document = new DOMParser().parseFromString(value, 'application/xml')
    if (document.querySelector('parsererror')) return 'Invalid XML document.'
    const rows = Array.from(document.documentElement.children).map((node) => Array.from(node.children).map((child) => child.textContent ?? '').join(','))
    return rows.join('\n')
  }
  if (operation.includes('beautify') || operation.includes('format') || operation.includes('validate')) {
    try { return JSON.stringify(JSON.parse(value), null, 2) } catch { return value.split('\n').map((line) => line.trim()).join('\n') }
  }
  return value
}

export function TextOperationPage() {
  const { operation = 'edit-text' } = useParams()
  const location = useLocation()
  const [file, setFile] = useState<File | null>(() => (location.state as { file?: File } | null)?.file ?? null)
  const [value, setValue] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [find, setFind] = useState('')
  const [replacement, setReplacement] = useState('')
  const [caseMode, setCaseMode] = useState<'upper' | 'lower' | 'title'>('upper')

  useEffect(() => { if (file) file.text().then(setValue).catch(() => setError('This text file could not be read locally.')) }, [file])

  const title = operation.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  const process = () => {
    setError(null)
    if (operation.includes('find-and-replace')) {
      if (!find) { setError('Enter text to find before applying the replacement.'); return }
      setResult(value.split(find).join(replacement))
      return
    }
    if (operation.includes('character-count')) { setResult(`Characters: ${value.length}\nCharacters without spaces: ${value.replace(/\s/g, '').length}`); return }
    if (operation.includes('word-count')) { setResult(`Words: ${value.trim() ? value.trim().split(/\s+/).length : 0}`); return }
    if (operation.includes('convert-case')) { setResult(caseMode === 'upper' ? value.toUpperCase() : caseMode === 'lower' ? value.toLowerCase() : value.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase())); return }
    setResult(transformText(value, operation))
  }
  const download = () => {
    if (result === null) return
    const url = URL.createObjectURL(new Blob([result], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${file?.name.replace(/\.[^./]+$/, '') ?? 'fluxtools'}-${operation}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <div className="mx-auto max-w-3xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local text tool</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1><p className="mt-2 text-ink-muted">Edit and transform text locally without uploading it.</p><p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Processed locally in your browser</p>{!file && <div className="mt-8"><FileDropzone accept=".txt,.md,.html,.css,.js,.json,.xml,.csv,.yaml,text/*" hint="TXT, Markdown, HTML, CSS, JS, JSON, XML, CSV, or YAML" onFile={setFile} /></div>}{file && <div className="mt-8 space-y-4"><div className="ff-card flex items-center justify-between rounded-xl border p-4"><p className="truncate text-sm font-medium text-ink">{file.name}</p><button type="button" onClick={() => { setFile(null); setValue(''); setResult(null) }} className="text-sm text-ink-muted hover:text-ink">Change</button></div>{operation.includes('find-and-replace') && <div className="grid gap-3 sm:grid-cols-2"><input value={find} onChange={(event) => setFind(event.target.value)} placeholder="Find text..." className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink" /><input value={replacement} onChange={(event) => setReplacement(event.target.value)} placeholder="Replace with..." className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink" /></div>}{operation.includes('convert-case') && <label className="block text-sm font-medium text-ink">Case<select value={caseMode} onChange={(event) => setCaseMode(event.target.value as typeof caseMode)} className="mt-2 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink"><option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="title">Title Case</option></select></label>}<textarea value={result ?? value} onChange={(event) => { setResult(null); setValue(event.target.value) }} className="min-h-80 w-full rounded-xl border border-line bg-page/70 p-4 font-mono text-sm leading-relaxed text-ink outline-none focus:border-accent/50" spellCheck={false} />{error && <p className="text-sm text-mark">{error}</p>}<div className="flex gap-3"><button type="button" onClick={process} className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-page hover:bg-accent-hover">Apply locally</button>{result !== null && <button type="button" onClick={download} className="rounded-lg border border-line px-4 text-sm text-ink hover:bg-surface-hover">Download</button>}</div></div>}</div>
}

export { slug }
