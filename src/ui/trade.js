import { market } from '../lib/market.js'
import { store } from '../lib/store.js'
import { applyTrade, roundQty } from '../lib/portfolio.js'
import { rsi } from '../lib/indicators.js'
import { money, percent, ratio, number, quantity, tone, escapeHtml } from '../lib/format.js'
import { openModal } from './modal.js'
import { toast } from './toast.js'
import { makeChart, palette } from './charts.js'
import { createPriceChart, rangeControl } from './price-chart.js'
import { $, icon } from './dom.js'

const KIND_LABEL = { stock: 'NSE', commodity: 'MCX', crypto: 'Crypto' }

export function unitLabel(q, n = 2) {
  if (q.kind === 'stock') return n === 1 ? 'share' : 'shares'
  if (q.kind === 'crypto') return q.symbol
  return n === 1 ? `lot of ${q.unit}` : `lots of ${q.unit}`
}

export function openTrade(symbol, side = 'buy') {
  const q = market.get(symbol)
  const held = () => store.user.holdings.find((h) => h.symbol === symbol)?.qty ?? 0
  const crypto = q.kind === 'crypto'
  // Crypto is bought by rupee amount; shares and lots by count.
  const chips = crypto
    ? [['₹1,000', 'amt:1000'], ['₹5,000', 'amt:5000'], ['₹25,000', 'amt:25000'], ['Max', 'max']]
    : [['1', '1'], ['5', '5'], ['10', '10'], ['Max', 'max']]
  const dlg = openModal({
    title: `${side === 'buy' ? 'Buy' : 'Sell'} ${escapeHtml(symbol)}`,
    body: `
      <form class="trade" novalidate>
        <div class="seg" role="radiogroup" aria-label="Order side">
          <label><input type="radio" name="side" value="buy" ${side === 'buy' ? 'checked' : ''}><span>Buy</span></label>
          <label><input type="radio" name="side" value="sell" ${side === 'sell' ? 'checked' : ''}><span>Sell</span></label>
        </div>
        <p class="muted">${escapeHtml(q.name)} · <span data-price></span>${q.kind === 'commodity' ? ` per ${escapeHtml(q.unit)}` : ''}${q.live ? ' · <span class="badge up">LIVE</span>' : ''}</p>
        <label class="field">Quantity (${escapeHtml(unitLabel(q))})
          <input id="trade-qty" name="qty" type="number" inputmode="decimal" min="${q.step}" step="${q.step}" value="${crypto ? '' : 1}" placeholder="${crypto ? '0.001' : ''}" required>
        </label>
        <div class="quick">${chips.map(([l, v]) => `<button type="button" class="chip" data-q="${v}">${l}</button>`).join('')}</div>
        <dl class="kv">
          <dt>Estimated total</dt><dd data-total></dd>
          <dt>Available cash</dt><dd>${money(store.user.balance)}</dd>
          <dt>Held</dt><dd>${quantity(held())} ${escapeHtml(unitLabel(q, held()))}</dd>
        </dl>
        <p class="form-error" role="alert"></p>
        <button class="btn primary block" type="submit">Place order</button>
      </form>`,
    onClose: () => unsub(),
  })
  const form = $('form', dlg)
  const refresh = () => {
    const qty = roundQty(Number(form.qty.value) || 0, q.step)
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
    const v = b.dataset.q
    let qty
    if (v === 'max') qty = form.side.value === 'buy' ? store.user.balance / q.price : held()
    else if (v.startsWith('amt:')) qty = Number(v.slice(4)) / q.price
    else qty = Number(v)
    form.qty.value = roundQty(qty, q.step)
    refresh()
  })
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    try {
      const trade = { symbol, side: form.side.value, qty: Number(form.qty.value), price: q.price, step: q.step }
      store.update((u) => applyTrade(u, trade))
      const done = store.user.transactions[0]
      const what = q.kind === 'crypto'
        ? `${quantity(done.qty)} ${symbol}`
        : `${quantity(done.qty)} ${q.kind === 'stock' ? unitLabel(q, done.qty) : done.qty === 1 ? 'lot' : 'lots'} of ${symbol}`
      toast(`${trade.side === 'buy' ? 'Bought' : 'Sold'} ${what} @ ${money(done.price)}`, { tone: 'success' })
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
  const held = () => store.user.holdings.find((h) => h.symbol === symbol)
  const dlg = openModal({
    title: `${escapeHtml(q.name)} <small class="muted">${escapeHtml(symbol)} · ${KIND_LABEL[q.kind]} · ${escapeHtml(q.industry || q.sector)}</small>`,
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
      <div class="chart-toolbar">${rangeControl('range')}<span class="muted tiny" data-feed></span></div>
      <div class="chart-box tall"><canvas data-price-chart></canvas></div>
      <div class="chart-box short" data-rsi-box hidden><canvas data-rsi-chart></canvas></div>
      <dl class="kv grid4">
        <dt>Open</dt><dd>${money(q.open)}</dd>
        <dt>${q.kind === 'crypto' ? '24h open' : 'Prev close'}</dt><dd data-prev></dd>
        <dt>Day high</dt><dd data-high></dd>
        <dt>Day low</dt><dd data-low></dd>
        <dt>6M high</dt><dd data-hi6></dd>
        <dt>6M low</dt><dd data-lo6></dd>
        <dt>${q.kind === 'commodity' ? 'Contract unit' : 'Volatility'}</dt><dd>${q.kind === 'commodity' ? escapeHtml(q.unit) : ratio(q.vol)}</dd>
        <dt>RSI (14)</dt><dd data-rsi></dd>
        <dt>Held</dt><dd data-held></dd>
        <dt>Sector</dt><dd>${escapeHtml(q.sector)}</dd>
      </dl>`,
    onClose: () => {
      unsub()
      price.chart.destroy()
      rsiChart.destroy()
    },
  })

  const p = palette()
  let range = 'Live'
  const price = createPriceChart($('[data-price-chart]', dlg), { track: false })
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
    $('[data-change]', dlg).innerHTML = `<span class="${tone(ch.abs)}">${ch.abs >= 0 ? '▲' : '▼'} ${money(Math.abs(ch.abs))} (${percent(ch.pct)}) ${q.kind === 'crypto' ? '24h' : 'today'}</span>`
    $('[data-prev]', dlg).textContent = money(q.prevClose)
    $('[data-high]', dlg).textContent = money(q.high)
    $('[data-low]', dlg).textContent = money(q.low)
    $('[data-hi6]', dlg).textContent = money(Math.max(...q.history))
    $('[data-lo6]', dlg).textContent = money(Math.min(...q.history))
    const h = held()
    $('[data-held]', dlg).textContent = h ? `${quantity(h.qty)} ${unitLabel(q, h.qty)}` : '—'
    $('[data-feed]', dlg).textContent = q.live ? 'Live price from Binance' : q.kind === 'crypto' ? 'Simulated (live feed offline)' : 'Simulated price'
    $('[data-watch] span', dlg).textContent = watched() ? 'Watching' : 'Watch'
    $('[data-watch]', dlg).classList.toggle('on', watched())
    const r = rsi(q.history)
    $('[data-rsi]', dlg).textContent = number(r.at(-1))
    price.render(q, range)
    const daily = range !== 'Live'
    $('[data-rsi-box]', dlg).hidden = !daily
    if (daily) {
      const n = price.chart.data.labels.length
      rsiChart.data.labels = price.chart.data.labels
      rsiChart.data.datasets[0].data = r.slice(-n)
      rsiChart.update('none')
    }
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
          <input name="target" type="number" step="any" min="0" value="${q.price >= 1 ? (q.price * 1.02).toFixed(2) : (q.price * 1.02).toPrecision(4)}" required>
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
    if (!market.has(a.symbol)) return false
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
