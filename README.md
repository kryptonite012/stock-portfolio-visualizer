# 📈 StockVault: Stock Portfolio Visualizer

StockVault simulates a stock trading experience entirely in the browser. You manage a virtual portfolio on a live-simulated Indian (NSE) equity market, analyse its performance and learn the financial metrics behind it. It needs no backend and no paid APIs.

## 🚀 Highlights

- 💼 Virtual portfolio with ₹5,00,000 starting cash
- 📈 **Live market simulation**: prices tick every 3 s using geometric Brownian motion, on top of 6 months of history that stays the same for the whole day
- 📊 **Interactive charts** (Chart.js): performance, allocation, P&L, sector exposure, a histogram of daily returns, and stock charts with SMA 20/50 and RSI 14
- 🧠 **Risk analytics**: annualised volatility, Sharpe ratio, max drawdown, HHI concentration, diversification score, cash ratio
- 🔔 **Price alerts**, shown as in-app toasts and as browser notifications when the tab is in the background
- ⭐ **Watchlist** and top movers with sparklines
- ⌨️ **Command palette** (`Ctrl/⌘ K`) and keyboard shortcuts (`g d` / `g m` / `g a` / `g h` to switch pages, `t` to switch theme)
- 🌙 **Dark mode** that follows your system setting, with a manual toggle
- 📥 **CSV export** of holdings and order history
- 🔐 Local accounts. Passwords are salted and hashed with SHA-256 via Web Crypto, never stored in plain text.
- 📱 Responsive layout with a bottom tab bar on phones, smooth page transitions (View Transitions API) and an installable web app manifest
- ♿ Accessible: native `<dialog>` modals, keyboard focus kept during live updates, `prefers-reduced-motion` respected

## ▶️ Run it

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm test          # run the unit tests (Vitest)
npm run build     # build for production into dist/
```

Click **Try the demo account** for a pre-filled portfolio, or create your own account.

## 🧱 Project structure

```
index.html              # App entry
public/                 # favicon, web app manifest
src/
├── main.js             # App shell, hash router, theme, shortcuts
├── style.css           # Design tokens (light/dark) and all styles
├── data/stocks.js      # Stock list (symbol, sector, volatility, drift)
├── lib/
│   ├── market.js       # Market simulator (history + live ticks)
│   ├── portfolio.js    # Pure portfolio maths and trade logic
│   ├── indicators.js   # SMA, EMA, RSI, volatility, Sharpe, drawdown
│   ├── store.js        # Accounts and data saved in localStorage
│   ├── format.js       # Intl formatting (en-IN, ₹)
│   └── csv.js          # CSV export
├── ui/                 # Charts, modals, trade/detail dialogs, palette, toasts
└── views/              # auth, dashboard, market, analytics, activity
tests/                  # Vitest unit tests for lib/
```

## 💾 Data layer (localStorage)

| Key               | Contents                                                          |
| ----------------- | ----------------------------------------------------------------- |
| `sv_users`        | Every account: balance, holdings, orders, watchlist, alerts       |
| `sv_current_user` | Email of the signed-in account                                     |
| `sv_prefs`        | UI preferences (theme)                                            |

Holdings use the weighted average buy price. Sells record realised P&L.

> ⚠️ Everything is stored on your device and is for learning only. It is not real security and not financial advice.

## 🔮 Roadmap

- Real market data (NSE / Yahoo Finance) behind a small API
- Cloud accounts. `AUTH CONTROLLER (REGISTER + LOGIN)` and `iindx.js` are early Express/MongoDB sketches for this.
- More indicators (MACD, Bollinger Bands) and comparison with a benchmark index
- PDF reports and offline support via a service worker
