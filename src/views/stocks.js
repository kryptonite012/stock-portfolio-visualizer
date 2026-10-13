import { store } from '../lib/store.js'
import { market } from '../lib/market.js'
import { STOCK_SECTORS } from '../data/assets.js'
import { money, percent, quantity, tone, escapeHtml } from '../lib/format.js'
import { sparkline } from '../ui/sparkline.js'
import { openTrade, openDetail, toggleWatch } from '../ui/trade.js'
import { $, icon, preserveFocus } from '../ui/dom.js'

const PAGE_SIZE = 25

export default {
  title: 'Stocks',
  mount(root) {
    const stocks = market.byKind('stock')
    const state = { q: '', sector: 'All', sort: 'symbol', filter: 'all', page: 0 }
    root.innerHTML = `
      <div class="page-head">
        <div><h1>Stocks</h1><p class="muted">${stocks.length.toLocaleString('en-IN')} NSE-listed companies · simulated prices update every 3 s</p></div>
      </div>
      <div class="toolbar card">
        <label class="search">${icon('search')}<input id="stock-search" type="search" placeholder="Search ${stocks.length.toLocaleString('en-IN')} stocks by name or symbol" aria-label="Search stocks"></label>
        <select id="stock-sector" aria-label="Sector" data-sector><option value="All">All sectors</option>${STOCK_SECTORS.map((s) => `<option>${escapeHtml(s)}</option>`).join('')}</select>
        <select id="stock-sort" aria-label="Sort by" data-sort>
          <option value="symbol">Symbol A–Z</option>
          <option value="gainers">Top gainers</option>
          <option value="losers">Top losers</option>
          <option value="price-desc">Price high–low</option>
          <option value="price-asc">Price low–high</option>
        </select>
        <div class="seg small" role="radiogroup" aria-label="Show">
          <label><input type="radio" name="show" value="all" checked><span>All</span></label>
          <label><input type="radio" name="show" value="watch"><span>Watchlist</span></label>
          <label><input type="radio" name="show" value="held"><span>Holdings</span></label>
        </div>
      </div>
      <article class="card">
        <div class="table-wrap"><table class="table stocks-table">
          <thead><tr><th></th><th>Company</th><th>Sector</th><th class="num">Price</th><th class="num">Change</th><th>30 days</th><th></th></tr></thead>
          <tbody data-rows></tbody>
        </table></div>
        <nav class="pager" aria-label="Pages">
          <span class="muted tiny" data-range></span>
          <span class="spacer"></span>
          <button class="btn xs ghost" data-page="prev">Previous</button>
          <span class="tiny" data-pageno></span>
          <button class="btn xs ghost" data-page="next">Next</button>
        </nav>
      </article>`

    const pct = (s) => market.change(s.symbol).pct
    const sorters = {
      symbol: (a, b) => a.symbol.localeCompare(b.symbol),
      gainers: (a, b) => pct(b) - pct(a),
      losers: (a, b) => pct(a) - pct(b),
      'price-desc': (a, b) => b.price - a.price,
      'price-asc': (a, b) => a.price - b.price,
    }

    const update = () => {
      const u = store.user
      const held = new Map(u.holdings.map((h) => [h.symbol, h.qty]))
      const list = stocks.filter((s) =>
        (state.sector === 'All' || s.sector === state.sector) &&
        (state.filter !== 'watch' || u.watchlist.includes(s.symbol)) &&
        (state.filter !== 'held' || held.has(s.symbol)) &&
        (!state.q || s.symbol.toLowerCase().includes(state.q) || s.name.toLowerCase().includes(state.q)))
        .sort(sorters[state.sort])
      const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
      state.page = Math.min(state.page, pages - 1)
      const from = state.page * PAGE_SIZE
      const rows = list.slice(from, from + PAGE_SIZE)

      $('[data-rows]', root).innerHTML = rows.length
        ? rows.map((s) => {
          const ch = market.change(s.symbol)
          const watched = u.watchlist.includes(s.symbol)
          const qty = held.get(s.symbol)
          return `<tr>
            <td><button class="icon-btn star ${watched ? 'on' : ''}" data-star="${escapeHtml(s.symbol)}" aria-pressed="${watched}" aria-label="${watched ? 'Remove from' : 'Add to'} watchlist">${icon('star')}</button></td>
            <td class="wrap"><button class="link" data-detail="${escapeHtml(s.symbol)}"><b>${escapeHtml(s.symbol)}</b><span class="muted tiny">${escapeHtml(s.name)}</span></button>${qty ? ` <span class="badge accent">${quantity(qty)} held</span>` : ''}</td>
            <td class="muted tiny wrap">${escapeHtml(s.sector)}</td>
            <td class="num"><b>${money(s.price)}</b></td>
            <td class="num ${tone(ch.abs)}">${percent(ch.pct)}</td>
            <td>${sparkline(s.history.slice(-30), { width: 90, height: 28 })}</td>
            <td class="row-actions"><button class="btn xs primary" data-buy="${escapeHtml(s.symbol)}">Buy</button>${qty ? `<button class="btn xs danger" data-sell="${escapeHtml(s.symbol)}">Sell</button>` : ''}</td>
          </tr>`
        }).join('')
        : '<tr><td colspan="7" class="empty">No stocks match your filters.</td></tr>'
      $('[data-range]', root).textContent = list.length
        ? `Showing ${from + 1}–${from + rows.length} of ${list.length.toLocaleString('en-IN')}`
        : ''
      $('[data-pageno]', root).textContent = `Page ${state.page + 1} of ${pages}`
      $('[data-page="prev"]', root).disabled = state.page === 0
      $('[data-page="next"]', root).disabled = state.page >= pages - 1
    }

    const reset = () => { state.page = 0; update() }
    $('#stock-search', root).addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); reset() })
    $('#stock-sector', root).addEventListener('change', (e) => { state.sector = e.target.value; reset() })
    $('#stock-sort', root).addEventListener('change', (e) => { state.sort = e.target.value; reset() })
    root.addEventListener('change', (e) => { if (e.target.name === 'show') { state.filter = e.target.value; reset() } })
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-detail],[data-buy],[data-sell],[data-star],[data-page]')
      if (!t) return
      if (t.dataset.page) {
        state.page += t.dataset.page === 'next' ? 1 : -1
        update()
        root.querySelector('.stocks-table').scrollIntoView({ block: 'nearest' })
      } else if (t.dataset.detail) openDetail(t.dataset.detail)
      else if (t.dataset.buy) openTrade(t.dataset.buy, 'buy')
      else if (t.dataset.sell) openTrade(t.dataset.sell, 'sell')
      else toggleWatch(t.dataset.star)
    })
    update()
    return { update: () => preserveFocus(root, update) }
  },
}
