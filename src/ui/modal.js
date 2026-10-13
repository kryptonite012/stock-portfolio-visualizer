import { icon } from './dom.js'

// Native <dialog>-based modal. Returns the dialog element; `onClose` runs once.
export function openModal({ title, body, wide = false, onClose }) {
  const dlg = document.createElement('dialog')
  dlg.className = `modal${wide ? ' wide' : ''}`
  dlg.innerHTML = `
    <header class="modal-head">
      <h2>${title}</h2>
      <button class="icon-btn" data-close aria-label="Close">${icon('x')}</button>
    </header>
    <div class="modal-body">${body}</div>`
  document.body.append(dlg)
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close()
  })
  dlg.addEventListener('close', () => {
    onClose?.()
    dlg.remove()
  })
  dlg.showModal()
  return dlg
}
