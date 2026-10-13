export const $ = (sel, root = document) => root.querySelector(sel)
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

export function html(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (i < values.length ? (values[i] ?? '') : ''), '')
}

export function icon(name, cls = '') {
  return `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`
}

// Re-rendering live lists every tick would drop keyboard focus; restore it
// onto the equivalent element (matched by its data-* attributes) afterwards.
export function preserveFocus(container, render) {
  const el = document.activeElement
  const attrs = el && container.contains(el) ? Object.entries(el.dataset) : []
  render()
  if (!attrs.length) return
  const sel = attrs.map(([k, v]) => `[data-${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}="${CSS.escape(v)}"]`).join('')
  container.querySelector(sel)?.focus()
}
