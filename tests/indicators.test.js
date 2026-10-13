import { describe, it, expect } from 'vitest'
import { sma, ema, rsi, maxDrawdown, stdev, returns } from '../src/lib/indicators.js'

describe('indicators', () => {
  it('sma averages a trailing window', () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4])
  })

  it('ema seeds with the sma of the first window', () => {
    const out = ema([2, 4, 6, 8], 2)
    expect(out[1]).toBe(3)
    expect(out[2]).toBeCloseTo(5)
  })

  it('rsi is 100 for a strictly rising series and bounded otherwise', () => {
    const up = Array.from({ length: 30 }, (_, i) => 100 + i)
    expect(rsi(up).at(-1)).toBe(100)
    const zig = Array.from({ length: 30 }, (_, i) => 100 + (i % 2 ? 1 : -1))
    const v = rsi(zig).at(-1)
    expect(v).toBeGreaterThan(0)
    expect(v).toBeLessThan(100)
  })

  it('maxDrawdown finds the worst peak-to-trough fall', () => {
    expect(maxDrawdown([100, 120, 90, 110, 60, 130])).toBeCloseTo(0.5)
  })

  it('returns and stdev behave', () => {
    expect(returns([100, 110])).toEqual([0.10000000000000009])
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3)
  })
})
