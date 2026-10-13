// Pure portfolio calculations. `holdings` are { symbol, qty, avgPrice }.

export function enrichHoldings(holdings, market) {
  const rows = holdings.map((h) => {
    const q = market.get(h.symbol)
    const invested = h.qty * h.avgPrice
    const value = h.qty * q.price
    const pnl = value - invested
    const dayPnl = h.qty * (q.price - q.prevClose)
    return {
      ...h,
      name: q.name,
      sector: q.sector,
      price: q.price,
      invested,
      value,
      pnl,
      pnlPct: invested ? pnl / invested : 0,
      dayPnl,
    }
  })
  const total = rows.reduce((a, r) => a + r.value, 0)
  for (const r of rows) r.weight = total ? r.value / total : 0
  return rows
}

export function summarize(user, market) {
  const rows = enrichHoldings(user.holdings, market)
  const invested = rows.reduce((a, r) => a + r.invested, 0)
  const value = rows.reduce((a, r) => a + r.value, 0)
  const dayPnl = rows.reduce((a, r) => a + r.dayPnl, 0)
  const netWorth = value + user.balance
  return {
    rows,
    invested,
    value,
    pnl: value - invested,
    pnlPct: invested ? (value - invested) / invested : 0,
    dayPnl,
    dayPnlPct: value - dayPnl ? dayPnl / (value - dayPnl) : 0,
    cash: user.balance,
    netWorth,
    cashRatio: netWorth ? user.balance / netWorth : 1,
  }
}

export function sectorExposure(rows) {
  const map = new Map()
  for (const r of rows) map.set(r.sector, (map.get(r.sector) || 0) + r.value)
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

// Herfindahl–Hirschman index of position weights (0..1, higher = concentrated).
export function concentration(rows) {
  return rows.reduce((a, r) => a + r.weight ** 2, 0)
}

// 0..100 score blending number of positions, sector spread, and HHI.
export function diversificationScore(rows) {
  if (!rows.length) return 0
  const effectiveN = 1 / concentration(rows)
  const sectors = new Set(rows.map((r) => r.sector)).size
  const posScore = Math.min(effectiveN / 10, 1)
  const sectorScore = Math.min(sectors / 6, 1)
  return Math.round((posScore * 0.6 + sectorScore * 0.4) * 100)
}

// Daily portfolio value series using current holdings over market history.
export function valueSeries(holdings, market) {
  const len = market.dates.length
  const out = new Array(len).fill(0)
  for (const h of holdings) {
    const hist = market.get(h.symbol).history
    for (let i = 0; i < len; i++) out[i] += h.qty * hist[i]
  }
  return out
}

// Apply a trade to a user object, returning a new user. Throws on invalid trades.
export function applyTrade(user, { symbol, side, qty, price }) {
  qty = Math.floor(qty)
  if (!(qty > 0)) throw new Error('Quantity must be a positive whole number')
  const cost = qty * price
  const holdings = user.holdings.map((h) => ({ ...h }))
  const idx = holdings.findIndex((h) => h.symbol === symbol)
  let balance = user.balance
  let realized = 0

  if (side === 'buy') {
    if (cost > balance + 1e-6) throw new Error('Insufficient funds')
    balance -= cost
    if (idx >= 0) {
      const h = holdings[idx]
      h.avgPrice = (h.avgPrice * h.qty + cost) / (h.qty + qty)
      h.qty += qty
    } else {
      holdings.push({ symbol, qty, avgPrice: price })
    }
  } else if (side === 'sell') {
    if (idx < 0 || holdings[idx].qty < qty) throw new Error('Not enough shares to sell')
    const h = holdings[idx]
    realized = (price - h.avgPrice) * qty
    balance += cost
    h.qty -= qty
    if (h.qty === 0) holdings.splice(idx, 1)
  } else {
    throw new Error(`Unknown side: ${side}`)
  }

  const tx = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    symbol,
    side,
    qty,
    price,
    total: cost,
    realized,
  }
  return { ...user, balance, holdings, transactions: [tx, ...user.transactions] }
}
