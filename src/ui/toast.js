let region

export function toast(message, { tone = 'info', timeout = 3500 } = {}) {
  if (!region) {
    region = document.createElement('div')
    region.className = 'toasts'
    region.setAttribute('role', 'status')
    region.setAttribute('aria-live', 'polite')
    document.body.append(region)
  }
  const el = document.createElement('div')
  el.className = `toast toast-${tone}`
  el.textContent = message
  region.append(el)
  setTimeout(() => {
    el.classList.add('leaving')
    el.addEventListener('animationend', () => el.remove(), { once: true })
  }, timeout)
}
