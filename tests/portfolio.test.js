import { describe, it, expect } from 'vitest'
import { applyTrade, summarize, diversificationScore, enrichHoldings } from '../src/lib/portfolio.js'

const prices = { AAA: { price: 120, prevClose: 110, name: 'A', sector: 'IT' }, BBB: { price: 50, prevClose: 50, name: 'B', sector: 'FMCG' } }
const fakeMarket = { get: (s) => prices[s] }
const user = () => ({ balance: 10000, holdings: [], transactions: [] })

describe('applyTrade', () => {
  it('buys, averages cost and deducts cash', () => {
    let u = applyTrade(user(), { symbol: 'AAA', side: 'buy', qty: 10, price: 100 })
    u = applyTrade(u, { symbol: 'AAA', side: 'buy', qty: 10, price: 200 })
    expect(u.balance).toBe(10000 - 1000 - 2000)
    expect(u.holdings).toEqual([{ symbol: 'AAA', qty: 20, avgPrice: 150 }])
    expect(u.transactions).toHaveLength(2)
  })

  it('sells, records realised P&L and removes empty positions', () => {
    let u = applyTrade(user(), { symbol: 'AAA', side: 'buy', qty: 10, price: 100 })
    u = applyTrade(u, { symbol: 'AAA', side: 'sell', qty: 10, price: 130 })
    expect(u.holdings).toEqual([])
    expect(u.balance).toBe(10300)
    expect(u.transactions[0].realized).toBe(300)
  })

  it('rejects invalid trades without mutating input', () => {
    const u = user()
    expect(() => applyTrade(u, { symbol: 'AAA', side: 'buy', qty: 1000, price: 100 })).toThrow('Insufficient funds')
    expect(() => applyTrade(u, { symbol: 'AAA', side: 'sell', qty: 1, price: 100 })).toThrow('Not enough shares')
    expect(() => applyTrade(u, { symbol: 'AAA', side: 'buy', qty: 0, price: 100 })).toThrow('positive')
    expect(u).toEqual(user())
  })
})

describe('summaries', () => {
  it('computes value, P&L, day P&L and weights', () => {
    const u = { balance: 1000, holdings: [{ symbol: 'AAA', qty: 10, avgPrice: 100 }, { symbol: 'BBB', qty: 12, avgPrice: 50 }], transactions: [] }
    const s = summarize(u, fakeMarket)
    expect(s.value).toBe(1800)
    expect(s.invested).toBe(1600)
    expect(s.pnl).toBe(200)
    expect(s.dayPnl).toBe(100)
    expect(s.netWorth).toBe(2800)
    expect(s.rows.map((r) => r.weight)).toEqual([1200 / 1800, 600 / 1800])
  })

  it('diversification grows with more positions and sectors', () => {
    const one = enrichHoldings([{ symbol: 'AAA', qty: 1, avgPrice: 1 }], fakeMarket)
    const two = enrichHoldings([{ symbol: 'AAA', qty: 1, avgPrice: 1 }, { symbol: 'BBB', qty: 2, avgPrice: 1 }], fakeMarket)
    expect(diversificationScore(two)).toBeGreaterThan(diversificationScore(one))
    expect(diversificationScore([])).toBe(0)
  })
})
