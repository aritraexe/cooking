export type FileCategory =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'spreadsheet'
  | 'text'
  | 'archive'

export type ToolFamily = 'image' | 'pdf'

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
  family: FileCategory
  quick?: boolean
  path?: string
}

export type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png'

export interface TransformRequest {
  file: File
  width?: number
  height?: number
  format: OutputFormat
  quality: number
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
