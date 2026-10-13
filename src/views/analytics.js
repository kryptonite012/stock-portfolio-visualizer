import { store } from '../lib/store.js'
import { market } from '../lib/market.js'
import { summarize, valueSeries, sectorExposure, concentration, diversificationScore } from '../lib/portfolio.js'
import { annualisedVolatility, sharpeRatio, maxDrawdown, returns } from '../lib/indicators.js'
import { money, moneyCompact, percent, ratio, signedMoney, number, tone } from '../lib/format.js'
import { makeChart, palette } from '../ui/charts.js'
import { $ } from '../ui/dom.js'

function meter(label, value, display, hint, invert = false) {
  const pctv = Math.max(0, Math.min(1, value))
  const level = invert ? 1 - pctv : pctv
  const cls = level > 0.66 ? 'good' : level > 0.33 ? 'mid' : 'bad'
  return `<div class="meter">
    <div class="meter-top"><span>${label}</span><b>${display}</b></div>
    <div class="meter-bar ${cls}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pctv * 100)}" aria-label="${label}"><i style="width:${pctv * 100}%"></i></div>
    <small class="muted">${hint}</small>
  </div>`
}

export default {
  title: 'Analytics',
  mount(root) {
    const p = palette()
    root.innerHTML = `
      <div class="page-head"><div><h1>Analytics</h1><p class="muted">Risk, return and diversification for your current holdings.</p></div></div>
      <div class="kpis" data-kpis></div>
      <div class="grid-2">
        <article class="card"><div class="card-head"><h2>Profit &amp; loss by stock</h2></div><div class="chart-box tall"><canvas data-pnl></canvas></div></article>
        <article class="card"><div class="card-head"><h2>Sector exposure</h2></div><div class="chart-box tall"><canvas data-sector></canvas></div></article>
      </div>
      <div class="grid-2">
        <article class="card"><div class="card-head"><h2>Daily returns distribution</h2></div><div class="chart-box tall"><canvas data-dist></canvas></div></article>
        <article class="card"><div class="card-head"><h2>Risk profile</h2></div><div class="meters" data-risk></div></article>
      </div>`

    const pnlChart = makeChart($('[data-pnl]', root), {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'P&L', data: [], backgroundColor: [], borderRadius: 4 }] },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => signedMoney(c.parsed.x) } } },
        scales: { x: { ticks: { callback: (v) => moneyCompact(v) } }, y: { grid: { display: false } } },
      },
    })
    const sectorChart = makeChart($('[data-sector]', root), {
      type: 'polarArea',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] },
      options: {
        plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: (c) => `${c.label}: ${money(c.parsed.r)}` } } },
        scales: { r: { ticks: { display: false } } },
      },
    })
    const distChart = makeChart($('[data-dist]', root), {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Days', data: [], backgroundColor: [], borderRadius: 3 }] },
      options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } } } },
    })

    const update = () => {
      const u = store.user
      const s = summarize(u, market)
      const series = valueSeries(u.holdings, market)
      const has = s.rows.length > 0
      const vol = has ? annualisedVolatility(series) : 0
      const sharpe = has ? sharpeRatio(series) : 0
      const mdd = has ? maxDrawdown(series) : 0
      const sorted = [...s.rows].sort((a, b) => b.pnlPct - a.pnlPct)
      const best = sorted[0]
      const worst = sorted.at(-1)
      const realized = u.transactions.reduce((a, t) => a + (t.realized || 0), 0)

      $('[data-kpis]', root).innerHTML = [
        ['Total return', percent(s.pnlPct), signedMoney(s.pnl), tone(s.pnl)],
        ['Realised P&amp;L', signedMoney(realized), `${u.transactions.filter((t) => t.side === 'sell').length} sells`, tone(realized)],
        ['Best performer', best ? best.symbol : '—', best ? percent(best.pnlPct) : 'No holdings', best ? tone(best.pnlPct) : ''],
        ['Worst performer', worst ? worst.symbol : '—', worst ? percent(worst.pnlPct) : 'No holdings', worst ? tone(worst.pnlPct) : ''],
      ].map(([l, v, sub, cls]) => `<article class="card kpi"><h3>${l}</h3><div class="kpi-value ${cls}">${v}</div><div class="kpi-sub">${sub}</div></article>`).join('')

      const byPnl = [...s.rows].sort((a, b) => b.pnl - a.pnl)
      pnlChart.data.labels = byPnl.map((r) => r.symbol)
      pnlChart.data.datasets[0].data = byPnl.map((r) => r.pnl)
      pnlChart.data.datasets[0].backgroundColor = byPnl.map((r) => (r.pnl >= 0 ? p.up : p.down))
      pnlChart.update('none')

      const sectors = sectorExposure(s.rows)
      sectorChart.data.labels = sectors.map(([k]) => k)
      sectorChart.data.datasets[0].data = sectors.map(([, v]) => v)
      sectorChart.data.datasets[0].backgroundColor = sectors.map((_, i) => p.series[i % p.series.length] + 'cc')
      sectorChart.update('none')

      // Histogram of daily portfolio returns in 0.5% buckets.
      const r = has ? returns(series) : []
      const bins = new Map()
      for (const x of r) {
        const b = Math.max(-4, Math.min(4, Math.round((x * 100) / 0.5) * 0.5))
        bins.set(b, (bins.get(b) || 0) + 1)
      }
      const keys = []
      for (let b = -4; b <= 4; b += 0.5) keys.push(b)
      distChart.data.labels = keys.map((k) => `${k > 0 ? '+' : ''}${k}%`)
      distChart.data.datasets[0].data = keys.map((k) => bins.get(k) || 0)
      distChart.data.datasets[0].backgroundColor = keys.map((k) => (k >= 0 ? p.up : p.down))
      distChart.update('none')

      const hhi = has ? concentration(s.rows) : 0
      const top = s.rows.reduce((m, x) => (x.weight > m.weight ? x : m), { weight: 0, symbol: '—' })
      $('[data-risk]', root).innerHTML = [
        meter('Diversification score', diversificationScore(s.rows) / 100, `${diversificationScore(s.rows)}/100`, 'Blends effective number of positions and sector spread'),
        meter('Concentration (HHI)', hhi, number(hhi), `Largest position: ${top.symbol} at ${ratio(top.weight)}`, true),
        meter('Cash ratio', s.cashRatio, ratio(s.cashRatio), 'Share of net worth held as cash', true),
        meter('Annualised volatility', vol / 0.5, ratio(vol), 'Std-dev of daily returns × √252', true),
        meter('Sharpe ratio', (sharpe + 1) / 4, number(sharpe), 'Excess return per unit of risk (6.5% risk-free)'),
        meter('Max drawdown', mdd / 0.4, ratio(-mdd), 'Worst peak-to-trough fall over 6 months', true),
      ].join('')
    }
    update()
    return { update }
  },
}
