import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

export interface PdfSettings {
  page?: number
  angle?: number
  text?: string
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
}

export async function loadPdf(file: File) {
  return PDFDocument.load(await file.arrayBuffer())
}

export async function savePdf(document: PDFDocument) {
  return document.save()
}

export function selectedPageIndex(document: PDFDocument, page = 1) {
  return Math.max(0, Math.min(document.getPageCount() - 1, page - 1))
}

export async function mergePdfs(files: File[]) {
  const output = await PDFDocument.create()
  for (const file of files) {
    const source = await loadPdf(file)
    const pages = await output.copyPages(source, source.getPageIndices())
    pages.forEach((page) => output.addPage(page))
  }
  return savePdf(output)
}

export async function transformPdf(file: File, operation: string, settings: PdfSettings = {}) {
  const source = await loadPdf(file)
  const pageIndex = selectedPageIndex(source, settings.page)
  const output = PDFDocument.create()

  if (operation.includes('metadata') || operation.includes('title') || operation.includes('author') || operation.includes('subject') || operation.includes('keywords')) {
    if (operation.includes('remove') || operation.includes('strip')) {
      source.setTitle('')
      source.setAuthor('')
      source.setSubject('')
      source.setKeywords([])
      source.setCreator('')
      source.setProducer('')
    } else {
      if (settings.title || operation.includes('title')) source.setTitle(settings.title ?? 'FluxTools document')
      if (settings.author || operation.includes('author')) source.setAuthor(settings.author ?? 'FluxTools')
      if (settings.subject || operation.includes('subject')) source.setSubject(settings.subject ?? 'Processed locally')
      if (settings.keywords || operation.includes('keywords')) source.setKeywords(settings.keywords ?? ['FluxTools', 'local'])
    }
    return savePdf(source)
  }

  if (operation.includes('rotate')) {
    source.getPages().forEach((page) => page.setRotation(degrees(settings.angle ?? 90)))
    return savePdf(source)
  }

  if (operation.includes('delete')) {
    source.removePage(pageIndex)
    return savePdf(source)
  }

  if (operation.includes('duplicate')) {
    const pages = await output.then((document) => document.copyPages(source, [pageIndex]))
    output.then((document) => pages.forEach((page) => document.addPage(page)))
    const rest = await output.then((document) => document.copyPages(source, source.getPageIndices().filter((index) => index !== pageIndex)))
    output.then((document) => rest.forEach((page) => document.addPage(page)))
    return savePdf(await output)
  }

  if (operation.includes('reverse')) {
    const pages = await output.then((document) => document.copyPages(source, [...source.getPageIndices()].reverse()))
    output.then((document) => pages.forEach((page) => document.addPage(page)))
    return savePdf(await output)
  }

  if (operation.includes('blank')) {
    const pages = await output.then((document) => document.copyPages(source, source.getPageIndices()))
    output.then((document) => pages.forEach((page) => document.addPage(page)))
    output.then((document) => document.addPage())
    return savePdf(await output)
  }

  if (operation.includes('reorder') || operation.includes('extract') || operation.includes('split')) {
    const indices = operation.includes('reorder') ? [pageIndex, ...source.getPageIndices().filter((index) => index !== pageIndex)] : [pageIndex]
    const pages = await output.then((document) => document.copyPages(source, indices))
    output.then((document) => pages.forEach((page) => document.addPage(page)))
    return savePdf(await output)
  }

  const font = await source.embedFont(StandardFonts.Helvetica)
  source.getPages().forEach((page, index) => {
    const { width, height } = page.getSize()
    const isWatermark = operation.includes('watermark')
    const label = settings.text ?? (operation.includes('page-number') ? `${index + 1}` : isWatermark ? 'FluxTools' : 'Processed locally')
    page.drawText(label, {
      x: isWatermark ? width / 2 - 30 : 36,
      y: operation.includes('header') ? height - 36 : 24,
      size: isWatermark ? 28 : 12,
      font,
      color: rgb(0.25, 0.45, 0.8),
      opacity: isWatermark ? 0.28 : 0.9,
    })
  })
  return savePdf(source)
}