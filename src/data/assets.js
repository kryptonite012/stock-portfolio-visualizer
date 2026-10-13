import equities from './nse-equities.json'
import { mulberry32, hashString } from '../lib/random.js'

export const STARTING_BALANCE = 500000

// Used to convert crypto USDT prices into rupees until a live rate loads.
export const USDT_INR_FALLBACK = 88.5

// Reference prices for well-known stocks. Every other NSE stock gets a
// stable, seeded reference price. All stock prices are simulated.
const CURATED = {
  RELIANCE: { price: 2950, vol: 0.24, drift: 0.12 },
  TCS: { price: 3850, vol: 0.2, drift: 0.1 },
  INFY: { price: 1520, vol: 0.25, drift: 0.09 },
  WIPRO: { price: 480, vol: 0.27, drift: 0.05 },
  HCLTECH: { price: 1450, vol: 0.23, drift: 0.11 },
  HDFCBANK: { price: 1640, vol: 0.21, drift: 0.1 },
  ICICIBANK: { price: 1120, vol: 0.23, drift: 0.14 },
  SBIN: { price: 780, vol: 0.28, drift: 0.13 },
  KOTAKBANK: { price: 1780, vol: 0.22, drift: 0.07 },
  AXISBANK: { price: 1150, vol: 0.26, drift: 0.11 },
  BAJFINANCE: { price: 7100, vol: 0.31, drift: 0.15 },
  HINDUNILVR: { price: 2450, vol: 0.17, drift: 0.06 },
  ITC: { price: 440, vol: 0.19, drift: 0.09 },
  NESTLEIND: { price: 2480, vol: 0.18, drift: 0.07 },
  MARUTI: { price: 12400, vol: 0.24, drift: 0.12 },
  TATAMOTORS: { price: 960, vol: 0.36, drift: 0.18, name: 'Tata Motors', sector: 'Consumer durables' },
  'M&M': { price: 2850, vol: 0.27, drift: 0.16 },
  SUNPHARMA: { price: 1650, vol: 0.22, drift: 0.13 },
  DRREDDY: { price: 6200, vol: 0.23, drift: 0.08 },
  BHARTIARTL: { price: 1450, vol: 0.22, drift: 0.17 },
  LT: { price: 3600, vol: 0.23, drift: 0.13 },
  ADANIPORTS: { price: 1380, vol: 0.34, drift: 0.14 },
  TITAN: { price: 3500, vol: 0.25, drift: 0.12 },
  ASIANPAINT: { price: 2900, vol: 0.21, drift: 0.04 },
}

function seededStock(symbol) {
  const r = mulberry32(hashString(`ref:${symbol}`))
  // Log-uniform between ₹25 and ₹5,000 so the spread looks like a real exchange.
  const price = Math.round(Math.exp(Math.log(25) + r() * Math.log(5000 / 25)) * 20) / 20
  return { price, vol: 0.22 + r() * 0.28, drift: 0.03 + r() * 0.14 }
}

export const STOCKS = equities.map(([symbol, name, sector, industry]) => {
  const ref = CURATED[symbol] ?? seededStock(symbol)
  return {
    kind: 'stock',
    exchange: 'NSE',
    symbol,
    name: ref.name ?? name,
    sector: ref.sector ?? sector,
    industry,
    unit: 'share',
    step: 1,
    price: ref.price,
    vol: ref.vol,
    drift: ref.drift,
  }
})

// MCX-style contracts at indicative rupee prices. Simulated.
export const COMMODITIES = [
  ['GOLD', 'Gold', 'Bullion', '10 g', 121500, 0.15, 0.1],
  ['GOLDM', 'Gold Mini', 'Bullion', '1 g', 12150, 0.15, 0.1],
  ['SILVER', 'Silver', 'Bullion', '1 kg', 146000, 0.26, 0.12],
  ['SILVERM', 'Silver Mini', 'Bullion', '100 g', 14600, 0.26, 0.12],
  ['CRUDEOIL', 'Crude Oil', 'Energy', '1 bbl', 5450, 0.34, 0.02],
  ['NATURALGAS', 'Natural Gas', 'Energy', '1 mmBtu', 285, 0.55, 0.0],
  ['COPPER', 'Copper', 'Base metals', '1 kg', 1005, 0.22, 0.06],
  ['ALUMINIUM', 'Aluminium', 'Base metals', '1 kg', 262, 0.2, 0.04],
  ['ZINC', 'Zinc', 'Base metals', '1 kg', 284, 0.24, 0.03],
  ['LEAD', 'Lead', 'Base metals', '1 kg', 182, 0.18, 0.02],
  ['NICKEL', 'Nickel', 'Base metals', '1 kg', 1420, 0.3, 0.02],
  ['COTTONCNDY', 'Cotton Candy', 'Agri', '1 candy', 54800, 0.17, 0.03],
  ['MENTHAOIL', 'Mentha Oil', 'Agri', '1 kg', 965, 0.25, 0.02],
].map(([symbol, name, industry, unit, price, vol, drift]) => ({
  kind: 'commodity',
  exchange: 'MCX',
  symbol,
  name,
  sector: 'Commodities',
  industry,
  unit,
  step: 1,
  price,
  vol,
  drift,
}))

// Crypto pairs quoted against USDT on Binance; `usd` is only the fallback
// reference used if the live feed can't be reached.
export const CRYPTO = [
  ['BTC', 'Bitcoin', 110000, 0.55],
  ['ETH', 'Ethereum', 4000, 0.7],
  ['BNB', 'BNB', 900, 0.55],
  ['SOL', 'Solana', 200, 0.85],
  ['XRP', 'XRP', 2.8, 0.85],
  ['DOGE', 'Dogecoin', 0.22, 0.95],
  ['ADA', 'Cardano', 0.8, 0.85],
  ['TRX', 'TRON', 0.33, 0.55],
  ['TON', 'Toncoin', 3, 0.8],
  ['AVAX', 'Avalanche', 28, 0.9],
  ['LINK', 'Chainlink', 22, 0.9],
  ['DOT', 'Polkadot', 4, 0.85],
  ['SHIB', 'Shiba Inu', 0.000012, 1],
  ['LTC', 'Litecoin', 110, 0.75],
  ['BCH', 'Bitcoin Cash', 550, 0.75],
  ['UNI', 'Uniswap', 9, 0.95],
  ['SUI', 'Sui', 3.4, 1],
  ['NEAR', 'NEAR Protocol', 2.7, 0.95],
  ['APT', 'Aptos', 4.5, 0.95],
  ['PEPE', 'Pepe', 0.00001, 1.1],
].map(([symbol, name, usd, vol]) => ({
  kind: 'crypto',
  exchange: 'Binance',
  symbol,
  pair: `${symbol}USDT`,
  name,
  sector: 'Crypto',
  industry: 'Cryptocurrency',
  unit: symbol,
  step: 0.000001,
  price: usd * USDT_INR_FALLBACK,
  vol,
  drift: 0.1,
}))

export const ASSETS = [...STOCKS, ...COMMODITIES, ...CRYPTO]

export const STOCK_SECTORS = [...new Set(STOCKS.map((s) => s.sector))].sort()
