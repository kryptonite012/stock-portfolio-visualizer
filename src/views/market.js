import { store } from '../lib/store.js'
import { market } from '../lib/market.js'
import { SECTORS } from '../data/stocks.js'
import { money, percent, tone, escapeHtml } from '../lib/format.js'
import { sparkline } from '../ui/sparkline.js'
import { openTrade, openDetail, toggleWatch } from '../ui/trade.js'
import { $, icon, preserveFocus } from '../ui/dom.js'

export default {
  title: 'Market',
  mount(root) {
    const state = { q: '', sector: 'All', sort: 'symbol', watchOnly: false }
    root.innerHTML = `
      <div class="page-head">
        <div><h1>Market</h1><p class="muted">${market.all().length} NSE stocks · prices update live</p></div>
      </div>
      <div class="toolbar card">
        <label class="search">${icon('search')}<input type="search" placeholder="Search by name or symbol" aria-label="Search stocks"></label>
        <select aria-label="Sector" data-sector><option>All</option>${SECTORS.map((s) => `<option>${s}</option>`).join('')}</select>
        <select aria-label="Sort by" data-sort>
          <option value="symbol">Symbol A–Z</option>
          <option value="gainers">Top gainers</option>
          <option value="losers">Top losers</option>
          <option value="price">Price high–low</option>
        </select>
        <label class="toggle"><input type="checkbox" data-watchonly> ${icon('star')} Watchlist only</label>
      </div>
      <div class="stock-grid" data-grid></div>`

    const update = () => {
      const u = store.user
      let list = market.all().filter((s) =>
        (state.sector === 'All' || s.sector === state.sector) &&
        (!state.watchOnly || u.watchlist.includes(s.symbol)) &&
        (!state.q || s.symbol.toLowerCase().includes(state.q) || s.name.toLowerCase().includes(state.q)))
      const pct = (s) => market.change(s.symbol).pct
      const sorters = {
        symbol: (a, b) => a.symbol.localeCompare(b.symbol),
        gainers: (a, b) => pct(b) - pct(a),
        losers: (a, b) => pct(a) - pct(b),
        price: (a, b) => b.price - a.price,
      }
      list = list.sort(sorters[state.sort])
      $('[data-grid]', root).innerHTML = list.length
        ? list.map((s) => {
          const ch = market.change(s.symbol)
          const watched = u.watchlist.includes(s.symbol)
          const held = u.holdings.find((h) => h.symbol === s.symbol)
          return `<article class="card stock">
            <header>
              <button class="link" data-detail="${s.symbol}"><b>${s.symbol}</b><span class="muted">${escapeHtml(s.name)}</span></button>
              <button class="icon-btn star ${watched ? 'on' : ''}" data-star="${s.symbol}" aria-pressed="${watched}" aria-label="${watched ? 'Remove from' : 'Add to'} watchlist">${icon('star')}</button>
            </header>
            <div class="stock-mid">
              <div><div class="price">${money(s.price)}</div><div class="${tone(ch.abs)} tiny">${percent(ch.pct)} today</div></div>
              ${sparkline(s.history.slice(-30))}
            </div>
            <footer>
              <span class="badge">${escapeHtml(s.sector)}</span>
              ${held ? `<span class="badge accent">Holding ${held.qty}</span>` : ''}
              <span class="spacer"></span>
              <button class="btn xs primary" data-buy="${s.symbol}">Buy</button>
              ${held ? `<button class="btn xs danger" data-sell="${s.symbol}">Sell</button>` : ''}
            </footer>
          </article>`
        }).join('')
        : '<p class="empty card">No stocks match your filters.</p>'
    }

    $('input[type=search]', root).addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); update() })
    $('[data-sector]', root).addEventListener('change', (e) => { state.sector = e.target.value; update() })
    $('[data-sort]', root).addEventListener('change', (e) => { state.sort = e.target.value; update() })
    $('[data-watchonly]', root).addEventListener('change', (e) => { state.watchOnly = e.target.checked; update() })
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-detail],[data-buy],[data-sell],[data-star]')
      if (!t) return
      if (t.dataset.detail) openDetail(t.dataset.detail)
      else if (t.dataset.buy) openTrade(t.dataset.buy, 'buy')
      else if (t.dataset.sell) openTrade(t.dataset.sell, 'sell')
      else toggleWatch(t.dataset.star)
    })
    update()
    return { update: () => preserveFocus(root, update) }
  },
}
