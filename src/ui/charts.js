import {
  Chart,
  LineController,
  BarController,
  DoughnutController,
  PolarAreaController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  LinearScale,
  CategoryScale,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(
  LineController, BarController, DoughnutController, PolarAreaController,
  LineElement, BarElement, ArcElement, PointElement,
  LinearScale, CategoryScale, RadialLinearScale, Filler, Tooltip, Legend,
)

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

export function palette() {
  return {
    text: css('--text-2'),
    grid: css('--grid'),
    up: css('--up'),
    down: css('--down'),
    accent: css('--accent'),
    series: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => css(`--c${i}`)),
  }
}

export function applyChartDefaults() {
  const p = palette()
  Chart.defaults.color = p.text
  Chart.defaults.borderColor = p.grid
  Chart.defaults.font.family = css('--sans')
  Chart.defaults.plugins.legend.labels.usePointStyle = true
  Chart.defaults.plugins.legend.labels.boxWidth = 8
  Chart.defaults.plugins.tooltip.cornerRadius = 8
  Chart.defaults.plugins.tooltip.padding = 10
  Chart.defaults.animation.duration = 400
  Chart.defaults.maintainAspectRatio = false
}

// Charts registry so views can destroy them on navigation.
const live = new Set()

export function makeChart(canvas, config, { track = true } = {}) {
  const c = new Chart(canvas, config)
  if (track) live.add(c)
  return c
}

export function destroyCharts() {
  for (const c of live) c.destroy()
  live.clear()
}

export function gradient(ctx, color) {
  const { chartArea } = ctx.chart
  if (!chartArea) return color
  const g = ctx.chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  g.addColorStop(0, color + '55')
  g.addColorStop(1, color + '00')
  return g
}
