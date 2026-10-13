import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const manifest = {
  name: 'StockVault — Stock Portfolio Visualizer',
  short_name: 'StockVault',
  description: 'Practice trading NSE stocks, commodities and live crypto with charts and analytics.',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'any',
  background_color: '#0b0d12',
  theme_color: '#5b5bf6',
  categories: ['finance', 'education'],
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

export default defineConfig(({ command, mode, isPreview }) => {
  // `--mode app` builds the copy bundled into the Android and desktop apps.
  // They load it from local files, so paths are relative and there is no
  // service worker (the app already ships everything it needs).
  if (mode === 'app') return { base: './' }

  return {
    // GitHub Pages serves the site from /<repo-name>/, so production builds
    // (and `npm run preview` of them) need that base path. `npm run dev` uses /.
    base: command === 'build' || isPreview ? '/stock-portfolio-visualizer/' : '/',
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
        manifest,
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,json}'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              // Fonts: serve from cache so the app looks right offline.
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
            },
          ],
        },
      }),
    ],
  }
})
