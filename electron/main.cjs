// Desktop shell: opens the bundled web app (dist-app/) in its own window.
const { app, BrowserWindow, shell } = require('electron')
const path = require('node:path')

// One window only: a second launch focuses the existing one.
if (!app.requestSingleInstanceLock()) app.quit()

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 380,
    minHeight: 560,
    title: 'StockVault',
    backgroundColor: '#0b0d12',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false },
  })
  win.loadFile(path.join(__dirname, '..', 'dist-app', 'index.html'))

  // Links to other sites (e.g. GitHub) open in the user's browser, not in the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })
}

app.on('second-instance', () => {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
