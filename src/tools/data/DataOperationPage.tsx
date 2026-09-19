import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'

export function DataOperationPage() {
  const { operation = 'edit-spreadsheet' } = useParams()
  const [files, setFiles] = useState<File[]>([])
  const [text, setText] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const title = operation.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

  useEffect(() => {
    if (!files[0] || operation.includes('zip')) return
    const loadTable = async () => {
      const workbook = files[0].name.toLowerCase().endsWith('.csv')
        ? XLSX.read(await files[0].text(), { type: 'string' })
        : XLSX.read(await files[0].arrayBuffer())
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      setText(XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }).map((row) => row.join(',')).join('\n'))
    }
    loadTable().catch(() => setError('This spreadsheet could not be read locally.'))
  }, [files, operation])

  async function process() {
    if (!files.length) return
    setError(null)
    try {
      if (operation === 'create-zip' || operation === 'extract-zip') {
        const zip = operation === 'create-zip' ? new JSZip() : await JSZip.loadAsync(await files[0].arrayBuffer())
        if (operation === 'create-zip') for (const file of files) zip.file(file.name, await file.arrayBuffer())
        const blob = await zip.generateAsync({ type: 'blob' })
        setResult({ url: URL.createObjectURL(blob), name: operation === 'create-zip' ? 'fluxtools-archive.zip' : 'fluxtools-extracted.zip' })
        return
      }
      const workbook = files[0].name.toLowerCase().endsWith('.csv')
        ? XLSX.read(await files[0].text(), { type: 'string' })
        : XLSX.read(await files[0].arrayBuffer())
      let sheet = workbook.Sheets[workbook.SheetNames[0]]
      let rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
      if (operation === 'remove-duplicates') {
        const unique = rows.filter((row, index) => rows.findIndex((candidate) => JSON.stringify(candidate) === JSON.stringify(row)) === index)
        rows = unique
        setText(rows.map((row) => row.join(',')).join('\n'))
      } else if (operation === 'edit-spreadsheet') {
        rows = text.split('\n').filter(Boolean).map((row) => row.split(','))
        sheet = XLSX.utils.aoa_to_sheet(rows)
        workbook.Sheets[workbook.SheetNames[0]] = sheet
        setText(rows.map((row) => row.join(',')).join('\n'))
      } else {
        setText(rows.map((row) => row.join(',')).join('\n'))
      }
      if (operation === 'edit-spreadsheet') workbook.Sheets[workbook.SheetNames[0]] = sheet
      const output = XLSX.write(workbook, { bookType: operation === 'csv-to-xlsx' ? 'xlsx' : 'csv', type: 'array' })
      setResult({ url: URL.createObjectURL(new Blob([output], { type: 'application/octet-stream' })), name: operation === 'csv-to-xlsx' ? 'fluxtools.xlsx' : 'fluxtools.csv' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This file could not be processed locally.')
    }
  }

  return <div className="mx-auto max-w-2xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local data tool</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1><p className="mt-2 text-ink-muted">Process spreadsheet and archive files locally in your browser.</p><p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Processed locally</p><div className="mt-8"><FileDropzone accept={operation.includes('zip') ? '.zip' : '.csv,.xlsx,.xls'} hint={operation.includes('zip') ? 'ZIP files or files to archive' : 'CSV, XLSX, or XLS'} multiple={operation === 'create-zip'} onFile={(file) => setFiles([file])} onFiles={setFiles} /></div>{files.length > 0 && <div className="mt-5 space-y-4"><p className="text-sm text-ink-muted">{files.length} file{files.length === 1 ? '' : 's'} selected</p>{text && <textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-64 w-full rounded-xl border border-line bg-page p-4 font-mono text-sm text-ink" />}{error && <p className="text-sm text-mark">{error}</p>}<div className="flex gap-3"><button type="button" onClick={process} className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-page hover:bg-accent-hover">Process locally</button>{result && <a href={result.url} download={result.name} className="rounded-lg border border-line px-4 py-2.5 text-sm text-ink">Download</a>}</div></div>}</div>
}
