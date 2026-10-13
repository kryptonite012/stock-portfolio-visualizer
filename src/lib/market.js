import { ASSETS } from '../data/assets.js'
import { mulberry32, hashString, gaussian } from './random.js'

const HISTORY_DAYS = 180
const INTRADAY_POINTS = 300
const BACKFILL_POINTS = 60
const TICK_MS = 3000
const DT = 1 / 252

// Geometric Brownian motion step.
function step(price, drift, vol, z, dt = DT) {
  return price * Math.exp((drift - 0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * z)
}

// Round to a sensible tick: paise for normal prices, more digits for tiny crypto.
export function roundPrice(p) {
  if (p >= 1) return Math.round(p * 100) / 100
  return Number(p.toPrecision(6))
}

function buildHistory(asset, today) {
  // Seeded by symbol + date so history is stable within a day but evolves daily.
  const rand = mulberry32(hashString(asset.symbol + today))
  // Walk backwards from the reference price so the series ends near it.
  const back = [asset.price]
  for (let i = 1; i < HISTORY_DAYS; i++) {
    back.push(step(back[i - 1], -asset.drift, asset.vol, gaussian(rand)))
  }
  return back.reverse().map(roundPrice)
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
 * Market for every asset class. Each quote holds daily history plus an
 * intraday series of { t, p } points. Simulated quotes random-walk on every
 * tick. Quotes marked `live` are driven by an external feed (see feeds/) and
 * skipped by the simulator. Subscribers are notified after each tick.
 */
export class Market {
  constructor(assets = ASSETS) {
    this.dates = historyDates()
    this.rand = Math.random
    this.quotes = new Map()
    this.listeners = new Set()
    this.timer = null
    this.feeds = {} // kind -> 'live' | 'connecting' | 'simulated'
    const today = this.dates.at(-1)
    for (const a of assets) {
      const history = buildHistory(a, today)
      const open = history.at(-1)
      const intraday = this.backfill(a, open)
      const ps = intraday.map((x) => x.p)
      this.quotes.set(a.symbol, {
        ...a,
        history,
        prevClose: history.at(-2),
        open,
        price: open,
        high: Math.max(...ps),
        low: Math.min(...ps),
        live: false,
        intraday,
      })
    }
  }

  // A few minutes of earlier ticks so live charts aren't empty on first view.
  backfill(a, price) {
    const now = Date.now()
    const pts = [{ t: now, p: price }]
    for (let i = 1; i < BACKFILL_POINTS; i++) {
      price = step(price, -a.drift, a.vol, gaussian(this.rand), DT / 60)
      pts.push({ t: now - i * TICK_MS, p: roundPrice(price) })
    }
    return pts.reverse()
  }

  get(symbol) {
    return this.quotes.get(symbol)
  }

  has(symbol) {
    return this.quotes.has(symbol)
  }

  all() {
    return [...this.quotes.values()]
  }

  byKind(kind) {
    return this.all().filter((q) => q.kind === kind)
  }

  change(symbol) {
    const q = this.get(symbol)
    const abs = q.price - q.prevClose
    return { abs, pct: q.prevClose ? abs / q.prevClose : 0 }
  }

  // Record a new price for a quote (used by the simulator and live feeds).
  setPrice(q, price, t = Date.now()) {
    q.price = roundPrice(price)
    q.high = Math.max(q.high, q.price)
    q.low = Math.min(q.low, q.price)
    q.history[q.history.length - 1] = q.price
    q.intraday.push({ t, p: q.price })
    if (q.intraday.length > INTRADAY_POINTS) q.intraday.shift()
  }

  tick() {
    const t = Date.now()
    for (const q of this.quotes.values()) {
      if (q.live) continue
      // Intraday ticks use a much smaller dt so moves stay realistic.
      this.setPrice(q, step(q.price, q.drift, q.vol, gaussian(this.rand), DT / 60), t)
    }
    this.emit()
  }

  emit() {
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
