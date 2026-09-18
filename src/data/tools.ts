import type { ToolMeta } from '@/types'

export const tools: ToolMeta[] = [
  // Image — live
  {
    id: 'compress-image',
    name: 'Compress Image',
    description: 'Shrink JPG, PNG, or WebP files down without losing much quality.',
    family: 'image',
    group: 'Optimize',
    path: 'compress-image',
    status: 'active',
  },
  {
    id: 'resize-image',
    name: 'Resize Image',
    description: 'Change dimensions by exact pixels, keeping the aspect ratio if you want.',
    family: 'image',
    group: 'Optimize',
    path: 'resize-image',
    status: 'active',
  },
  // Image — planned
  {
    id: 'convert-image',
    name: 'Convert Format',
    description: 'Switch between JPG, PNG, and WebP.',
    family: 'image',
    group: 'Convert',
    path: '',
    status: 'soon',
  },
  {
    id: 'crop-image',
    name: 'Crop Image',
    description: 'Cut an image down to exactly the area you need.',
    family: 'image',
    group: 'Edit',
    path: '',
    status: 'soon',
  },
  {
    id: 'remove-background',
    name: 'Remove Background',
    description: 'Cut out the subject and drop the background automatically.',
    family: 'image',
    group: 'Edit',
    path: '',
    status: 'soon',
  },
  // PDF — planned
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into a single file, in the order you want.',
    family: 'pdf',
    group: 'Organize',
    path: '',
    status: 'soon',
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Pull specific pages out into their own file.',
    family: 'pdf',
    group: 'Organize',
    path: '',
    status: 'soon',
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce file size so it is easier to share or upload.',
    family: 'pdf',
    group: 'Optimize',
    path: '',
    status: 'soon',
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Export every page of a PDF as a separate image.',
    family: 'pdf',
    group: 'Convert',
    path: '',
    status: 'soon',
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Combine a batch of photos or scans into one PDF.',
    family: 'pdf',
    group: 'Convert',
    path: '',
    status: 'soon',
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Fix pages that landed sideways or upside down.',
    family: 'pdf',
    group: 'Edit',
    path: '',
    status: 'soon',
  },
]

export function getActiveToolsFor(family: 'image' | 'pdf'): ToolMeta[] {
  return tools.filter((t) => t.family === family && t.status === 'active')
}
