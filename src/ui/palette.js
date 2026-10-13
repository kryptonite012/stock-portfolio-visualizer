import { market } from '../lib/market.js'
import { money, percent, tone, escapeHtml } from '../lib/format.js'
import { openDetail } from './trade.js'
import { icon } from './dom.js'

const POPULAR = ['BTC', 'GOLD', 'RELIANCE', 'TCS', 'HDFCBANK']

// ⌘K / Ctrl+K command palette: jump to pages, open stocks, run actions.
export function setupPalette(commands) {
  const dlg = document.createElement('dialog')
  dlg.className = 'palette'
  dlg.innerHTML = `
    <div class="palette-input">${icon('search')}<input type="search" placeholder="Search stocks, pages, actions…" aria-label="Command search" autocomplete="off"></div>
    <ul role="listbox"></ul>
    <footer><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>Enter</kbd> select · <kbd>Esc</kbd> close</footer>`
  document.body.append(dlg)
  const input = dlg.querySelector('input')
  const list = dlg.querySelector('ul')
  let items = []
  let active = 0

  const build = () => {
    const q = input.value.trim().toLowerCase()
    const cmds = commands().filter((c) => c.label.toLowerCase().includes(q))
    // Rank exact symbol, then symbol prefix, then name/symbol substring.
    const score = (s) => {
      const sym = s.symbol.toLowerCase()
      if (sym === q) return 0
      if (sym.startsWith(q)) return 1
      if (s.name.toLowerCase().startsWith(q)) return 2
      return sym.includes(q) || s.name.toLowerCase().includes(q) ? 3 : -1
    }
    const stocks = (q
      ? market.all().map((s) => [s, score(s)]).filter(([, r]) => r >= 0).sort((a, b) => a[1] - b[1]).slice(0, 8).map(([s]) => s)
      : POPULAR.map((sym) => market.get(sym)))
      .map((s) => {
        const ch = market.change(s.symbol)
        return {
          label: `${s.symbol} — ${s.name}${s.kind === 'stock' ? '' : s.kind === 'crypto' ? ' · Crypto' : ' · Commodity'}`,
          hint: `<span class="${tone(ch.abs)}">${money(s.price)} ${percent(ch.pct)}</span>`,
          run: () => openDetail(s.symbol),
        }
      })
    items = [...cmds, ...stocks]
    active = Math.min(active, Math.max(items.length - 1, 0))
    list.innerHTML = items.length
      ? items.map((it, i) => `<li role="option" data-i="${i}" aria-selected="${i === active}"><span>${escapeHtml(it.label)}</span><small>${it.hint ?? ''}</small></li>`).join('')
      : '<li class="empty">No results</li>'
  }
  const run = (i) => {
    const it = items[i]
    if (!it) return
    dlg.close()
    it.run()
  }

  input.addEventListener('input', () => { active = 0; build() })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { active = (active + 1) % items.length; build(); e.preventDefault() }
    if (e.key === 'ArrowUp') { active = (active - 1 + items.length) % items.length; build(); e.preventDefault() }
    if (e.key === 'Enter') { run(active); e.preventDefault() }
    // Search inputs clear themselves on Escape; close the palette instead.
    if (e.key === 'Escape') { dlg.close(); e.preventDefault() }
  })
  list.addEventListener('click', (e) => {
    const li = e.target.closest('[data-i]')
    if (li) run(Number(li.dataset.i))
  })
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close() })

  const open = () => {
    if (dlg.open) return
    input.value = ''
    active = 0
    build()
    dlg.showModal()
    input.focus()
  }
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      dlg.open ? dlg.close() : open()
    }
  })
  return open
}
