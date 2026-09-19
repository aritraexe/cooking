import { UploadCloud } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { CornerBrackets } from './CornerBrackets'

interface FileDropzoneProps {
  accept: string
  hint: string
  onFile: (file: File) => void
}

export function FileDropzone({ accept, hint, onFile }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file) onFile(file)
    },
    [onFile],
  )

  return (
    <div
      className={`ff-dropzone relative rounded-2xl border border-dashed p-10 text-center transition-colors sm:p-14 ${
        isDragging ? 'border-accent bg-accent/5' : 'border-line'
      }`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        handleFiles(event.dataTransfer.files)
      }}
    >
      <CornerBrackets active={isDragging} />
      <UploadCloud className="mx-auto h-7 w-7 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
      <p className="mt-4 font-display text-base font-medium text-ink">
        Drag a file here, or{' '}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          browse
        </button>
      </p>
      <p className="mt-1.5 text-sm text-ink-muted">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  )
}
