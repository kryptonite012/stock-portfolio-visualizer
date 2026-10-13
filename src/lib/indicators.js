// Technical indicators and statistics over plain number arrays.

export function sma(values, period) {
  const out = new Array(values.length).fill(null)
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= period) sum -= values[i - period]
    if (i >= period - 1) out[i] = sum / period
  }
  return out
}

export function ema(values, period) {
  const out = new Array(values.length).fill(null)
  if (values.length < period) return out
  const k = 2 / (period + 1)
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period
  out[period - 1] = prev
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k)
    out[i] = prev
  }
  return out
}

// Wilder's RSI.
export function rsi(values, period = 14) {
  const out = new Array(values.length).fill(null)
  if (values.length <= period) return out
  let gain = 0
  let loss = 0
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1]
    if (d >= 0) gain += d
    else loss -= d
  }
  gain /= period
  loss /= period
  out[period] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss)
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1]
    gain = (gain * (period - 1) + Math.max(d, 0)) / period
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss)
  }
  return out
}

export function returns(values) {
  const out = []
  for (let i = 1; i < values.length; i++) out.push(values[i] / values[i - 1] - 1)
  return out
}

export function mean(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
}

export function stdev(values) {
  if (values.length < 2) return 0
  const m = mean(values)
  return Math.sqrt(values.reduce((a, v) => a + (v - m) ** 2, 0) / (values.length - 1))
}

// Largest peak-to-trough decline, as a positive fraction.
export function maxDrawdown(values) {
  let peak = -Infinity
  let worst = 0
  for (const v of values) {
    peak = Math.max(peak, v)
    if (peak > 0) worst = Math.max(worst, (peak - v) / peak)
  }
  return worst
}

const TRADING_DAYS = 252

export function annualisedVolatility(values) {
  return stdev(returns(values)) * Math.sqrt(TRADING_DAYS)
}

export function sharpeRatio(values, riskFree = 0.065) {
  const r = returns(values)
  const sd = stdev(r)
  if (!sd) return 0
  return ((mean(r) - riskFree / TRADING_DAYS) / sd) * Math.sqrt(TRADING_DAYS)
}
