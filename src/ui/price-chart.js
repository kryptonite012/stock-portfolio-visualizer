import { sma } from '../lib/indicators.js'
import { money } from '../lib/format.js'
import { market } from '../lib/market.js'
import { makeChart, palette, gradient } from './charts.js'

export const RANGES = ['Live', '1M', '3M', '6M']
const DAYS = { '1M': 22, '3M': 66, '6M': Infinity }
const clock = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export function rangeControl(name, selected = 'Live') {
  return `<div class="seg small" role="radiogroup" aria-label="Chart range">
    ${RANGES.map((r) => `<label><input type="radio" name="${name}" value="${r}" ${r === selected ? 'checked' : ''}><span>${r === 'Live' ? '<i class="live-dot"></i>Live' : r}</span></label>`).join('')}
  </div>`
}

/**
 * Line chart for one quote. "Live" plots the intraday tick series and moves
 * with every update; the day ranges plot daily closes with SMA 20/50.
 */
export function createPriceChart(canvas, { track = true } = {}) {
  const p = palette()
  const chart = makeChart(canvas, {
    type: 'line',
    data: { labels: [], datasets: [
      { label: 'Price', data: [], borderColor: p.accent, backgroundColor: (c) => gradient(c, p.accent), fill: true, pointRadius: 0, borderWidth: 2, tension: 0.25 },
      { label: 'SMA 20', data: [], borderColor: p.series[2], pointRadius: 0, borderWidth: 1.5, borderDash: [4, 3] },
      { label: 'SMA 50', data: [], borderColor: p.series[3], pointRadius: 0, borderWidth: 1.5, borderDash: [4, 3] },
    ] },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { filter: (item, data) => data.datasets[item.datasetIndex].data.length > 0 } },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${money(c.parsed.y)}` } },
      },
      scales: {
        x: { ticks: { maxTicksLimit: 6, maxRotation: 0 }, grid: { display: false } },
        y: { ticks: { callback: (v) => money(v) } },
      },
    },
  }, { track })

  return {
    chart,
    render(q, range) {
      const ds = chart.data.datasets
      if (range === 'Live') {
        chart.data.labels = q.intraday.map((x) => clock.format(x.t))
        ds[0].data = q.intraday.map((x) => x.p)
        ds[1].data = []
        ds[2].data = []
        // Colour the live line by direction since the previous close.
        ds[0].borderColor = q.price >= q.prevClose ? p.up : p.down
        ds[0].backgroundColor = (c) => gradient(c, q.price >= q.prevClose ? p.up : p.down)
      } else {
        const n = Math.min(DAYS[range], q.history.length)
        chart.data.labels = market.dates.slice(-n)
        ds[0].data = q.history.slice(-n)
        ds[1].data = sma(q.history, 20).slice(-n)
        ds[2].data = sma(q.history, 50).slice(-n)
        ds[0].borderColor = p.accent
        ds[0].backgroundColor = (c) => gradient(c, p.accent)
      }
      chart.update('none')
    },
  }
}
