import type { FileCategory, OperationMeta } from '@/types'

export const FILE_CATEGORIES: { id: FileCategory; label: string; description: string }[] = [
  { id: 'pdf', label: 'PDF', description: 'Pages, documents, and scans' },
  { id: 'image', label: 'Images', description: 'Photos, graphics, and designs' },
  { id: 'video', label: 'Video', description: 'Clips and recordings' },
  { id: 'audio', label: 'Audio', description: 'Music, voice, and sound' },
  { id: 'document', label: 'Documents', description: 'Word and rich text files' },
  { id: 'spreadsheet', label: 'Spreadsheets', description: 'Tables and workbooks' },
  { id: 'text', label: 'Text', description: 'Plain text and code' },
  { id: 'archive', label: 'Archives', description: 'Compressed file bundles' },
]

export const operations: OperationMeta[] = [
  { id: 'compress-image', name: 'Compress image', description: 'Reduce file size while keeping quality.', category: 'Compress', family: 'image', quick: true, path: 'compress-image' },
  { id: 'resize-image', name: 'Resize image', description: 'Set exact dimensions or scale proportionally.', category: 'Edit & Adjust', family: 'image', quick: true, path: 'resize-image' },
  { id: 'convert-image', name: 'Convert format', description: 'Switch between JPG, PNG, and WebP.', category: 'Convert', family: 'image', quick: true },
  { id: 'remove-background', name: 'Remove background', description: 'Create a clean cutout from an image.', category: 'Background', family: 'image', quick: true },
  { id: 'enhance-image', name: 'Enhance image', description: 'Improve clarity, color, and visual detail.', category: 'Enhance', family: 'image' },
  { id: 'crop-image', name: 'Crop image', description: 'Trim an image to the area you need.', category: 'Edit & Adjust', family: 'image' },
  { id: 'watermark-image', name: 'Add watermark', description: 'Place a text or image watermark.', category: 'Edit & Adjust', family: 'image' },
  { id: 'image-metadata', name: 'Edit metadata', description: 'Review and clean embedded image data.', category: 'Metadata', family: 'image' },
  { id: 'compress-pdf', name: 'Compress PDF', description: 'Reduce document size for sharing.', category: 'Compress', family: 'pdf', quick: true },
  { id: 'merge-pdf', name: 'Merge PDFs', description: 'Combine documents in the order you choose.', category: 'Organize', family: 'pdf', quick: true },
  { id: 'split-pdf', name: 'Split PDF', description: 'Extract selected pages into new files.', category: 'Pages', family: 'pdf', quick: true },
  { id: 'pdf-to-images', name: 'Convert to images', description: 'Export pages as separate image files.', category: 'Convert', family: 'pdf', quick: true },
  { id: 'ocr-pdf', name: 'OCR scanned PDF', description: 'Make scanned text searchable and selectable.', category: 'OCR', family: 'pdf', quick: true },
  { id: 'sign-pdf', name: 'Sign PDF', description: 'Add a signature to your document.', category: 'Security', family: 'pdf', quick: true },
  { id: 'rotate-pdf', name: 'Rotate pages', description: 'Fix pages that landed sideways.', category: 'Pages', family: 'pdf' },
  { id: 'remove-blank-pages', name: 'Remove blank pages', description: 'Clean empty pages from a document.', category: 'Pages', family: 'pdf' },
  { id: 'watermark-pdf', name: 'Watermark PDF', description: 'Add a visible mark to every page.', category: 'Annotate', family: 'pdf' },
  { id: 'protect-pdf', name: 'Password protect', description: 'Secure a PDF with a password.', category: 'Security', family: 'pdf' },
  { id: 'clean-scan', name: 'Clean scan', description: 'Improve contrast and remove scan noise.', category: 'AI', family: 'pdf' },
  { id: 'trim-video', name: 'Trim video', description: 'Keep only the clip you need.', category: 'Edit', family: 'video', quick: true },
  { id: 'compress-video', name: 'Compress video', description: 'Make a video easier to share.', category: 'Compress', family: 'video', quick: true },
  { id: 'convert-video', name: 'Convert video', description: 'Export to a different video format.', category: 'Convert', family: 'video', quick: true },
  { id: 'extract-audio', name: 'Extract audio', description: 'Save the audio track from a video.', category: 'Audio', family: 'video', quick: true },
  { id: 'compress-audio', name: 'Compress audio', description: 'Reduce audio size for easy sharing.', category: 'Compress', family: 'audio', quick: true },
  { id: 'convert-document', name: 'Convert document', description: 'Export to PDF or another document format.', category: 'Convert', family: 'document', quick: true },
  { id: 'compress-archive', name: 'Compress archive', description: 'Create a smaller archive bundle.', category: 'Compress', family: 'archive', quick: true },
]

export function getOperationsFor(family: FileCategory | null) {
  return family ? operations.filter((operation) => operation.family === family) : []
}

export function getQuickOperationsFor(family: FileCategory | null) {
  return getOperationsFor(family).filter((operation) => operation.quick)
}
