import { USDT_INR_FALLBACK } from '../../data/assets.js'
import { roundPrice } from '../market.js'

// Binance's public market-data endpoints. They need no API key and allow
// browser (CORS) access.
const REST = 'https://data-api.binance.vision/api/v3'
const WS = 'wss://data-stream.binance.vision/stream'
const FX = 'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr'

async function getJson(url, timeout = 8000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function usdtInr() {
  try {
    const rate = (await getJson(FX)).tether.inr
    return rate > 0 ? rate : USDT_INR_FALLBACK
  } catch {
    return USDT_INR_FALLBACK
  }
}

/**
 * Drives crypto quotes from Binance: 180 days of daily candles for history,
 * then a WebSocket mini-ticker stream for live prices. If Binance can't be
 * reached the quotes simply stay on the simulator.
 */
export function startCryptoFeed(market, { onStatus } = {}) {
  const quotes = market.byKind('crypto')
  const bySymbol = new Map(quotes.map((q) => [q.pair.toLowerCase(), q]))
  let rate = USDT_INR_FALLBACK
  let ws = null
  let retry = 0
  let stopped = false

  const setStatus = (s) => {
    market.feeds.crypto = s
    onStatus?.(s)
  }

  async function loadHistory() {
    const days = market.dates.length
    await Promise.all(quotes.map(async (q) => {
      try {
        const candles = await getJson(`${REST}/klines?symbol=${q.pair}&interval=1d&limit=${days}`)
        const closes = candles.map((c) => roundPrice(Number(c[4]) * rate))
        if (closes.length < 2) return
        // Newer coins have shorter history: pad the start with the first close.
        while (closes.length < days) closes.unshift(closes[0])
        q.history = closes
        q.prevClose = closes.at(-2)
        q.open = roundPrice(Number(candles.at(-1)[1]) * rate)
        q.high = q.low = q.price = closes.at(-1)
        q.intraday = [{ t: Date.now(), p: q.price }]
      } catch {
        /* keep simulated history for this coin */
      }
    }))
  }

  function connect() {
    if (stopped) return
    const streams = quotes.map((q) => `${q.pair.toLowerCase()}@miniTicker`).join('/')
    ws = new WebSocket(`${WS}?streams=${streams}`)
    ws.onopen = () => {
      retry = 0
      setStatus('live')
    }
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data).data
      const q = d && bySymbol.get(d.s.toLowerCase())
      if (!q) return
      q.live = true
      // Crypto trades 24/7, so "today's change" is the rolling 24h change.
      q.prevClose = roundPrice(Number(d.o) * rate)
      market.setPrice(q, Number(d.c) * rate)
      q.high = Math.max(q.high, roundPrice(Number(d.h) * rate))
      q.low = Math.min(q.low, roundPrice(Number(d.l) * rate))
    }
    ws.onclose = () => {
      for (const q of quotes) q.live = false // simulator takes over while disconnected
      if (stopped) return
      setStatus('simulated')
      retry = Math.min(retry + 1, 6)
      setTimeout(connect, 1000 * 2 ** retry)
    }
    ws.onerror = () => ws.close()
  }

  setStatus('connecting')
  ;(async () => {
    rate = await usdtInr()
    market.usdtInr = rate
    await loadHistory()
    connect()
  })()

  return () => {
    stopped = true
    ws?.close()
  }
}
