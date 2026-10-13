import { describe, it, expect } from 'vitest'
import { Market, roundPrice } from '../src/lib/market.js'
import { ASSETS, STOCKS, COMMODITIES, CRYPTO } from '../src/data/assets.js'

describe('asset universe', () => {
  it('lists over 1,000 NSE stocks plus commodities and crypto with unique symbols', () => {
    expect(STOCKS.length).toBeGreaterThan(1000)
    expect(COMMODITIES.length).toBeGreaterThan(5)
    expect(CRYPTO.length).toBeGreaterThan(10)
    expect(new Set(ASSETS.map((a) => a.symbol)).size).toBe(ASSETS.length)
    for (const a of ASSETS) {
      expect(a.price).toBeGreaterThan(0)
      expect(a.name).toBeTruthy()
    }
  })

  it('keeps curated reference prices for well-known stocks', () => {
    expect(STOCKS.find((s) => s.symbol === 'TCS').price).toBe(3850)
  })
})

describe('Market', () => {
  it('builds deterministic history ending at the reference price', () => {
    const a = new Market()
    const b = new Market()
    for (const s of ASSETS.slice(0, 50).concat(CRYPTO)) {
      expect(a.get(s.symbol).history).toEqual(b.get(s.symbol).history)
      expect(a.get(s.symbol).history.at(-1)).toBe(roundPrice(s.price))
      expect(a.get(s.symbol).history).toHaveLength(a.dates.length)
    }
  })

  it('ticks move prices, track high/low, record intraday points and notify', () => {
    const m = new Market()
    let calls = 0
    m.subscribe(() => calls++)
    for (let i = 0; i < 20; i++) m.tick()
    expect(calls).toBe(20)
    for (const q of m.all()) {
      expect(q.price).toBeGreaterThan(0)
      expect(q.high).toBeGreaterThanOrEqual(q.price)
      expect(q.low).toBeLessThanOrEqual(q.price)
      expect(q.history.at(-1)).toBe(q.price)
      expect(q.intraday.at(-1).p).toBe(q.price)
    }
  })

  it('leaves quotes driven by a live feed alone', () => {
    const m = new Market()
    const btc = m.get('BTC')
    btc.live = true
    const before = btc.price
    m.tick()
    expect(btc.price).toBe(before)
  })

  it('rounds tiny prices to significant digits', () => {
    expect(roundPrice(0.000123456789)).toBe(0.000123457)
    expect(roundPrice(1234.567)).toBe(1234.57)
  })
})
