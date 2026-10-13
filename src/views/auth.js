import { store } from '../lib/store.js'
import { market } from '../lib/market.js'
import { applyTrade } from '../lib/portfolio.js'
import { money, percent, tone } from '../lib/format.js'
import { STARTING_BALANCE } from '../data/stocks.js'
import { $, icon } from '../ui/dom.js'

// Demo account starts with a handful of positions bought at historical prices.
function seedDemo(user) {
  const buys = [
    ['TCS', 15, 140], ['HDFCBANK', 40, 120], ['RELIANCE', 20, 100], ['INFY', 30, 90],
    ['ITC', 120, 75], ['SUNPHARMA', 25, 60], ['TATAMOTORS', 45, 45], ['BHARTIARTL', 20, 30],
  ]
  const len = market.dates.length
  for (const [symbol, qty, daysAgo] of buys) {
    const price = market.get(symbol).history[len - 1 - daysAgo]
    user = applyTrade(user, { symbol, side: 'buy', qty, price })
    user.transactions[0].ts = Date.now() - daysAgo * 86400000
  }
  return user
}

export default {
  title: 'Sign in',
  mount(root) {
    let mode = 'login'
    const tickerHtml = () => market.all().slice(0, 12).map((s) => {
      const ch = market.change(s.symbol)
      return `<span><b>${s.symbol}</b> ${money(s.price)} <i class="${tone(ch.abs)}">${percent(ch.pct)}</i></span>`
    }).join('')

    root.innerHTML = `
      <div class="auth">
        <section class="auth-hero">
          <div class="brand lg">${icon('logo')} StockVault</div>
          <h1>Practice investing<br>without the risk.</h1>
          <p>Start with ${money(STARTING_BALANCE)} in virtual cash, trade a live-simulated Indian equity market, and see your portfolio through rich analytics.</p>
          <ul class="bullets">
            <li>${icon('pulse')} Live price simulation with technical indicators</li>
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
          <p class="muted tiny">Accounts live only in this browser's storage.</p>
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
