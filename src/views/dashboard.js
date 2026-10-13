import { store } from '../lib/store.js'
import { market } from '../lib/market.js'
import { summarize, valueSeries } from '../lib/portfolio.js'
import { money, moneyCompact, percent, signedMoney, number, tone, escapeHtml } from '../lib/format.js'
import { makeChart, palette, gradient } from '../ui/charts.js'
import { sparkline } from '../ui/sparkline.js'
import { openTrade, openDetail } from '../ui/trade.js'
import { $, icon, preserveFocus } from '../ui/dom.js'

function kpi(label, value, sub, cls = '') {
  return `<article class="card kpi"><h3>${label}</h3><div class="kpi-value ${cls}">${value}</div><div class="kpi-sub">${sub}</div></article>`
}

export default {
  title: 'Dashboard',
  mount(root) {
    const p = palette()
    root.innerHTML = `
      <div class="page-head">
        <div><h1>Hello, ${escapeHtml(store.user.name.split(' ')[0])} 👋</h1><p class="muted">Here's how your portfolio is doing today.</p></div>
        <a class="btn primary" href="#/market">${icon('market')} Explore market</a>
      </div>
      <div class="kpis"></div>
      <div class="grid-2-1">
        <article class="card">
          <div class="card-head">
            <h2>Performance</h2>
            <div class="seg small" role="radiogroup" aria-label="Range">
              ${['1M', '3M', '6M'].map((r, i) => `<label><input type="radio" name="range" value="${r}" ${i === 1 ? 'checked' : ''}><span>${r}</span></label>`).join('')}
            </div>
          </div>
          <div class="chart-box tall"><canvas data-perf></canvas></div>
        </article>
        <article class="card">
          <div class="card-head"><h2>Allocation</h2></div>
          <div class="chart-box tall"><canvas data-alloc></canvas></div>
        </article>
      </div>
      <div class="grid-2-1">
        <article class="card">
          <div class="card-head"><h2>Holdings</h2><span class="muted" data-count></span></div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>Stock</th><th class="num">Qty</th><th class="num">Avg</th><th class="num">LTP</th><th class="num">Value</th><th class="num">P&amp;L</th><th></th></tr></thead>
            <tbody data-holdings></tbody>
          </table></div>
        </article>
        <article class="card">
          <div class="card-head"><h2>Watchlist</h2><a class="muted" href="#/market">Manage</a></div>
          <ul class="watch" data-watch></ul>
          <div class="card-head"><h2>Top movers</h2></div>
          <ul class="watch" data-movers></ul>
        </article>
      </div>`

    const days = { '1M': 22, '3M': 66, '6M': Infinity }
    let range = '3M'
    const slice = (arr) => arr.slice(-Math.min(days[range], arr.length))

    const perf = makeChart($('[data-perf]', root), {
      type: 'line',
      data: { labels: [], datasets: [
        { label: 'Holdings value', data: [], borderColor: p.accent, backgroundColor: (c) => gradient(c, p.accent), fill: true, pointRadius: 0, borderWidth: 2, tension: 0.3 },
        { label: 'Invested', data: [], borderColor: p.text, borderDash: [5, 4], pointRadius: 0, borderWidth: 1.25 },
      ] },
      options: {
        interaction: { mode: 'index', intersect: false },
        plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${money(c.parsed.y)}` } } },
        scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } }, y: { ticks: { callback: (v) => moneyCompact(v) } } },
      },
    })
    const alloc = makeChart($('[data-alloc]', root), {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, hoverOffset: 6 }] },
      options: {
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${money(c.parsed)}` } },
        },
      },
    })

    const prev = new Map()
    const update = () => {
      const u = store.user
      const s = summarize(u, market)
      $('.kpis', root).innerHTML =
        kpi('Net worth', money(s.netWorth), `Cash ${money(s.cash)}`) +
        kpi('Holdings value', money(s.value), `Invested ${money(s.invested)}`) +
        kpi('Total P&amp;L', signedMoney(s.pnl), percent(s.pnlPct), tone(s.pnl)) +
        kpi("Today's P&amp;L", signedMoney(s.dayPnl), percent(s.dayPnlPct), tone(s.dayPnl))

      const series = valueSeries(u.holdings, market)
      perf.data.labels = slice(market.dates)
      perf.data.datasets[0].data = slice(series)
      perf.data.datasets[1].data = slice(series).map(() => s.invested)
      perf.update('none')

      const rows = [...s.rows].sort((a, b) => b.value - a.value)
      const labels = rows.map((r) => r.symbol)
      const data = rows.map((r) => r.value)
      if (s.cash > 0) { labels.push('Cash'); data.push(s.cash) }
      alloc.data.labels = labels
      alloc.data.datasets[0].data = data
      alloc.data.datasets[0].backgroundColor = labels.map((l, i) => (l === 'Cash' ? p.grid : p.series[i % p.series.length]))
      alloc.update('none')

      $('[data-count]', root).textContent = `${rows.length} position${rows.length === 1 ? '' : 's'}`
      $('[data-holdings]', root).innerHTML = rows.length
        ? rows.map((r) => {
          const last = prev.get(r.symbol)
          const flash = last == null || last === r.price ? '' : r.price > last ? 'flash-up' : 'flash-down'
          prev.set(r.symbol, r.price)
          return `<tr>
            <td><button class="link" data-detail="${r.symbol}"><b>${r.symbol}</b></button><div class="muted tiny">${escapeHtml(r.name)}</div></td>
            <td class="num">${number(r.qty)}</td>
            <td class="num">${money(r.avgPrice)}</td>
            <td class="num ${flash}">${money(r.price)}</td>
            <td class="num">${money(r.value)}</td>
            <td class="num ${tone(r.pnl)}">${signedMoney(r.pnl)}<div class="tiny">${percent(r.pnlPct)}</div></td>
            <td class="row-actions"><button class="btn xs primary" data-buy="${r.symbol}">Buy</button><button class="btn xs danger" data-sell="${r.symbol}">Sell</button></td>
          </tr>`
        }).join('')
        : `<tr><td colspan="7" class="empty">No holdings yet — <a href="#/market">buy your first stock</a>.</td></tr>`

      const item = (sym) => {
        const q = market.get(sym)
        const ch = market.change(sym)
        return `<li><button class="watch-row" data-detail="${sym}">
          <span><b>${sym}</b><small class="muted">${escapeHtml(q.sector)}</small></span>
          ${sparkline(q.history.slice(-30), { width: 80, height: 28 })}
          <span class="num"><span>${money(q.price)}</span><small class="${tone(ch.abs)}">${percent(ch.pct)}</small></span>
        </button></li>`
      }
      $('[data-watch]', root).innerHTML = u.watchlist.length ? u.watchlist.map(item).join('') : '<li class="empty">Star stocks in the market to watch them.</li>'
      const movers = market.all().map((q) => [q.symbol, Math.abs(market.change(q.symbol).pct)]).sort((a, b) => b[1] - a[1]).slice(0, 4)
      $('[data-movers]', root).innerHTML = movers.map(([sym]) => item(sym)).join('')
    }

    root.addEventListener('change', (e) => {
      if (e.target.name === 'range') { range = e.target.value; update() }
    })
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-detail],[data-buy],[data-sell]')
      if (!t) return
      if (t.dataset.detail) openDetail(t.dataset.detail)
      else if (t.dataset.buy) openTrade(t.dataset.buy, 'buy')
      else openTrade(t.dataset.sell, 'sell')
    })
    update()
    return { update: () => preserveFocus(root, update) }
  },
}
