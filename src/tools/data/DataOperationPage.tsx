import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileDropzone } from '@/components/FileDropzone'

type Cell = string | number | boolean | Date | null
type Rows = Cell[][]

function sheetRows(workbook: XLSX.WorkBook, sheetName = workbook.SheetNames[0]): Rows {
  return XLSX.utils.sheet_to_json<Cell[]>(workbook.Sheets[sheetName], { header: 1, defval: '' })
}

function rowsToText(rows: Rows) {
  return XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(rows))
}

function workbookFromRows(rows: Rows) {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Sheet1')
  return workbook
}

function htmlRows(source: string): Rows {
  const document = new DOMParser().parseFromString(source, 'text/html')
  const table = document.querySelector('table')
  if (!table) throw new Error('The HTML file does not contain a table.')
  return Array.from(table.rows).map((row) => Array.from(row.cells).map((cell) => cell.textContent?.trim() ?? ''))
}

function jsonRows(source: string): Rows {
  const value: unknown = JSON.parse(source)
  if (!Array.isArray(value)) throw new Error('JSON must contain an array of rows or objects.')
  if (!value.length) return []
  if (value.every((row) => Array.isArray(row))) return value as Rows
  if (!value.every((row) => row !== null && typeof row === 'object' && !Array.isArray(row))) throw new Error('JSON rows must be arrays or objects.')
  const records = value as Record<string, unknown>[]
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))]
  return [headers, ...records.map((record) => headers.map((header) => {
    const cell = record[header]
    return cell === null || typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean' ? cell : JSON.stringify(cell)
  }))]
}

async function readWorkbook(file: File) {
  const extension = file.name.toLowerCase().split('.').pop()
  if (extension === 'json') return workbookFromRows(jsonRows(await file.text()))
  if (extension === 'html' || extension === 'htm') return workbookFromRows(htmlRows(await file.text()))
  return extension === 'csv'
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer())
}

function promptNumber(message: string, fallback: number, minimum = 1) {
  const value = window.prompt(message, String(fallback))
  if (value === null) throw new Error('The operation was cancelled.')
  const number = Number(value)
  if (!Number.isInteger(number) || number < minimum) throw new Error(`Enter a whole number of at least ${minimum}.`)
  return number
}

function updateCells(rows: Rows, callback: (cell: Cell) => Cell): Rows {
  return rows.map((row) => row.map(callback))
}

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
      const workbook = await readWorkbook(files[0])
      setText(rowsToText(sheetRows(workbook)))
    }
    loadTable().catch(() => setError('This spreadsheet could not be read locally.'))
  }, [files, operation])

  async function process() {
    if (!files.length) return
    setError(null)
    try {
      if (operation === 'create-zip' || operation === 'extract-zip' || operation.includes('archive')) {
        const createsArchive = operation === 'create-zip' || operation.includes('create-archive')
        const zip = createsArchive ? new JSZip() : await JSZip.loadAsync(await files[0].arrayBuffer())
        if (createsArchive || operation.includes('add-files')) {
          for (const file of (createsArchive ? files : files.slice(1))) zip.file(file.name, await file.arrayBuffer())
        } else if (operation.includes('remove-files')) {
          const name = window.prompt('Archive entry to remove:', '') ?? ''
          if (!name) throw new Error('An archive entry is required.')
          zip.remove(name)
        } else if (operation.includes('rename-files')) {
          const currentName = window.prompt('Archive entry to rename:', '') ?? ''
          const nextName = window.prompt('New entry name:', '') ?? ''
          const entry = currentName ? zip.file(currentName) : null
          if (!currentName || !nextName || !entry) throw new Error('Provide an existing entry and a new name.')
          zip.file(nextName, await entry.async('uint8array'))
          zip.remove(currentName)
        } else if (operation.includes('replace-files')) {
          const name = window.prompt('Archive entry to replace:', '') ?? ''
          if (!name || !files[1]) throw new Error('Select a replacement file and provide an entry name.')
          zip.file(name, await files[1].arrayBuffer())
        }
        const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: operation.includes('compress') || operation.includes('recompress') ? 9 : 6 } })
        setResult({ url: URL.createObjectURL(blob), name: operation.includes('extract') ? 'fluxtools-extracted.zip' : 'fluxtools-archive.zip' })
        return
      }
      const workbook = await readWorkbook(files[0])
      let rows = sheetRows(workbook)

      if (operation.includes('edit-spreadsheet')) {
        if (!text.trim()) throw new Error('Enter spreadsheet data before processing.')
        rows = sheetRows(XLSX.read(text, { type: 'string' }))
      } else if (operation.includes('find-and-replace')) {
        const pattern = window.prompt('Find text to replace:', '') ?? ''
        const replacement = window.prompt('Replacement text:', '') ?? ''
        if (!pattern) throw new Error('A find value is required.')
        rows = updateCells(rows, (cell) => typeof cell === 'string' ? cell.replaceAll(pattern, replacement) : cell)
      } else if (operation.includes('sort-data') || operation === 'sort') {
        const column = promptNumber('Column number to sort by:', 1) - 1
        const descending = (window.prompt('Sort direction (asc or desc):', 'asc') ?? 'asc').toLowerCase() === 'desc'
        const hasHeader = (window.confirm('Treat the first row as a header?'))
        const header = hasHeader ? rows.slice(0, 1) : []
        const body = rows.slice(hasHeader ? 1 : 0).sort((left, right) => {
          const result = String(left[column] ?? '').localeCompare(String(right[column] ?? ''), undefined, { numeric: true, sensitivity: 'base' })
          return descending ? -result : result
        })
        rows = [...header, ...body]
      } else if (operation.includes('filter-data') || operation === 'filter') {
        const column = promptNumber('Column number to filter (0 for any column):', 0, 0) - 1
        const query = window.prompt('Keep rows containing:', '') ?? ''
        const hasHeader = window.confirm('Treat the first row as a header?')
        const header = hasHeader ? rows.slice(0, 1) : []
        const body = rows.slice(hasHeader ? 1 : 0).filter((row) => (column < 0 ? row : [row[column]]).some((cell) => String(cell ?? '').toLowerCase().includes(query.toLowerCase())))
        rows = [...header, ...body]
      } else if (operation.includes('remove-duplicates')) {
        const hasHeader = window.confirm('Treat the first row as a header?')
        const header = hasHeader ? rows.slice(0, 1) : []
        const seen = new Set<string>()
        rows = [...header, ...rows.slice(hasHeader ? 1 : 0).filter((row) => {
          const key = JSON.stringify(row)
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })]
      } else if (operation.includes('add-rows') || operation.includes('delete-rows')) {
        const count = promptNumber('How many rows?', 1)
        const index = promptNumber('Row number to start at:', operation.includes('add-rows') ? rows.length + 1 : 1) - 1
        if (operation.includes('add-rows')) rows.splice(Math.min(index, rows.length), 0, ...Array.from({ length: count }, () => []))
        else rows.splice(index, count)
      } else if (operation.includes('add-columns') || operation.includes('delete-columns')) {
        const count = promptNumber('How many columns?', 1)
        const index = promptNumber('Column number to start at:', operation.includes('add-columns') ? 1 : 1) - 1
        const width = Math.max(0, ...rows.map((row) => row.length))
        rows = rows.map((row) => {
          const padded = [...row, ...Array(Math.max(0, width - row.length)).fill('')]
          if (operation.includes('add-columns')) padded.splice(Math.min(index, width), 0, ...Array(count).fill(''))
          else padded.splice(index, count)
          return padded
        })
      } else if (operation.includes('add-sheet')) {
        const nextSheetName = uniqueSheetName(workbook, window.prompt('New sheet name:', `Sheet${workbook.SheetNames.length + 1}`) ?? '')
        workbook.SheetNames.push(nextSheetName)
        workbook.Sheets[nextSheetName] = XLSX.utils.aoa_to_sheet(rows)
      } else if (operation.includes('duplicate-sheet')) {
        const sourceName = window.prompt(`Sheet to duplicate (${workbook.SheetNames.join(', ')}):`, workbook.SheetNames[0]) ?? workbook.SheetNames[0]
        if (!workbook.Sheets[sourceName]) throw new Error('That sheet does not exist.')
        const nextSheetName = uniqueSheetName(workbook, window.prompt('New sheet name:', `${sourceName} copy`) ?? '')
        workbook.SheetNames.push(nextSheetName)
        workbook.Sheets[nextSheetName] = XLSX.utils.aoa_to_sheet(sheetRows(workbook, sourceName))
      }

      if (operation.includes('xlsx-to-json') || operation.includes('csv-to-json')) {
        const json = JSON.stringify(rows, null, 2)
        setResult({ url: URL.createObjectURL(new Blob([json], { type: 'application/json' })), name: 'fluxtools.json' })
        return
      }
      if (operation.includes('xlsx-to-html')) {
        const html = XLSX.utils.sheet_to_html(XLSX.utils.aoa_to_sheet(rows))
        setResult({ url: URL.createObjectURL(new Blob([html], { type: 'text/html' })), name: 'fluxtools.html' })
        return
      }
      if (operation.includes('csv-to-xlsx') || operation.includes('json-to-xlsx') || operation.includes('html-to-xlsx') || operation.includes('convert-spreadsheet')) {
        const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        setResult({ url: URL.createObjectURL(new Blob([output], { type: 'application/octet-stream' })), name: 'fluxtools.xlsx' })
        return
      }
      if (operation.includes('xlsx-to-csv') || operation.includes('json-to-csv') || operation.includes('html-to-csv')) {
        const output = XLSX.write(workbookFromRows(rows), { bookType: 'csv', type: 'array' })
        setResult({ url: URL.createObjectURL(new Blob([output], { type: 'text/csv' })), name: 'fluxtools.csv' })
        return
      }

      if (operation.includes('edit-spreadsheet') || operation.includes('find-and-replace') || operation.includes('sort-data') || operation === 'sort' || operation.includes('filter-data') || operation === 'filter' || operation.includes('remove-duplicates') || operation.includes('add-rows') || operation.includes('delete-rows') || operation.includes('add-columns') || operation.includes('delete-columns')) {
        workbook.Sheets[workbook.SheetNames[0]] = XLSX.utils.aoa_to_sheet(rows)
        setText(rowsToText(rows))
      }

      const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      setResult({ url: URL.createObjectURL(new Blob([output], { type: 'application/octet-stream' })), name: 'fluxtools.xlsx' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'This file could not be processed locally.')
    }
  }

  const archiveMode = operation.includes('zip') || operation.includes('archive')
  const multiFileArchive = operation.includes('create') || operation.includes('add-files') || operation.includes('replace-files')
  return <div className="mx-auto max-w-2xl px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Local data tool</p><h1 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1><p className="mt-2 text-ink-muted">Process spreadsheet and archive files locally in your browser.</p><p className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">Processed locally</p><div className="mt-8"><FileDropzone accept={archiveMode ? '.zip' : '.csv,.xlsx,.xls,.json,.html,.htm'} hint={archiveMode ? 'ZIP files or files to archive' : 'CSV, XLSX, XLS, JSON, or HTML tables'} multiple={multiFileArchive} onFile={(file) => setFiles([file])} onFiles={setFiles} /></div>{files.length > 0 && <div className="mt-5 space-y-4"><p className="text-sm text-ink-muted">{files.length} file{files.length === 1 ? '' : 's'} selected</p>{text && <textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-64 w-full rounded-xl border border-line bg-page p-4 font-mono text-sm text-ink" />}{error && <p className="text-sm text-mark">{error}</p>}<div className="flex gap-3"><button type="button" onClick={process} className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-page hover:bg-accent-hover">Process locally</button>{result && <a href={result.url} download={result.name} className="rounded-lg border border-line px-4 py-2.5 text-sm text-ink">Download</a>}</div></div>}</div>
}

function uniqueSheetName(workbook: XLSX.WorkBook, requested: string) {
  const base = requested.trim() || `Sheet${workbook.SheetNames.length + 1}`
  let name = base
  let suffix = 2
  while (workbook.SheetNames.includes(name)) name = `${base} ${suffix++}`
  return name
}
