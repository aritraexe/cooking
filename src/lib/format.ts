export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  const decimals = exponent === 0 ? 0 : value < 10 ? 2 : value < 100 ? 1 : 0
  return `${value.toFixed(decimals)} ${units[exponent]}`
}

export function formatPercentChange(originalBytes: number, newBytes: number): string {
  if (originalBytes <= 0) return ''
  const change = ((originalBytes - newBytes) / originalBytes) * 100
  if (change <= 0) return `${Math.abs(change).toFixed(0)}% larger`
  return `${change.toFixed(0)}% smaller`
}
