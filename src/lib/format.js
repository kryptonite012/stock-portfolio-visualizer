const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const inrSmall = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 4 })
const inrCompact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 2 })
const num = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })
const qtyFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 6 })
const pct = new Intl.NumberFormat('en-IN', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero' })
const pctPlain = new Intl.NumberFormat('en-IN', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

// Sub-rupee prices (small crypto) need significant digits, not 2 decimals.
export const money = (v) => (v !== 0 && Math.abs(v) < 1 ? inrSmall : inr).format(v)
export const moneyCompact = (v) => inrCompact.format(v)
export const number = (v) => num.format(v)
export const quantity = (v) => qtyFmt.format(v)
export const percent = (v) => pct.format(v)
// Unsigned percent for ratios (weights, volatility) where a '+' would mislead.
export const ratio = (v) => pctPlain.format(v)
export const signedMoney = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + money(Math.abs(v))
export const when = (ts) => dateTime.format(ts)
export const tone = (v) => (v > 0 ? 'up' : v < 0 ? 'down' : 'flat')

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}
