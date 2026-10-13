import { store } from '../lib/store.js'
import { market } from '../lib/market.js'
import { applyTrade } from '../lib/portfolio.js'
import { money, percent, tone } from '../lib/format.js'
import { STARTING_BALANCE } from '../data/assets.js'
import { $, icon } from '../ui/dom.js'
import { isNativeApp, RELEASES_URL } from '../ui/install.js'

// Demo account starts with a handful of positions bought at historical prices.
function seedDemo(user) {
  const buys = [
    ['TCS', 15, 140], ['HDFCBANK', 40, 120], ['RELIANCE', 20, 100], ['INFY', 30, 90],
    ['ITC', 120, 75], ['SUNPHARMA', 25, 60], ['TATAMOTORS', 45, 45], ['BHARTIARTL', 20, 30],
    ['GOLDM', 2, 80], ['SILVERM', 1, 50], ['BTC', 0.003, 70], ['ETH', 0.05, 40],
  ]
  const len = market.dates.length
  for (const [symbol, qty, daysAgo] of buys) {
    const price = market.get(symbol).history[len - 1 - daysAgo]
    try {
      user = applyTrade(user, { symbol, side: 'buy', qty, price, step: market.get(symbol).step })
      user.transactions[0].ts = Date.now() - daysAgo * 86400000
    } catch {
      /* live crypto prices can make a position unaffordable; skip it */
    }
  }
  return user
}

export default {
  title: 'Sign in',
  mount(root) {
    let mode = 'login'
    const TICKER = ['RELIANCE', 'TCS', 'HDFCBANK', 'BTC', 'GOLD', 'INFY', 'ICICIBANK', 'ETH', 'SILVER', 'SBIN', 'CRUDEOIL', 'SOL', 'ITC', 'BHARTIARTL']
    const tickerHtml = () => TICKER.map((sym) => market.get(sym)).map((s) => {
      const ch = market.change(s.symbol)
      return `<span><b>${s.symbol}</b> ${money(s.price)} <i class="${tone(ch.abs)}">${percent(ch.pct)}</i></span>`
    }).join('')

    root.innerHTML = `
      <div class="auth">
        <section class="auth-hero">
          <div class="brand lg">${icon('logo')} StockVault</div>
          <h1>Practice investing<br>without the risk.</h1>
          <p>Start with ${money(STARTING_BALANCE)} in virtual cash. Trade ${market.byKind('stock').length.toLocaleString('en-IN')} NSE stocks, MCX commodities and live-priced crypto, and see your portfolio through rich analytics.</p>
          <ul class="bullets">
            <li>${icon('pulse')} Live charts with SMA and RSI indicators</li>
            <li>${icon('coins')} Real-time crypto prices from Binance</li>
            <li>${icon('analytics')} Risk metrics: volatility, Sharpe, drawdown</li>
            <li>${icon('bell')} Price alerts &amp; watchlists</li>
            <li>${icon('command')} Command palette — press <kbd>Ctrl</kbd> <kbd>K</kbd></li>
          </ul>
          <div class="ticker" aria-hidden="true"><div class="ticker-track"></div></div>
        </section>
        <section class="auth-card card">
          <div class="seg" role="tablist">
            <label><input type="radio" name="mode" value="login" checked><span>Sign in</span></label>
            <label><input type="radio" name="mode" value="register"><span>Create account</span></label>
          </div>
          <form novalidate>
            <label class="field" data-name hidden>Full name<input name="name" autocomplete="name"></label>
            <label class="field">Email<input name="email" type="email" autocomplete="email" required></label>
            <label class="field">Password<input name="password" type="password" autocomplete="current-password" minlength="6" required></label>
            <p class="form-error" role="alert"></p>
            <button class="btn primary block" type="submit">Sign in</button>
          </form>
          <div class="divider"><span>or</span></div>
          <button class="btn ghost block" data-demo>Try the demo account</button>
          <p class="muted tiny">Accounts live only on this device.</p>
          ${isNativeApp ? '' : `<a class="get-apps center" href="${RELEASES_URL}" target="_blank" rel="noopener">${icon('download')} Get the Android &amp; desktop apps</a>`}
        </section>
      </div>`

    const form = $('form', root)
    const err = $('.form-error', root)
    const setTicker = () => {
      const html = tickerHtml()
      $('.ticker-track', root).innerHTML = html + html
    }
    setTicker()

    root.addEventListener('change', (e) => {
      if (e.target.name !== 'mode') return
      mode = e.target.value
      $('[data-name]', root).hidden = mode === 'login'
      form.password.autocomplete = mode === 'login' ? 'current-password' : 'new-password'
      $('[type=submit]', form).textContent = mode === 'login' ? 'Sign in' : 'Create account'
      err.textContent = ''
    })
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      err.textContent = ''
      const data = Object.fromEntries(new FormData(form))
      try {
        if (mode === 'login') await store.login(data)
        else await store.register(data)
      } catch (ex) {
        err.textContent = ex.message
      }
    })
    $('[data-demo]', root).addEventListener('click', () => store.loginDemo(seedDemo))
    return { update: setTicker }
  },
}
