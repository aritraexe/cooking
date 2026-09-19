export type FileCategory =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'spreadsheet'
  | 'text'
  | 'archive'
  | 'utility'

export type ToolFamily = 'image' | 'pdf'

export type ProcessingMode = 'LOCAL' | 'LOCAL_HEAVY' | 'LOCAL_AI' | 'COMING_SOON_BACKEND'
export type OperationStatus = 'AVAILABLE' | 'COMING_SOON_BACKEND' | 'LOCAL_NOT_IMPLEMENTED'

export type ToolStatus = 'active' | 'soon'

export interface ToolMeta {
  id: string
  name: string
  description: string
  family: ToolFamily
  /** Sub-grouping shown as a section heading, e.g. "Optimize", "Convert" */
  group: string
  /** Route path, relative to /tools/. Empty for not-yet-built tools. */
  path: string
  status: ToolStatus
}

export interface OperationMeta {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  family: FileCategory
  quick?: boolean
  popular?: boolean
  supportsBatch: boolean
  supportsWorkflow: boolean
  settings: string[]
  processingMode: ProcessingMode
  available: boolean
  previewSupport: boolean
  processor: string
  status: OperationStatus
  path?: string
}

export type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png'

export type ImageOperation = 'resize' | 'compress' | 'rotate' | 'flip-horizontal' | 'flip-vertical' | 'grayscale' | 'convert' | 'crop' | 'brightness' | 'contrast' | 'sepia' | 'invert' | 'blur' | 'pixelate' | 'saturation' | 'hue' | 'vintage' | 'vignette' | 'sharpen' | 'posterize' | 'grain' | 'edge-detection' | 'transparent'

export interface TransformRequest {
  file: File
  operation?: ImageOperation
  width?: number
  height?: number
  format: OutputFormat
  quality: number
  amount?: number
}

export interface TransformSuccess {
  ok: true
  blob: Blob
  width: number
  height: number
}

export interface TransformFailure {
  ok: false
  error: string
}

export type TransformResponse = TransformSuccess | TransformFailure
