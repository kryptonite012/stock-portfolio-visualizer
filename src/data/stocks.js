// Universe of simulated NSE-listed stocks. `price` is the reference price the
// simulator starts from; `vol` is annualised volatility, `drift` annual drift.
export const STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', price: 2950, vol: 0.24, drift: 0.12 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', price: 3850, vol: 0.2, drift: 0.1 },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT', price: 1520, vol: 0.25, drift: 0.09 },
  { symbol: 'WIPRO', name: 'Wipro', sector: 'IT', price: 480, vol: 0.27, drift: 0.05 },
  { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', price: 1450, vol: 0.23, drift: 0.11 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', price: 1640, vol: 0.21, drift: 0.1 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', price: 1120, vol: 0.23, drift: 0.14 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', price: 780, vol: 0.28, drift: 0.13 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', price: 1780, vol: 0.22, drift: 0.07 },
  { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking', price: 1150, vol: 0.26, drift: 0.11 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Finance', price: 7100, vol: 0.31, drift: 0.15 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', price: 2450, vol: 0.17, drift: 0.06 },
  { symbol: 'ITC', name: 'ITC', sector: 'FMCG', price: 440, vol: 0.19, drift: 0.09 },
  { symbol: 'NESTLEIND', name: 'Nestle India', sector: 'FMCG', price: 2480, vol: 0.18, drift: 0.07 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Auto', price: 12400, vol: 0.24, drift: 0.12 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto', price: 960, vol: 0.36, drift: 0.18 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Auto', price: 2850, vol: 0.27, drift: 0.16 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharma', price: 1650, vol: 0.22, drift: 0.13 },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories", sector: 'Pharma', price: 6200, vol: 0.23, drift: 0.08 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', price: 1450, vol: 0.22, drift: 0.17 },
  { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Infra', price: 3600, vol: 0.23, drift: 0.13 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', sector: 'Infra', price: 1380, vol: 0.34, drift: 0.14 },
  { symbol: 'TITAN', name: 'Titan Company', sector: 'Consumer', price: 3500, vol: 0.25, drift: 0.12 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer', price: 2900, vol: 0.21, drift: 0.04 },
]

export const SECTORS = [...new Set(STOCKS.map((s) => s.sector))].sort()

export const STARTING_BALANCE = 500000
