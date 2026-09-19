/// <reference lib="webworker" />

// Shared by every image tool: decode -> draw at target size -> re-encode.
// Runs off the main thread so the UI never locks up, even on large files.

import type { TransformRequest, TransformResponse } from '@/types'

self.onmessage = async (event: MessageEvent<TransformRequest>) => {
  const { file, operation = 'resize', width, height, format, quality, amount = 0 } = event.data

  try {
    const bitmap = await createImageBitmap(file)
    const isQuarterTurn = operation === 'rotate'
    const isCrop = operation === 'crop'
    const targetWidth = width ?? (isQuarterTurn ? bitmap.height : isCrop ? Math.min(bitmap.width, bitmap.height) : bitmap.width)
    const targetHeight = height ?? (isQuarterTurn ? bitmap.width : isCrop ? Math.min(bitmap.width, bitmap.height) : bitmap.height)

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

    ctx.save()
    if (operation === 'rotate') {
      ctx.translate(targetWidth, 0)
      ctx.rotate(Math.PI / 2)
    } else if (operation === 'flip-horizontal') {
      ctx.translate(targetWidth, 0)
      ctx.scale(-1, 1)
    } else if (operation === 'flip-vertical') {
      ctx.translate(0, targetHeight)
      ctx.scale(1, -1)
    }
    if (operation === 'grayscale') ctx.filter = 'grayscale(1)'
    if (operation === 'brightness') ctx.filter = `brightness(${1 + amount / 100})`
    if (operation === 'contrast') ctx.filter = `contrast(${1 + amount / 100})`
    if (operation === 'sepia') ctx.filter = 'sepia(1)'
    if (operation === 'invert') ctx.filter = 'invert(1)'
    if (operation === 'blur') ctx.filter = `blur(${Math.max(1, amount)}px)`
    if (operation === 'saturation') ctx.filter = `saturate(${Math.max(0, 1 + amount / 100)})`
    if (operation === 'hue') ctx.filter = `hue-rotate(${amount}deg)`
    if (operation === 'vintage') ctx.filter = 'sepia(0.35) saturate(0.8) contrast(1.1)'
    if (operation === 'vignette') ctx.filter = 'contrast(1.08) brightness(0.92)'
    if (operation === 'pixelate') ctx.imageSmoothingEnabled = false
    const sourceX = isCrop ? Math.floor((bitmap.width - targetWidth) / 2) : 0
    const sourceY = isCrop ? Math.floor((bitmap.height - targetHeight) / 2) : 0
    const sourceWidth = isCrop ? targetWidth : bitmap.width
    const sourceHeight = isCrop ? targetHeight : bitmap.height
    ctx.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight)
    ctx.restore()
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
