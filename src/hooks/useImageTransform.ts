import { useCallback, useEffect, useRef, useState } from 'react'
import type { TransformRequest, TransformResponse } from '@/types'

type Status = 'idle' | 'working' | 'done' | 'error'

interface TransformResult {
  blob: Blob
  width: number
  height: number
  url: string
}

export function useImageTransform() {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<TransformResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const urlRef = useRef<string | null>(null)

  // Always terminate any in-flight worker and revoke the last object URL on unmount.
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  const run = useCallback((params: TransformRequest) => {
    workerRef.current?.terminate()
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }

    setStatus('working')
    setError(null)
    setResult(null)

    const worker = new Worker(new URL('../workers/imageTransform.worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<TransformResponse>) => {
      const data = event.data
      if (data.ok) {
        const url = URL.createObjectURL(data.blob)
        urlRef.current = url
        setResult({ blob: data.blob, width: data.width, height: data.height, url })
        setStatus('done')
      } else {
        setError(data.error)
        setStatus('error')
      }
      worker.terminate()
    }

    worker.onerror = () => {
      setError('Something went wrong while processing that file.')
      setStatus('error')
      worker.terminate()
    }

    worker.postMessage(params)
  }, [])

  const reset = useCallback(() => {
    workerRef.current?.terminate()
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, run, reset }
}
