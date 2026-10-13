// Where the Android and desktop builds are published.
export const RELEASES_URL = 'https://github.com/kryptonite012/stock-portfolio-visualizer/releases/latest'

// True inside the Android (Capacitor) or desktop (Electron) app.
export const isNativeApp = Boolean(window.Capacitor?.isNativePlatform?.()) || /Electron\//.test(navigator.userAgent)

const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true

let deferred = null
const listeners = new Set()
const notify = () => listeners.forEach((fn) => fn())

// Browsers fire this when the site meets install criteria; keep it so our own
// Install button can trigger the prompt later.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred = e
  notify()
})
window.addEventListener('appinstalled', () => {
  deferred = null
  notify()
})

export const canInstall = () => Boolean(deferred) && !isStandalone() && !isNativeApp

export async function promptInstall() {
  if (!deferred) return false
  deferred.prompt()
  const { outcome } = await deferred.userChoice
  deferred = null
  notify()
  return outcome === 'accepted'
}

export function onInstallChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
