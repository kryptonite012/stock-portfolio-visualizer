import './style.css'
import { store } from './lib/store.js'
import { market } from './lib/market.js'
import { summarize } from './lib/portfolio.js'
import { money, percent, tone, escapeHtml } from './lib/format.js'
import { injectIcons } from './ui/icons.js'
import { applyChartDefaults, destroyCharts } from './ui/charts.js'
import { setupPalette } from './ui/palette.js'
import { checkAlerts } from './ui/trade.js'
import { $, $$, icon } from './ui/dom.js'
import { toast } from './ui/toast.js'
import { canInstall, promptInstall, onInstallChange, isNativeApp, RELEASES_URL } from './ui/install.js'
import auth from './views/auth.js'
import dashboard from './views/dashboard.js'
import stocks from './views/stocks.js'
import { liveMarketView } from './views/live-market.js'
import { startCryptoFeed } from './lib/feeds/crypto.js'
import analytics from './views/analytics.js'
import history from './views/history.js'

const routes = {
  '/dashboard': { view: dashboard, icon: 'dashboard', label: 'Dashboard' },
  '/stocks': { view: stocks, icon: 'market', label: 'Stocks' },
  '/commodities': { view: liveMarketView('commodity'), icon: 'gem', label: 'Commodities' },
  '/crypto': { view: liveMarketView('crypto'), icon: 'coins', label: 'Crypto' },
  '/analytics': { view: analytics, icon: 'analytics', label: 'Analytics' },
  '/activity': { view: history, icon: 'history', label: 'Activity' },
}

const app = $('#app')
let current = null // { path, instance }

// ---------- theme ----------
const media = matchMedia('(prefers-color-scheme: dark)')
function effectiveTheme() {
  const t = store.prefs.theme
  return t === 'system' ? (media.matches ? 'dark' : 'light') : t
}
function applyTheme() {
  document.documentElement.dataset.theme = effectiveTheme()
  $('meta[name=theme-color]')?.setAttribute('content', effectiveTheme() === 'dark' ? '#0b0d12' : '#f6f7fb')
  applyChartDefaults()
}
function toggleTheme() {
  store.setPref('theme', effectiveTheme() === 'dark' ? 'light' : 'dark')
  applyTheme()
  rerender()
}
media.addEventListener('change', () => { applyTheme(); rerender() })

// ---------- shell ----------
function shell() {
  const nav = Object.entries(routes)
    .map(([path, r]) => `<a href="#${path}" data-path="${path}">${icon(r.icon)}<span>${r.label}</span></a>`)
    .join('')
  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <a class="brand" href="#/dashboard">${icon('logo')}<span>StockVault</span></a>
        <nav class="nav" aria-label="Main">${nav}</nav>
        <div class="sidebar-foot">
          <div class="market-status" data-status></div>
          ${isNativeApp ? '' : `<a class="get-apps" href="${RELEASES_URL}" target="_blank" rel="noopener">${icon('download')} Android &amp; desktop apps</a>`}
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="search-trigger" data-palette>${icon('search')}<span>Search or jump to…</span><kbd>Ctrl K</kbd></button>
          <div class="topbar-stats" data-stats></div>
          <button class="btn xs primary install-btn" data-install hidden>${icon('install')} Install app</button>
          <button class="icon-btn" data-theme-toggle aria-label="Toggle theme"></button>
          <div class="user">
            <span class="avatar" aria-hidden="true"></span>
            <button class="icon-btn" data-logout aria-label="Sign out" title="Sign out">${icon('logout')}</button>
          </div>
        </header>
        <main id="view" tabindex="-1"></main>
      </div>
    </div>`
  $('[data-theme-toggle]').addEventListener('click', toggleTheme)
  $('[data-logout]').addEventListener('click', () => store.logout())
  $('[data-palette]').addEventListener('click', () => openPalette())
  $('[data-install]').addEventListener('click', install)
}

function updateShell() {
  const u = store.user
  if (!u || !$('.layout')) return
  const s = summarize(u, market)
  $('[data-stats]').innerHTML = `
    <span>${icon('wallet')} ${money(s.cash)}</span>
    <span class="${tone(s.dayPnl)}">Today ${percent(s.dayPnlPct)}</span>`
  $('.avatar').textContent = u.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  $('.avatar').title = `${u.name} · ${u.email}`
  const crypto = market.feeds.crypto
  $('[data-status]').innerHTML = `
    <span><i class="dot"></i> NSE &amp; MCX · simulated</span>
    <span><i class="dot ${crypto === 'live' ? '' : 'off'}"></i> Crypto · ${crypto === 'live' ? 'live' : crypto === 'connecting' ? 'connecting' : 'simulated'}</span>`
  $('[data-install]').hidden = !canInstall()
  $('[data-theme-toggle]').innerHTML = icon(effectiveTheme() === 'dark' ? 'sun' : 'moon')
}

// ---------- install ----------
async function install() {
  if (await promptInstall()) toast('StockVault installed. Open it from your home screen or app list.', { tone: 'success' })
}
onInstallChange(() => updateShell())

// ---------- routing ----------
function resolve() {
  if (!store.user) return { path: '/login', view: auth }
  let path = location.hash.slice(1) || '/dashboard'
  if (path === '/market') path = '/stocks' // old links
  if (!routes[path]) {
    location.replace('#/dashboard')
    return { path: '/dashboard', view: dashboard }
  }
  return { path, view: routes[path].view }
}

function render() {
  const { path, view } = resolve()
  const swap = () => {
    destroyCharts()
    if (path === '/login') {
      app.innerHTML = '<main id="view" class="bare"></main>'
    } else if (!$('.layout')) {
      shell()
    }
    // Fresh element per view so listeners from the previous view don't leak.
    const root = $('#view').cloneNode(false)
    $('#view').replaceWith(root)
    current = { path, instance: view.mount(root) }
    document.title = `${view.title} · StockVault`
    $$('.nav a').forEach((a) => a.setAttribute('aria-current', a.dataset.path === path ? 'page' : 'false'))
    updateShell()
  }
  // Progressive enhancement: smooth cross-fade between pages where supported.
  if (document.startViewTransition && current && current.path !== path && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(swap)
  } else {
    swap()
  }
}

function rerender() {
  current = null
  render()
}

window.addEventListener('hashchange', () => {
  if (current?.path !== resolve().path) render()
})

// Session changes (login/logout) trigger a full re-route; data changes just update.
let lastEmail = store.email
store.subscribe(() => {
  if (store.email !== lastEmail) {
    lastEmail = store.email
    if (store.email && (!location.hash || location.hash === '#/login')) location.hash = '#/dashboard'
    rerender()
    return
  }
  current?.instance?.update?.()
  updateShell()
})

market.subscribe(() => {
  current?.instance?.update?.()
  updateShell()
  checkAlerts()
})

// Keyboard shortcuts: g then d/m/a/h to navigate.
let pendingG = false
document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea, select, dialog') || e.metaKey || e.ctrlKey || e.altKey || !store.user) return
  if (pendingG) {
    const map = { d: '/dashboard', s: '/stocks', c: '/commodities', x: '/crypto', a: '/analytics', h: '/activity' }
    if (map[e.key]) location.hash = `#${map[e.key]}`
    pendingG = false
  } else if (e.key === 'g') {
    pendingG = true
    setTimeout(() => (pendingG = false), 1000)
  } else if (e.key === 't') {
    toggleTheme()
  }
})

const openPalette = setupPalette(() => {
  if (!store.user) return []
  return [
    ...Object.entries(routes).map(([path, r]) => ({ label: `Go to ${r.label}`, hint: 'Page', run: () => (location.hash = `#${path}`) })),
    { label: 'Toggle dark mode', hint: 'T', run: toggleTheme },
    ...(canInstall() ? [{ label: 'Install app on this device', hint: 'App', run: install }] : []),
    ...(isNativeApp ? [] : [{ label: 'Download Android & desktop apps', hint: 'GitHub', run: () => window.open(RELEASES_URL, '_blank', 'noopener') }]),
    { label: 'Sign out', hint: escapeHtml(store.user.email), run: () => store.logout() },
  ]
})

injectIcons()
applyTheme()
render()
market.start(3000)
startCryptoFeed(market, { onStatus: updateShell })
