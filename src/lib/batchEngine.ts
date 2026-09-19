export async function processBatch<T, R>(items: T[], worker: (item: T, index: number) => Promise<R>, onProgress?: (completed: number, total: number) => void, concurrency = 2) {
  const results = Array.from<R>({ length: items.length })
  let nextIndex = 0
  let completed = 0

  async function consume() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await worker(items[index], index)
      completed += 1
      onProgress?.(completed, items.length)
    }
  }

  await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), items.length) }, consume))
  return results
}