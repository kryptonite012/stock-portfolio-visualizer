# 📈 StockVault: Stock Portfolio Visualizer

**Live app:** https://kryptonite012.github.io/stock-portfolio-visualizer/

## 📲 Get the app

| Device | How |
| --- | --- |
| **Any phone or computer** | Open the live app and choose **Install app** (in the top bar, or your browser's menu → *Install* / *Add to Home screen*). It gets its own icon and works offline. |
| **Android** | Download `StockVault-…-android.apk` from [the latest release](https://github.com/kryptonite012/stock-portfolio-visualizer/releases/latest) and open it on your phone. Allow "install unknown apps" if asked. |
| **Windows** | Download `StockVault-Setup-….exe` from [the latest release](https://github.com/kryptonite012/stock-portfolio-visualizer/releases/latest). If SmartScreen appears, click **More info → Run anyway**. |
| **Mac** | Download `StockVault-…-mac.dmg`, drag StockVault to Applications. If macOS blocks the first launch: **System Settings → Privacy & Security → Open Anyway**. |
| **Linux** | Download `StockVault-…-linux.AppImage`, `chmod +x` it and run it. |

The installers aren't code-signed (that needs paid Apple/Microsoft certificates), which is why Windows and macOS warn on first launch.

StockVault is a practice trading app that runs entirely in the browser. You manage a virtual portfolio across Indian stocks, commodities and crypto, analyse its performance and learn the financial metrics behind it. It needs no backend and no paid APIs.

## 🚀 Highlights

- 💼 Virtual portfolio with ₹5,00,000 starting cash
- 🏦 **1,351 real NSE-listed stocks** (real symbols, company names and sectors) in a searchable, sortable, paginated table
- 🥇 **Commodities**: 13 MCX-style contracts (gold, silver, crude oil, natural gas, base metals, agri)
- ₿ **Crypto**: 20 top coins with **real live prices from Binance**, converted to rupees
- 📈 **Live charts**: every instrument has a Live chart that updates with each tick, plus 1M / 3M / 6M daily charts
- 💸 **Trading in every market**: shares and contract lots in whole units, crypto in fractions down to 0.000001
- 📊 **Interactive charts** (Chart.js): performance, allocation, P&L, sector exposure, a histogram of daily returns, and stock charts with SMA 20/50 and RSI 14
- 🧠 **Risk analytics**: annualised volatility, Sharpe ratio, max drawdown, HHI concentration, diversification score, cash ratio
- 🔔 **Price alerts**, shown as in-app toasts and as browser notifications when the tab is in the background
- ⭐ **Watchlist** and top movers with sparklines
- ⌨️ **Command palette** (`Ctrl/⌘ K`) that searches every instrument, and keyboard shortcuts (`g d` dashboard, `g s` stocks, `g c` commodities, `g x` crypto, `g a` analytics, `g h` activity, `t` theme)
- 🌙 **Dark mode** that follows your system setting, with a manual toggle
- 📥 **CSV export** of holdings and order history
- 🔐 Local accounts. Passwords are salted and hashed with SHA-256 via Web Crypto, never stored in plain text.
- 📱 **Apps for every device**: an installable offline web app (PWA), an Android app, and Windows, Mac and Linux desktop apps
- Responsive layout with a bottom tab bar on phones and smooth page transitions (View Transitions API)
- ♿ Accessible: native `<dialog>` modals, keyboard focus kept during live updates, `prefers-reduced-motion` respected

## 📡 Where prices come from

| Market      | Instruments                       | Prices |
| ----------- | --------------------------------- | ------ |
| Stocks      | 1,351 real NSE symbols            | **Simulated.** Well-known stocks start from realistic reference prices; the rest use stable seeded prices. Free real-time NSE data isn't available to a browser app. |
| Commodities | 13 MCX-style contracts            | **Simulated** around indicative rupee prices. |
| Crypto      | 20 coins (Binance USDT pairs)     | **Live** from Binance's public market-data API (`data-api.binance.vision`, `data-stream.binance.vision`). USDT is converted to rupees using CoinGecko's rate. If Binance can't be reached, crypto falls back to simulation and the page shows "Offline · simulated". |

Simulated prices move every 3 s using geometric Brownian motion, on top of 6 months of daily history that stays the same for the whole day.

## ▶️ Run it

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm test          # run the unit tests (Vitest)
npm run build     # build for production into dist/
```

Click **Try the demo account** for a pre-filled portfolio, or create your own account.

## 🛠 Building the apps yourself

| Command | What it does |
| --- | --- |
| `npm run desktop` | Builds the app and opens it in a desktop window (Electron) |
| `npm run desktop:dist` | Builds an installer for your OS into `release/` |
| `npx cap add android` then `npm run android:sync` | Creates the Android project in `android/` and copies the app into it. Open `android/` in Android Studio to run it on a phone. |

`npm run build:app` builds the copy used by the apps (`dist-app/`, relative paths, no service worker).

## 🌐 Deployment

Every push to `main` runs two workflows:

- `.github/workflows/apps.yml` builds the Android APK and the Windows, macOS and Linux installers, and publishes them as a new GitHub Release.
- `.github/workflows/deploy.yml` runs the tests, builds the website (with its service worker) and publishes `dist/` to GitHub Pages. One-time setup: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.

`vite.config.js` sets the base path to `/stock-portfolio-visualizer/` for builds, to match the Pages URL. If you rename the repository, update that path.

## 🧱 Project structure

```
index.html              # App entry
public/                 # favicon, web app manifest
src/
├── main.js             # App shell, hash router, theme, shortcuts
├── style.css           # Design tokens (light/dark) and all styles
├── data/
│   ├── assets.js       # Stocks, commodities and crypto definitions
│   ├── nse-equities.json  # 1,351 NSE symbols, names, sectors (see NOTICE.md)
│   └── NOTICE.md       # Source and license for the NSE list
├── lib/
│   ├── market.js       # Market engine (history, intraday ticks, simulation)
│   ├── feeds/crypto.js # Live Binance feed (REST history + WebSocket ticks)
│   ├── portfolio.js    # Pure portfolio maths and trade logic
│   ├── indicators.js   # SMA, EMA, RSI, volatility, Sharpe, drawdown
│   ├── store.js        # Accounts and data saved in localStorage
│   ├── format.js       # Intl formatting (en-IN, ₹)
│   └── csv.js          # CSV export
├── ui/                 # Charts, modals, trade/detail dialogs, palette, toasts
└── views/              # auth, dashboard, stocks, live-market (commodities/crypto), analytics, activity
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

- Real NSE and MCX prices through a small server-side proxy (browsers can't call NSE or Yahoo Finance directly)
- Cloud accounts. `AUTH CONTROLLER (REGISTER + LOGIN)` and `iindx.js` are early Express/MongoDB sketches for this.
- More indicators (MACD, Bollinger Bands) and comparison with a benchmark index
- PDF reports
- Signed release builds and Google Play / app store listings
