import { store } from '../lib/store.js'
import { market } from '../lib/market.js'
import { money, percent, quantity, tone, escapeHtml } from '../lib/format.js'
import { sparkline } from '../ui/sparkline.js'
import { createPriceChart, rangeControl } from '../ui/price-chart.js'
import { openTrade, openDetail, toggleWatch, unitLabel } from '../ui/trade.js'
import { $, icon, preserveFocus } from '../ui/dom.js'

const COPY = {
  commodity: {
    title: 'Commodities',
    blurb: 'MCX-style futures contracts at indicative rupee prices · simulated',
    featured: 'GOLD',
  },
  crypto: {
    title: 'Crypto',
    blurb: 'Top coins priced in rupees · trades 24/7 · change is over 24 hours',
    featured: 'BTC',
  },
}

function feedBadge(kind) {
  if (kind !== 'crypto') return '<span class="badge">Simulated</span>'
  const s = market.feeds.crypto
  if (s === 'live') return '<span class="badge up"><i class="live-dot"></i>Live · Binance</span>'
  if (s === 'connecting') return '<span class="badge">Connecting to Binance…</span>'
  return '<span class="badge down" title="Binance could not be reached, so prices are simulated">Offline · simulated</span>'
}

// Page for a small asset class: a large live chart of the selected
// instrument above a grid of every instrument in the class.
export function liveMarketView(kind) {
  const copy = COPY[kind]
  return {
    title: copy.title,
    mount(root) {
      const assets = market.byKind(kind)
      let selected = copy.featured
      let range = 'Live'
      root.innerHTML = `
        <div class="page-head">
          <div><h1>${copy.title}</h1><p class="muted">${copy.blurb}</p></div>
          <div data-feed></div>
        </div>
        <article class="card featured">
          <div class="featured-head">
            <div>
              <div class="featured-name" data-f-name></div>
              <div class="featured-price"><span class="big" data-f-price></span><span data-f-change></span></div>
            </div>
            <div class="actions">
              <button class="btn ghost" data-f-detail>Details</button>
              <button class="btn danger" data-f-sell>Sell</button>
              <button class="btn primary" data-f-buy>Buy</button>
            </div>
          </div>
          <div class="chart-toolbar">${rangeControl(`${kind}-range`)}<span class="muted tiny" data-f-meta></span></div>
          <div class="chart-box tall"><canvas data-f-chart></canvas></div>
        </article>
        <div class="stock-grid" data-grid></div>`

      const chart = createPriceChart($('[data-f-chart]', root))

      const update = () => {
        const u = store.user
        const q = market.get(selected)
        const ch = market.change(selected)
        const held = u.holdings.find((h) => h.symbol === selected)
        $('[data-feed]', root).innerHTML = feedBadge(kind)
        $('[data-f-name]', root).innerHTML = `<b>${escapeHtml(q.name)}</b> <span class="muted">${escapeHtml(q.symbol)}${kind === 'commodity' ? ` · per ${escapeHtml(q.unit)}` : ''}</span>`
        $('[data-f-price]', root).textContent = money(q.price)
        $('[data-f-change]', root).innerHTML = `<span class="${tone(ch.abs)}">${ch.abs >= 0 ? '▲' : '▼'} ${percent(ch.pct)}</span>`
        $('[data-f-meta]', root).textContent = `High ${money(q.high)} · Low ${money(q.low)}${held ? ` · You hold ${quantity(held.qty)} ${unitLabel(q, held.qty)}` : ''}`
        $('[data-f-sell]', root).hidden = !held
        chart.render(q, range)

        $('[data-grid]', root).innerHTML = assets.map((a) => {
          const c = market.change(a.symbol)
          const watched = u.watchlist.includes(a.symbol)
          const h = u.holdings.find((x) => x.symbol === a.symbol)
          return `<article class="card stock ${a.symbol === selected ? 'selected' : ''}">
            <header>
              <button class="link" data-select="${a.symbol}" aria-pressed="${a.symbol === selected}"><b>${escapeHtml(a.symbol)}</b><span class="muted">${escapeHtml(a.name)}</span></button>
              <button class="icon-btn star ${watched ? 'on' : ''}" data-star="${a.symbol}" aria-pressed="${watched}" aria-label="${watched ? 'Remove from' : 'Add to'} watchlist">${icon('star')}</button>
            </header>
            <div class="stock-mid">
              <div><div class="price">${money(a.price)}</div><div class="${tone(c.abs)} tiny">${percent(c.pct)} ${kind === 'crypto' ? '24h' : 'today'}</div></div>
              ${sparkline(a.intraday.length > 10 ? a.intraday.map((x) => x.p) : a.history.slice(-30))}
            </div>
            <footer>
              <span class="badge">${escapeHtml(kind === 'commodity' ? `${a.industry} · ${a.unit}` : a.industry)}</span>
              ${h ? `<span class="badge accent">${quantity(h.qty)} held</span>` : ''}
              <span class="spacer"></span>
              <button class="btn xs primary" data-buy="${a.symbol}">Buy</button>
              ${h ? `<button class="btn xs danger" data-sell="${a.symbol}">Sell</button>` : ''}
            </footer>
          </article>`
        }).join('')
      }

      root.addEventListener('change', (e) => {
        if (e.target.name === `${kind}-range`) { range = e.target.value; update() }
      })
      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-select],[data-buy],[data-sell],[data-star],[data-f-buy],[data-f-sell],[data-f-detail]')
        if (!t) return
        const d = t.dataset
        if (d.select) {
          selected = d.select
          update()
          $('.featured', root).scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        } else if (d.buy) openTrade(d.buy, 'buy')
        else if (d.sell) openTrade(d.sell, 'sell')
        else if (d.star) toggleWatch(d.star)
        else if ('fBuy' in d) openTrade(selected, 'buy')
        else if ('fSell' in d) openTrade(selected, 'sell')
        else if ('fDetail' in d) openDetail(selected)
      })
      update()
      return { update: () => preserveFocus(root, update) }
    },
  }
}
