import type { FileCategory, OperationMeta } from '@/types'

export const FILE_CATEGORIES: { id: FileCategory; label: string; description: string }[] = [
  { id: 'pdf', label: 'PDF', description: 'Pages, documents, and scans' },
  { id: 'image', label: 'Images', description: 'Photos, graphics, and designs' },
  { id: 'video', label: 'Video', description: 'Clips and recordings' },
  { id: 'audio', label: 'Audio', description: 'Music, voice, and sound' },
  { id: 'document', label: 'Documents', description: 'Word and rich text files' },
  { id: 'spreadsheet', label: 'Spreadsheets', description: 'Tables and workbooks' },
  { id: 'text', label: 'Text & code', description: 'Plain text and structured data' },
  { id: 'archive', label: 'Archives', description: 'Compressed file bundles' },
  { id: 'utility', label: 'Utilities', description: 'Cross-format file and design tools' },
]

type RegistryBlock = [FileCategory, string, string[]]

const blocks: RegistryBlock[] = [
  ['pdf', 'Quick Actions', ['Compress PDF', 'Merge PDFs', 'Split PDF', 'Extract Pages', 'Convert PDF', 'Rotate Pages', 'Delete Pages', 'Reorder Pages', 'OCR PDF', 'Add Signature', 'Add Watermark', 'Password Protect']],
  ['pdf', 'Edit & Pages', ['Edit PDF text', 'Add text', 'Delete text', 'Change font', 'Change font size', 'Bold', 'Italic', 'Underline', 'Strikethrough', 'Change text color', 'Highlight text', 'Add hyperlinks', 'Remove hyperlinks', 'Add images', 'Replace images', 'Resize images', 'Move images', 'Crop images', 'Draw', 'Freehand drawing', 'Lines', 'Arrows', 'Shapes', 'Add blank page', 'Duplicate page', 'Insert page', 'Replace page', 'Delete page', 'Extract selected pages', 'Reorder pages', 'Reverse page order', 'Rotate pages', 'Crop pages', 'Resize pages', 'Change page size', 'Change orientation', 'Adjust margins', 'Remove blank pages']],
  ['pdf', 'Annotate', ['Highlight', 'Underline', 'Strikethrough', 'Sticky note', 'Comments', 'Text annotation', 'Drawing', 'Shapes', 'Arrows', 'Checkmark', 'Cross', 'Stamp', 'Initials', 'Signature']],
  ['pdf', 'Convert', ['PDF to JPG', 'PDF to PNG', 'PDF to WebP', 'PDF to TIFF', 'PDF to DOCX', 'PDF to XLSX', 'PDF to PPTX', 'PDF to TXT', 'PDF to HTML', 'PDF to Markdown', 'PDF to PDF/A', 'Images to PDF', 'DOCX to PDF', 'XLSX to PDF', 'PPTX to PDF']],
  ['pdf', 'OCR & Scanning', ['OCR scanned PDF', 'Image to text', 'Scanned PDF to searchable PDF', 'OCR selected area', 'OCR entire document', 'Table extraction', 'Form extraction', 'Handwriting OCR', 'Language detection', 'OCR correction', 'Deskew', 'Scan cleanup', 'Remove scan borders', 'Remove scan shadows', 'Noise removal', 'Contrast enhancement', 'Sharpen scanned document', 'Detect page edges']],
  ['pdf', 'Security', ['Password protect', 'Remove password', 'Encrypt PDF', 'Decrypt PDF', 'Restrict printing', 'Restrict copying', 'Restrict editing', 'Set permissions', 'Remove restrictions', 'Digital signature', 'Signature placement']],
  ['pdf', 'Watermark', ['Text watermark', 'Image watermark', 'Logo watermark', 'Tiled watermark']],
  ['pdf', 'Metadata', ['View metadata', 'Edit metadata', 'Remove metadata', 'Add metadata', 'Set title', 'Set author', 'Set subject', 'Set keywords', 'Set creator', 'Set producer', 'Set creation date', 'Set modification date']],
  ['pdf', 'AI', ['Summarize PDF', 'Rewrite PDF text', 'Translate PDF', 'Extract structured data', 'Ask questions about PDF', 'Clean scan']],
  ['image', 'Quick Actions', ['Resize image', 'Crop image', 'Compress image', 'Convert image', 'Rotate image', 'Flip image', 'Remove background', 'Upscale image', 'Enhance image', 'Convert to WebP', 'Make transparent']],
  ['image', 'Edit & Transform', ['Crop', 'Resize', 'Rotate', 'Flip horizontal', 'Flip vertical', 'Straighten', 'Perspective correction', 'Canvas resize', 'Canvas expansion', 'Trim empty space', 'Trim transparent space', 'Change aspect ratio', 'Fit to dimensions', 'Fill dimensions']],
  ['image', 'Color & Adjustment', ['Brightness', 'Contrast', 'Saturation', 'Exposure', 'Temperature', 'Tint', 'Hue', 'Vibrance', 'Gamma', 'Shadows', 'Highlights', 'Blacks', 'Whites', 'Grayscale', 'Sepia', 'Invert colors']],
  ['image', 'Enhance', ['Sharpen', 'Blur', 'Gaussian blur', 'Motion blur', 'Noise reduction', 'Denoise', 'Deblur', 'Upscale', 'AI upscale', 'Image restoration', 'HDR enhancement', 'Face enhancement', 'Detail enhancement']],
  ['image', 'Background', ['Remove background', 'Replace background', 'Transparent background', 'Change background color', 'Add custom background', 'Blur background', 'Background replacement']],
  ['image', 'Object Editing', ['Remove object', 'Remove person', 'Remove text', 'Erase area', 'Clone', 'Heal', 'Fill selected area', 'Generative fill', 'Add object', 'Replace object']],
  ['image', 'Filters & Effects', ['Vintage', 'Film', 'Black & white', 'Duotone', 'Pixelate', 'Posterize', 'Vignette', 'Grain', 'Glow', 'Sketch', 'Cartoon', 'Oil paint', 'Edge detection']],
  ['image', 'Text & Branding', ['Add text', 'Add logo', 'Add watermark', 'Remove watermark', 'Image watermark', 'Text watermark', 'Draw', 'Shapes', 'Arrows']],
  ['image', 'Formats & Output', ['JPG', 'JPEG', 'PNG', 'WebP', 'AVIF', 'GIF', 'BMP', 'TIFF', 'ICO', 'SVG', 'Set quality', 'Lossless compression', 'Lossy compression', 'Set transparency', 'Set color depth', 'Set DPI', 'Set resolution', 'Set bit depth', 'Progressive JPEG']],
  ['image', 'AI', ['Background removal', 'Object removal', 'Generative fill', 'Generative expansion', 'Image restoration', 'AI upscaling', 'Face enhancement', 'Colorization', 'Style transformation', 'Image cleanup']],
  ['video', 'Quick Actions', ['Trim video', 'Cut video', 'Crop video', 'Resize video', 'Compress video', 'Convert video', 'Extract audio', 'Remove audio', 'Add subtitles', 'Add watermark']],
  ['video', 'Editing', ['Trim', 'Cut', 'Split', 'Merge', 'Crop', 'Resize', 'Rotate', 'Flip', 'Stabilize', 'Reverse', 'Freeze frame', 'Change playback speed']],
  ['video', 'Audio', ['Remove audio', 'Extract audio', 'Replace audio', 'Add music', 'Adjust volume', 'Fade in', 'Fade out', 'Normalize', 'Add voiceover', 'Audio track replacement']],
  ['video', 'Adjustments', ['Brightness', 'Contrast', 'Saturation', 'Exposure', 'Temperature', 'Hue', 'Filters', 'Speed', 'Reverse', 'Frame extraction']],
  ['video', 'Subtitles', ['Add subtitles', 'Remove subtitles', 'Generate subtitles', 'Auto captions', 'Edit subtitles', 'Translate subtitles', 'Burn subtitles into video', 'Extract subtitle track', 'Convert subtitle formats']],
  ['video', 'Watermark & Branding', ['Text watermark', 'Image watermark', 'Logo watermark', 'Set watermark position', 'Set watermark size', 'Set watermark opacity', 'Set watermark rotation']],
  ['video', 'Conversion & Compression', ['MP4', 'WebM', 'MOV', 'AVI', 'MKV', 'GIF', 'Reduce video size', 'Target file size', 'Set video resolution', 'Set bitrate', 'Set FPS', 'Set codec', 'Set audio bitrate', 'Set audio codec']],
  ['video', 'AI', ['Auto captions', 'Subtitle translation', 'Scene detection', 'Highlight extraction', 'Video transcription', 'Object removal from video', 'Background removal from video']],
  ['audio', 'Quick Actions', ['Trim audio', 'Cut audio', 'Merge audio', 'Convert audio', 'Compress audio', 'Extract audio', 'Normalize audio', 'Noise removal', 'Volume adjustment']],
  ['audio', 'Editing', ['Trim', 'Cut', 'Split', 'Merge', 'Reverse', 'Change speed', 'Pitch shift', 'Remove silence', 'Fade in', 'Fade out', 'Volume adjustment', 'Normalize']],
  ['audio', 'Enhance', ['Noise reduction', 'Voice enhancement', 'Audio cleanup', 'Equalization', 'Dynamic range processing', 'De-reverb']],
  ['audio', 'Conversion', ['MP3', 'WAV', 'FLAC', 'AAC', 'OGG', 'M4A', 'AIFF', 'Change bitrate', 'Change sample rate', 'Mono to stereo', 'Stereo to mono', 'Channel manipulation', 'Codec selection']],
  ['audio', 'AI', ['Transcription', 'Speaker identification', 'Translation', 'Voice enhancement', 'Noise removal', 'Subtitle generation']],
  ['document', 'Quick Actions', ['Edit document', 'Convert document', 'Compress document', 'Find and replace', 'Merge documents', 'Split document', 'Export PDF']],
  ['document', 'Text', ['Edit text', 'Find and replace', 'Change font', 'Change font size', 'Text color', 'Bold', 'Italic', 'Underline', 'Strikethrough', 'Alignment', 'Line spacing', 'Paragraph spacing', 'Lists', 'Headings']],
  ['document', 'Structure', ['Add pages', 'Delete pages', 'Reorder pages', 'Add images', 'Replace images', 'Resize images', 'Add tables', 'Edit tables', 'Add hyperlinks', 'Headers', 'Footers', 'Page numbers', 'Margins', 'Page size', 'Orientation']],
  ['document', 'Conversion', ['DOCX to PDF', 'PDF to DOCX', 'DOCX to TXT', 'DOCX to HTML', 'DOCX to Markdown', 'DOCX to ODT', 'RTF conversion', 'Compatible document conversion']],
  ['spreadsheet', 'Quick Actions', ['Edit spreadsheet', 'Convert spreadsheet', 'Compress spreadsheet', 'Sort data', 'Filter data', 'Remove duplicates', 'Export PDF', 'Format spreadsheet']],
  ['spreadsheet', 'Cell Operations', ['Edit cells', 'Add rows', 'Delete rows', 'Add columns', 'Delete columns', 'Merge cells', 'Split cells', 'Find and replace', 'Sort', 'Filter', 'Remove duplicates', 'Data validation']],
  ['spreadsheet', 'Formatting', ['Font', 'Font size', 'Text color', 'Cell color', 'Borders', 'Alignment', 'Number format', 'Currency format', 'Percentage format', 'Date format', 'Conditional formatting', 'Column width', 'Row height', 'Freeze panes']],
  ['spreadsheet', 'Sheets & Data', ['Add sheet', 'Delete sheet', 'Rename sheet', 'Reorder sheets', 'Duplicate sheet', 'Hide sheet', 'Unhide sheet', 'Add formulas', 'Edit formulas', 'Remove formulas', 'Convert formulas to values', 'Charts', 'Pivot tables']],
  ['spreadsheet', 'Conversion', ['XLSX to CSV', 'CSV to XLSX', 'XLSX to PDF', 'XLSX to JSON', 'XLSX to HTML', 'XLSX to ODS']],
  ['text', 'Text & Code', ['Edit text', 'Find and replace', 'Sort lines', 'Remove duplicate lines', 'Remove blank lines', 'Trim whitespace', 'Convert case', 'Line numbering', 'Character count', 'Word count', 'Encoding conversion', 'Escape', 'Unescape', 'Encode', 'Decode', 'Compress or minify', 'Syntax validation']],
  ['text', 'JSON', ['Format JSON', 'Beautify JSON', 'Minify JSON', 'Validate JSON', 'JSON to CSV', 'JSON to XML', 'JSON to YAML']],
  ['text', 'HTML', ['Format HTML', 'Beautify HTML', 'Minify HTML', 'Extract text from HTML', 'Remove HTML tags', 'Validate HTML']],
  ['text', 'XML', ['Format XML', 'Beautify XML', 'Minify XML', 'Validate XML', 'XML to JSON', 'XML to CSV']],
  ['archive', 'Operations', ['Create archive', 'Extract archive', 'Add files', 'Remove files', 'Replace files', 'Rename files', 'Move files', 'Compress archive', 'Recompress archive', 'Change compression level', 'Password protect archive', 'Encrypt archive', 'Decrypt archive', 'Create ZIP', 'Extract ZIP', 'Batch archive']],
  ['archive', 'Batch & Metadata', ['Batch rename archive contents', 'View archive metadata', 'Edit archive metadata', 'Remove archive metadata']],
  ['pdf', 'Scanned Documents', ['Deskew scan', 'Rotate scan', 'Crop scan', 'Remove scan borders', 'Remove scan shadows', 'Remove scan background', 'Clean scan noise', 'Improve scan contrast', 'Sharpen scan', 'Detect scan page edges', 'Remove blank scan pages', 'Create searchable PDF']],
  ['pdf', 'Signature & Annotation', ['Draw signature', 'Upload signature', 'Type signature', 'Save reusable signature', 'Add date', 'Add checkmark', 'Add cross', 'Add stamp', 'Comment', 'Text annotation', 'Freehand drawing']],
  ['document', 'Metadata', ['View metadata', 'Edit metadata', 'Remove metadata', 'Set author', 'Set company', 'Set last modified by', 'Set creation date', 'Set revision information']],
  ['utility', 'File Management', ['Rename file', 'Batch rename', 'Change extension', 'Add prefix', 'Add suffix', 'Sequential numbering', 'Date-based naming', 'Find and replace filename', 'Remove special characters', 'Spaces to underscores', 'Spaces to hyphens', 'Lowercase filename', 'Uppercase filename', 'Apply workflow to batch', 'Download results as ZIP']],
  ['utility', 'Metadata', ['View metadata', 'Edit metadata', 'Remove metadata', 'Strip metadata', 'Add metadata', 'View EXIF', 'Remove GPS data', 'Edit camera information', 'Edit copyright', 'Edit software information']],
  ['utility', 'QR & Barcode', ['Generate QR code', 'Decode QR code', 'Scan QR from image', 'Edit QR code', 'Resize QR code', 'Change QR colors', 'Add QR logo', 'Set error correction', 'Generate barcode', 'Decode barcode', 'Batch QR generation', 'Batch barcode generation']],
  ['utility', 'Color & Design', ['Color picker', 'Extract colors from image', 'Generate palette', 'Palette extraction', 'HEX to RGB', 'RGB to HSL', 'RGB to CMYK', 'Gradient generator', 'Gradient editor', 'Contrast checker', 'Color blindness simulation', 'Random palette generator']],
  ['utility', 'AI', ['Summarize document', 'Rewrite text', 'Proofread text', 'Translate document', 'Extract information', 'Categorize document', 'Ask questions about document', 'Generate tables', 'Extract structured data', 'Scene detection', 'Highlight extraction']],
]

const quickNames = new Set(['Compress PDF', 'Merge PDFs', 'Split PDF', 'OCR PDF', 'Add Signature', 'Add Watermark', 'Password Protect', 'Resize image', 'Crop image', 'Compress image', 'Remove background', 'Enhance image', 'Trim video', 'Compress video', 'Convert video', 'Extract audio', 'Trim audio', 'Convert audio', 'Edit document', 'Convert document', 'Edit spreadsheet', 'Convert spreadsheet'])
const popularNames = new Set(['Compress PDF', 'Merge PDFs', 'Split PDF', 'OCR PDF', 'Resize image', 'Compress image', 'Convert image', 'Remove background', 'Convert to WebP', 'Trim video', 'Compress video', 'Extract audio', 'Convert audio', 'Export PDF', 'Find and replace', 'Remove duplicates', 'Format JSON', 'Extract archive', 'Batch rename archive contents'])
const TEXT_LOCAL_NAMES = new Set(['Edit text', 'Find and replace', 'Sort lines', 'Remove duplicate lines', 'Remove blank lines', 'Trim whitespace', 'Convert case', 'Line numbering', 'Character count', 'Word count', 'Format JSON', 'Beautify JSON', 'Minify JSON', 'Format HTML', 'Beautify HTML', 'Minify HTML', 'Extract text from HTML', 'Remove HTML tags', 'Format XML', 'Beautify XML', 'Minify XML', 'Compress or minify', 'Escape', 'Unescape'])
const DATA_LOCAL_NAMES = new Set(['Edit spreadsheet', 'Convert spreadsheet', 'Remove duplicates', 'XLSX to CSV', 'CSV to XLSX', 'Create ZIP', 'Extract ZIP'])
const IMAGE_LOCAL_NAMES = new Set([
  'Crop', 'Resize', 'Rotate', 'Flip horizontal', 'Flip vertical', 'Straighten',
  'Canvas resize', 'Canvas expansion', 'Trim empty space', 'Trim transparent space',
  'Brightness', 'Contrast', 'Exposure', 'Temperature', 'Tint', 'Hue', 'Vibrance',
  'Gamma', 'Shadows', 'Highlights', 'Blacks', 'Whites', 'Grayscale', 'Sepia',
  'Invert colors', 'Sharpen', 'Blur', 'Gaussian blur', 'Motion blur', 'Noise reduction',
  'Denoise', 'Vintage', 'Film', 'Black & white', 'Duotone', 'Pixelate', 'Posterize',
  'Vignette', 'Convert to WebP', 'JPG', 'JPEG', 'PNG', 'WebP', 'BMP', 'GIF', 'AVIF',
  'Set quality', 'Lossless compression', 'Lossy compression', 'Set transparency',
  'Set color depth', 'Set DPI', 'Set resolution', 'Progressive JPEG',
])
const PDF_LOCAL_NAMES = new Set([
  'Delete Pages', 'Duplicate page', 'Reverse page order', 'Add blank page', 'Reorder pages',
  'Add text', 'Add watermark', 'Text watermark', 'Image watermark', 'Logo watermark',
  'Headers', 'Footers', 'Page numbers', 'View metadata', 'Edit metadata', 'Remove metadata',
  'Add metadata', 'Set title', 'Set author', 'Set subject', 'Set keywords',
  'Highlight', 'Underline', 'Strikethrough', 'Text annotation', 'Signature', 'Initials',
  'Add date', 'Add checkmark', 'Add cross', 'Add stamp',
])
const MEDIA_LOCAL_NAMES = new Set(['Trim video', 'Compress video', 'Convert video', 'Extract audio', 'Trim audio', 'Convert audio', 'Compress audio'])
const OCR_LOCAL_NAMES = new Set(['Image to text'])
const DOCUMENT_LOCAL_NAMES = new Set(['Edit document', 'Edit text', 'Find and replace', 'DOCX to TXT'])

// Keep this map aligned with App.tsx: an operation is available only when a real route and processor exist.
export const IMPLEMENTED_PROCESSORS: Record<string, string> = {
  'compress-image': 'compress-image',
  'resize-image': 'resize-image',
  'rotate-image': 'image/rotate',
  'flip-image': 'image/flip',
  'grayscale-image': 'image/grayscale',
  'convert-image': 'image/convert',
  'crop-image': 'image/crop',
  'brightness-image': 'image/brightness',
  'contrast-image': 'image/contrast',
  'sepia-image': 'image/sepia',
  'invert-image': 'image/invert',
  'blur-image': 'image/blur',
  'pixelate-image': 'image/pixelate',
  'saturation-image': 'image/saturation',
  'hue-image': 'image/hue',
  'vintage-image': 'image/vintage',
  'vignette-image': 'image/vignette',
  'merge-pdf': 'pdf/merge',
  'split-pdf': 'pdf/split',
  'extract-pages-pdf': 'pdf/extract',
  'rotate-pages-pdf': 'pdf/rotate',
  'images-to-pdf': 'pdf/images-to-pdf',
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function descriptionFor(name: string, category: string) {
  return `${name} in the ${category.toLowerCase()} workspace.`
}

function processingModeFor(family: FileCategory, category: string) {
  if (category === 'AI') return 'LOCAL_AI' as const
  if (family === 'video' || family === 'audio' || category === 'OCR & Scanning') return 'LOCAL_HEAVY' as const
  return 'LOCAL' as const
}

function buildRegistry(): OperationMeta[] {
  return blocks.flatMap(([family, category, names]) => names.map((name) => {
    const id = `${family}-${slug(name)}-${slug(category)}`
    const operationKey = name === 'Compress image' ? 'compress-image'
      : name === 'Resize image' ? 'resize-image'
        : name === 'Resize' && family === 'image' ? 'resize-image'
        : name === 'Rotate image' ? 'rotate-image'
          : name === 'Rotate' && family === 'image' ? 'rotate-image'
          : name === 'Flip image' ? 'flip-image'
            : (name === 'Flip horizontal' || name === 'Flip vertical') && family === 'image' ? 'flip-image'
            : name === 'Grayscale' ? 'grayscale-image'
              : name === 'Convert image' ? 'convert-image'
                : name === 'Crop image' ? 'crop-image'
                  : name === 'Brightness' ? 'brightness-image'
                    : name === 'Contrast' ? 'contrast-image'
                      : name === 'Sepia' ? 'sepia-image'
                        : name === 'Invert colors' ? 'invert-image'
                          : name === 'Blur' ? 'blur-image'
                            : name === 'Pixelate' ? 'pixelate-image'
                              : name === 'Saturation' ? 'saturation-image'
                                : name === 'Hue' ? 'hue-image'
                                  : name === 'Vintage' ? 'vintage-image'
                                        : name === 'Vignette' ? 'vignette-image'
                                          : name === 'Black & white' ? 'grayscale-image'
                                            : name === 'Convert to WebP' ? 'convert-image'
                : name === 'Merge PDFs' ? 'merge-pdf'
                  : name === 'Split PDF' ? 'split-pdf'
                    : name === 'Extract Pages' ? 'extract-pages-pdf'
                      : name === 'Rotate Pages' ? 'rotate-pages-pdf'
                        : name === 'Images to PDF' ? 'images-to-pdf'
                          : undefined
    const path = operationKey && IMPLEMENTED_PROCESSORS[operationKey]
      ? IMPLEMENTED_PROCESSORS[operationKey]
      : family === 'text' && TEXT_LOCAL_NAMES.has(name)
        ? `text/${slug(name)}`
        : DATA_LOCAL_NAMES.has(name)
          ? `data/${slug(name)}`
          : family === 'pdf' && PDF_LOCAL_NAMES.has(name)
            ? `pdf/${slug(name)}`
          : MEDIA_LOCAL_NAMES.has(name)
            ? `media/${slug(name)}`
          : OCR_LOCAL_NAMES.has(name)
            ? 'ocr'
          : family === 'document' && DOCUMENT_LOCAL_NAMES.has(name)
            ? `document/${slug(name)}`
            : family === 'image' && IMAGE_LOCAL_NAMES.has(name)
              ? `image/${slug(name)}`
        : undefined
    const available = Boolean(path)
    return {
      id,
      name,
      description: descriptionFor(name, category),
      category,
      family,
      quick: quickNames.has(name),
      popular: popularNames.has(name),
      supportsBatch: family !== 'text',
      supportsWorkflow: true,
      settings: ['Input selection', 'Operation settings', 'Output format'],
      processingMode: processingModeFor(family, category),
      available,
      previewSupport: available,
      processor: path ? path : 'unimplemented',
      status: available ? 'AVAILABLE' : 'COMING_SOON',
      ...(path ? { path } : {}),
    }
  }))
}

export const operations = buildRegistry()

export function getOperationsFor(family: FileCategory | null) {
  return family ? operations.filter((operation) => operation.family === family) : []
}

export function getQuickOperationsFor(family: FileCategory | null) {
  return getOperationsFor(family).filter((operation) => operation.quick && operation.available).slice(0, 6)
}

export function getPopularOperationsFor(family: FileCategory | null) {
  return getOperationsFor(family).filter((operation) => operation.popular)
}
