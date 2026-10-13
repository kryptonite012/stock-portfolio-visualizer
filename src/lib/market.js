import { STOCKS } from '../data/stocks.js'
import { mulberry32, hashString, gaussian } from './random.js'

const HISTORY_DAYS = 180
const DT = 1 / 252

// Geometric Brownian motion step.
function step(price, drift, vol, z, dt = DT) {
  return price * Math.exp((drift - 0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * z)
}

function buildHistory(stock) {
  // Seed by symbol + date so history is stable within a day but evolves daily.
  const today = new Date().toISOString().slice(0, 10)
  const rand = mulberry32(hashString(stock.symbol + today))
  // Walk backwards from the reference price so the series ends near it.
  const back = [stock.price]
  for (let i = 1; i < HISTORY_DAYS; i++) {
    back.push(step(back[i - 1], -stock.drift, stock.vol, gaussian(rand)))
  }
  return back.reverse().map((p) => Math.round(p * 100) / 100)
}

function historyDates() {
  const dates = []
  const d = new Date()
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    dates.push(x.toISOString().slice(0, 10))
  }
  return dates
}

/**
 * Simulated live market. Holds daily history per symbol plus an intraday
 * live price that random-walks on every tick. Subscribers get notified after
 * each tick with the set of symbols whose prices changed.
 */
export class Market {
  constructor(stocks = STOCKS) {
    this.stocks = stocks
    this.dates = historyDates()
    this.rand = Math.random
    this.quotes = new Map()
    this.listeners = new Set()
    this.timer = null
    for (const s of stocks) {
      const history = buildHistory(s)
      const prevClose = history[history.length - 2]
      const open = history[history.length - 1]
      this.quotes.set(s.symbol, {
        ...s,
        history,
        prevClose,
        open,
        price: open,
        high: open,
        low: open,
        intraday: [open],
      })
    }
  }

  get(symbol) {
    return this.quotes.get(symbol)
  }

  all() {
    return [...this.quotes.values()]
  }

  change(symbol) {
    const q = this.get(symbol)
    const abs = q.price - q.prevClose
    return { abs, pct: abs / q.prevClose }
  }

  tick() {
    for (const q of this.quotes.values()) {
      // Intraday ticks use a much smaller dt so moves stay realistic.
      const next = step(q.price, q.drift, q.vol, gaussian(this.rand), DT / 60)
      q.price = Math.round(next * 100) / 100
      q.high = Math.max(q.high, q.price)
      q.low = Math.min(q.low, q.price)
      q.intraday.push(q.price)
      if (q.intraday.length > 120) q.intraday.shift()
      q.history[q.history.length - 1] = q.price
    }
    for (const fn of this.listeners) fn(this)
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  start(interval = 3000) {
    this.stop()
    this.timer = setInterval(() => {
      if (document.visibilityState === 'visible') this.tick()
    }, interval)
  }

  stop() {
    clearInterval(this.timer)
    this.timer = null
  }
}

export const market = new Market()
