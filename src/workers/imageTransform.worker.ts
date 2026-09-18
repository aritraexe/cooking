/// <reference lib="webworker" />

// Shared by every image tool: decode -> draw at target size -> re-encode.
// Runs off the main thread so the UI never locks up, even on large files.

import type { TransformRequest, TransformResponse } from '@/types'

self.onmessage = async (event: MessageEvent<TransformRequest>) => {
  const { file, width, height, format, quality } = event.data

  try {
    const bitmap = await createImageBitmap(file)
    const targetWidth = width ?? bitmap.width
    const targetHeight = height ?? bitmap.height

    const canvas = new OffscreenCanvas(targetWidth, targetHeight)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('This browser cannot draw to an off-screen canvas.')

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Flatten transparency onto white when encoding to JPEG, which has no alpha channel.
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, targetWidth, targetHeight)
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
    bitmap.close()

    const blob = await canvas.convertToBlob({ type: format, quality })

    const response: TransformResponse = { ok: true, blob, width: targetWidth, height: targetHeight }
    self.postMessage(response)
  } catch (err) {
    const response: TransformResponse = {
      ok: false,
      error: err instanceof Error ? err.message : 'Something went wrong while processing that file.',
    }
    self.postMessage(response)
  }
}
