export function sparkline(values, { width = 120, height = 36 } = {}) {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values
    .map((v, i) => `${((i / (values.length - 1)) * width).toFixed(1)},${(height - 2 - ((v - min) / span) * (height - 4)).toFixed(1)}`)
    .join(' ')
  const cls = values.at(-1) >= values[0] ? 'up' : 'down'
  return `<svg class="spark ${cls}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/></svg>`
}
