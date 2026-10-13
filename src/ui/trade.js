import { market } from '../lib/market.js'
import { store } from '../lib/store.js'
import { applyTrade } from '../lib/portfolio.js'
import { sma, rsi } from '../lib/indicators.js'
import { money, percent, ratio, number, tone, escapeHtml } from '../lib/format.js'
import { openModal } from './modal.js'
import { toast } from './toast.js'
import { makeChart, palette, gradient } from './charts.js'
import { $, icon } from './dom.js'

export function openTrade(symbol, side = 'buy') {
  const q = market.get(symbol)
  const held = () => store.user.holdings.find((h) => h.symbol === symbol)?.qty ?? 0
  const dlg = openModal({
    title: `${side === 'buy' ? 'Buy' : 'Sell'} ${escapeHtml(symbol)}`,
    body: `
      <form class="trade" novalidate>
        <div class="seg" role="radiogroup" aria-label="Order side">
          <label><input type="radio" name="side" value="buy" ${side === 'buy' ? 'checked' : ''}><span>Buy</span></label>
          <label><input type="radio" name="side" value="sell" ${side === 'sell' ? 'checked' : ''}><span>Sell</span></label>
        </div>
        <p class="muted">${escapeHtml(q.name)} · <span data-price></span></p>
        <label class="field">Quantity
          <input name="qty" type="number" inputmode="numeric" min="1" step="1" value="1" required>
        </label>
        <div class="quick">
          <button type="button" class="chip" data-q="1">1</button>
          <button type="button" class="chip" data-q="5">5</button>
          <button type="button" class="chip" data-q="10">10</button>
          <button type="button" class="chip" data-q="max">Max</button>
        </div>
        <dl class="kv">
          <dt>Estimated total</dt><dd data-total></dd>
          <dt>Available cash</dt><dd>${money(store.user.balance)}</dd>
          <dt>Shares held</dt><dd>${held()}</dd>
        </dl>
        <p class="form-error" role="alert"></p>
        <button class="btn primary block" type="submit">Place order</button>
      </form>`,
    onClose: () => unsub(),
  })
  const form = $('form', dlg)
  const refresh = () => {
    const qty = Math.floor(Number(form.qty.value)) || 0
    $('[data-price]', dlg).textContent = money(q.price)
    $('[data-total]', dlg).textContent = money(qty * q.price)
    const s = form.side.value
    $('.modal-head h2', dlg).textContent = `${s === 'buy' ? 'Buy' : 'Sell'} ${symbol}`
    form.querySelector('[type=submit]').className = `btn block ${s === 'buy' ? 'primary' : 'danger'}`
  }
  const unsub = market.subscribe(refresh)
  form.addEventListener('input', refresh)
  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]')
    if (!b) return
    form.qty.value = b.dataset.q === 'max'
      ? (form.side.value === 'buy' ? Math.floor(store.user.balance / q.price) : held())
      : b.dataset.q
    refresh()
  })
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    try {
      const trade = { symbol, side: form.side.value, qty: Number(form.qty.value), price: q.price }
      store.update((u) => applyTrade(u, trade))
      toast(`${trade.side === 'buy' ? 'Bought' : 'Sold'} ${Math.floor(trade.qty)} × ${symbol} @ ${money(q.price)}`, { tone: 'success' })
      dlg.close()
    } catch (err) {
      $('.form-error', dlg).textContent = err.message
    }
  })
  refresh()
  form.qty.select()
}

export function openDetail(symbol) {
  const q = market.get(symbol)
  const watched = () => store.user.watchlist.includes(symbol)
  const dlg = openModal({
    title: `${escapeHtml(q.name)} <small class="muted">${escapeHtml(symbol)} · ${escapeHtml(q.sector)}</small>`,
    wide: true,
    body: `
      <div class="detail-top">
        <div><div class="big" data-price></div><div data-change></div></div>
        <div class="actions">
          <button class="btn ghost" data-watch>${icon('star')}<span></span></button>
          <button class="btn ghost" data-alert>${icon('bell')} Alert</button>
          <button class="btn danger" data-sell>Sell</button>
          <button class="btn primary" data-buy>Buy</button>
        </div>
      </div>
      <div class="seg small" role="radiogroup" aria-label="Range">
        ${['1M', '3M', '6M'].map((r, i) => `<label><input type="radio" name="range" value="${r}" ${i === 2 ? 'checked' : ''}><span>${r}</span></label>`).join('')}
      </div>
      <div class="chart-box tall"><canvas data-price-chart></canvas></div>
      <div class="chart-box short"><canvas data-rsi-chart></canvas></div>
      <dl class="kv grid4">
        <dt>Open</dt><dd>${money(q.open)}</dd>
        <dt>Prev close</dt><dd>${money(q.prevClose)}</dd>
        <dt>Day high</dt><dd data-high></dd>
        <dt>Day low</dt><dd data-low></dd>
        <dt>6M high</dt><dd>${money(Math.max(...q.history))}</dd>
        <dt>6M low</dt><dd>${money(Math.min(...q.history))}</dd>
        <dt>Volatility</dt><dd>${ratio(q.vol)}</dd>
        <dt>RSI (14)</dt><dd data-rsi></dd>
      </dl>`,
    onClose: () => {
      unsub()
      priceChart.destroy()
      rsiChart.destroy()
    },
  })

  const p = palette()
  const days = { '1M': 22, '3M': 66, '6M': Infinity }
  let range = '6M'
  const slice = (arr) => arr.slice(-Math.min(days[range], arr.length))

  const priceChart = makeChart($('[data-price-chart]', dlg), {
    type: 'line',
    data: { labels: [], datasets: [
      { label: 'Price', data: [], borderColor: p.accent, backgroundColor: (c) => gradient(c, p.accent), fill: true, pointRadius: 0, borderWidth: 2, tension: 0.25 },
      { label: 'SMA 20', data: [], borderColor: p.series[2], pointRadius: 0, borderWidth: 1.5, borderDash: [4, 3] },
      { label: 'SMA 50', data: [], borderColor: p.series[3], pointRadius: 0, borderWidth: 1.5, borderDash: [4, 3] },
    ] },
    options: { interaction: { mode: 'index', intersect: false }, scales: { x: { ticks: { maxTicksLimit: 6 }, grid: { display: false } } } },
  }, { track: false })
  const rsiChart = makeChart($('[data-rsi-chart]', dlg), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'RSI 14', data: [], borderColor: p.series[4], pointRadius: 0, borderWidth: 1.5 }] },
    options: {
      plugins: { legend: { display: false } },
      interaction: { mode: 'index', intersect: false },
      scales: { y: { min: 0, max: 100, ticks: { stepSize: 10, callback: (v) => (v === 30 || v === 70 ? v : '') } }, x: { display: false } },
    },
  }, { track: false })

  const render = () => {
    const ch = market.change(symbol)
    $('[data-price]', dlg).textContent = money(q.price)
    $('[data-change]', dlg).innerHTML = `<span class="${tone(ch.abs)}">${ch.abs >= 0 ? '▲' : '▼'} ${number(Math.abs(ch.abs))} (${percent(ch.pct)}) today</span>`
    $('[data-high]', dlg).textContent = money(q.high)
    $('[data-low]', dlg).textContent = money(q.low)
    $('[data-watch] span', dlg).textContent = watched() ? 'Watching' : 'Watch'
    $('[data-watch]', dlg).classList.toggle('on', watched())
    const r = rsi(q.history)
    $('[data-rsi]', dlg).textContent = number(r.at(-1))
    const labels = slice(market.dates)
    priceChart.data.labels = labels
    priceChart.data.datasets[0].data = slice(q.history)
    priceChart.data.datasets[1].data = slice(sma(q.history, 20))
    priceChart.data.datasets[2].data = slice(sma(q.history, 50))
    priceChart.update('none')
    rsiChart.data.labels = labels
    rsiChart.data.datasets[0].data = slice(r)
    rsiChart.update('none')
  }
  const unsub = market.subscribe(render)
  dlg.addEventListener('change', (e) => {
    if (e.target.name === 'range') {
      range = e.target.value
      render()
    }
  })
  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-buy]')) { dlg.close(); openTrade(symbol, 'buy') }
    if (e.target.closest('[data-sell]')) { dlg.close(); openTrade(symbol, 'sell') }
    if (e.target.closest('[data-alert]')) { dlg.close(); openAlert(symbol) }
    if (e.target.closest('[data-watch]')) { toggleWatch(symbol); render() }
  })
  render()
}

export function toggleWatch(symbol) {
  store.update((u) => ({
    ...u,
    watchlist: u.watchlist.includes(symbol) ? u.watchlist.filter((s) => s !== symbol) : [...u.watchlist, symbol],
  }))
}

export function openAlert(symbol) {
  const q = market.get(symbol)
  const dlg = openModal({
    title: `Price alert · ${escapeHtml(symbol)}`,
    body: `
      <form class="trade">
        <p class="muted">Current price ${money(q.price)}. You'll get a notification when the price crosses your target.</p>
        <label class="field">Target price (₹)
          <input name="target" type="number" step="0.05" min="0.05" value="${(q.price * 1.02).toFixed(2)}" required>
        </label>
        <p class="form-error" role="alert"></p>
        <button class="btn primary block" type="submit">${icon('bell')} Create alert</button>
      </form>`,
  })
  $('form', dlg).addEventListener('submit', (e) => {
    e.preventDefault()
    const target = Number(e.target.target.value)
    if (!(target > 0)) {
      $('.form-error', dlg).textContent = 'Enter a valid price'
      return
    }
    const direction = target >= q.price ? 'above' : 'below'
    store.update((u) => ({ ...u, alerts: [...u.alerts, { id: crypto.randomUUID(), symbol, target, direction }] }))
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
    toast(`Alert set: ${symbol} ${direction} ${money(target)}`, { tone: 'success' })
    dlg.close()
  })
}

// Called on every market tick: fires and removes any crossed alerts.
export function checkAlerts() {
  const u = store.user
  if (!u?.alerts.length) return
  const fired = u.alerts.filter((a) => {
    const p = market.get(a.symbol).price
    return a.direction === 'above' ? p >= a.target : p <= a.target
  })
  if (!fired.length) return
  for (const a of fired) {
    const msg = `${a.symbol} is now ${a.direction} ${money(a.target)} (${money(market.get(a.symbol).price)})`
    toast(`🔔 ${msg}`, { tone: 'warn', timeout: 6000 })
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification('StockVault alert', { body: msg })
    }
  }
  const ids = new Set(fired.map((a) => a.id))
  store.update((x) => ({ ...x, alerts: x.alerts.filter((a) => !ids.has(a.id)) }))
}
