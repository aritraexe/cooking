import type { FileCategory, ProcessingMode } from '@/types'

export interface ProcessorContext {
  files: File[]
  settings: Record<string, unknown>
  signal?: AbortSignal
  reportProgress?: (value: number) => void
}

export interface ProcessorResult {
  files: Blob[]
  names: string[]
  preview?: string
}

export interface LocalProcessor {
  id: string
  fileTypes: FileCategory[]
  processingMode: Exclude<ProcessingMode, 'COMING_SOON_BACKEND'>
  validate: (files: File[], settings: Record<string, unknown>) => string | null
  process: (context: ProcessorContext) => Promise<ProcessorResult>
  cleanup?: () => void
}

export type OperationStatus = 'AVAILABLE' | 'COMING_SOON_BACKEND' | 'LOCAL_NOT_IMPLEMENTED'
