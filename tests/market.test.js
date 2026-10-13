import { describe, it, expect } from 'vitest'
import { Market } from '../src/lib/market.js'
import { STOCKS } from '../src/data/stocks.js'

describe('Market', () => {
  it('builds deterministic history ending at the reference price', () => {
    const a = new Market()
    const b = new Market()
    for (const s of STOCKS) {
      expect(a.get(s.symbol).history).toEqual(b.get(s.symbol).history)
      expect(a.get(s.symbol).history.at(-1)).toBe(s.price)
      expect(a.get(s.symbol).history).toHaveLength(a.dates.length)
    }
  })

  it('ticks move prices, track high/low and notify subscribers', () => {
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
    }
  })
})
