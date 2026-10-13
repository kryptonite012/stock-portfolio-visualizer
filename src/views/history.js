import { store } from '../lib/store.js'
import { market } from '../lib/market.js'
import { summarize } from '../lib/portfolio.js'
import { money, quantity, signedMoney, when, tone, escapeHtml } from '../lib/format.js'
import { toCsv, download } from '../lib/csv.js'
import { toast } from '../ui/toast.js'
import { $, icon } from '../ui/dom.js'

export default {
  title: 'Activity',
  mount(root) {
    let filter = 'all'
    root.innerHTML = `
      <div class="page-head">
        <div><h1>Activity</h1><p class="muted">Orders, price alerts and data export.</p></div>
        <div class="actions">
          <button class="btn ghost" data-export="holdings">${icon('download')} Holdings CSV</button>
          <button class="btn ghost" data-export="tx">${icon('download')} Orders CSV</button>
        </div>
      </div>
      <div class="grid-2-1">
        <article class="card">
          <div class="card-head">
            <h2>Order history</h2>
            <div class="seg small" role="radiogroup" aria-label="Filter">
              ${['all', 'buy', 'sell'].map((f, i) => `<label><input type="radio" name="f" value="${f}" ${i === 0 ? 'checked' : ''}><span>${f[0].toUpperCase() + f.slice(1)}</span></label>`).join('')}
            </div>
          </div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>Date</th><th>Side</th><th>Stock</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Total</th><th class="num">Realised</th></tr></thead>
            <tbody data-tx></tbody>
          </table></div>
        </article>
        <div class="stack">
          <article class="card">
            <div class="card-head"><h2>Active alerts</h2></div>
            <ul class="alerts" data-alerts></ul>
          </article>
          <article class="card danger-zone">
            <div class="card-head"><h2>Reset account</h2></div>
            <p class="muted">Clears holdings, orders and alerts and restores your starting cash.</p>
            <button class="btn danger" data-reset>${icon('refresh')} Reset portfolio</button>
          </article>
        </div>
      </div>`

    const update = () => {
      const u = store.user
      const txs = u.transactions.filter((t) => filter === 'all' || t.side === filter)
      $('[data-tx]', root).innerHTML = txs.length
        ? txs.map((t) => `<tr>
            <td>${when(t.ts)}</td>
            <td><span class="badge ${t.side === 'buy' ? 'up' : 'down'}">${t.side.toUpperCase()}</span></td>
            <td><b>${escapeHtml(t.symbol)}</b></td>
            <td class="num">${quantity(t.qty)}</td>
            <td class="num">${money(t.price)}</td>
            <td class="num">${money(t.total)}</td>
            <td class="num ${tone(t.realized)}">${t.side === 'sell' ? signedMoney(t.realized) : '—'}</td>
          </tr>`).join('')
        : '<tr><td colspan="7" class="empty">No orders yet.</td></tr>'
      $('[data-alerts]', root).innerHTML = u.alerts.length
        ? u.alerts.map((a) => `<li><span><b>${a.symbol}</b> ${a.direction} ${money(a.target)}<small class="muted"> · now ${market.has(a.symbol) ? money(market.get(a.symbol).price) : '—'}</small></span>
            <button class="icon-btn" data-del="${a.id}" aria-label="Delete alert">${icon('trash')}</button></li>`).join('')
        : '<li class="empty">No alerts. Open a stock and tap “Alert”.</li>'
    }

    root.addEventListener('change', (e) => { if (e.target.name === 'f') { filter = e.target.value; update() } })
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-export],[data-del],[data-reset]')
      if (!t) return
      const u = store.user
      const stamp = new Date().toISOString().slice(0, 10)
      if (t.dataset.export === 'holdings') {
        const rows = summarize(u, market).rows
        download(`stockvault-holdings-${stamp}.csv`, toCsv(rows, [
          { label: 'Symbol', value: (r) => r.symbol }, { label: 'Name', value: (r) => r.name },
          { label: 'Sector', value: (r) => r.sector }, { label: 'Type', value: (r) => r.kind }, { label: 'Qty', value: (r) => r.qty },
          { label: 'Avg Price', value: (r) => r.avgPrice }, { label: 'LTP', value: (r) => r.price },
          { label: 'Value', value: (r) => r.value.toFixed(2) }, { label: 'P&L', value: (r) => r.pnl.toFixed(2) },
        ]))
        toast('Holdings exported', { tone: 'success' })
      } else if (t.dataset.export === 'tx') {
        download(`stockvault-orders-${stamp}.csv`, toCsv(u.transactions, [
          { label: 'Date', value: (r) => new Date(r.ts).toISOString() }, { label: 'Side', value: (r) => r.side },
          { label: 'Symbol', value: (r) => r.symbol }, { label: 'Qty', value: (r) => r.qty },
          { label: 'Price', value: (r) => r.price }, { label: 'Total', value: (r) => r.total.toFixed(2) },
          { label: 'Realised', value: (r) => (r.realized || 0).toFixed(2) },
        ]))
        toast('Orders exported', { tone: 'success' })
      } else if (t.dataset.del) {
        store.update((x) => ({ ...x, alerts: x.alerts.filter((a) => a.id !== t.dataset.del) }))
      } else if (t.dataset.reset && confirm('Reset your portfolio? This cannot be undone.')) {
        store.resetAccount()
        toast('Portfolio reset')
      }
    })
    update()
    return { update }
  },
}
