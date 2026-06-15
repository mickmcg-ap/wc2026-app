const { app, BrowserWindow, Menu, nativeImage, ipcMain, net, shell } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 820,
    minWidth: 380,
    minHeight: 500,
    title: 'World Cup 2026',
    backgroundColor: '#0d1117',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  win.loadFile('index.html')

  win.once('ready-to-show', () => {
    win.show()
  })

  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.meta && input.alt && input.key === 'I')) {
      win.webContents.openDevTools({ mode: 'detach' })
    }
  })

  // Native app menu (minimal)
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'minimize' },
        { role: 'zoom' },
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'front' },
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
}

ipcMain.handle('open-external', (_, url) => shell.openExternal(url))

ipcMain.handle('fetch-text', (_, url) =>
  new Promise((resolve, reject) => {
    const req = net.request(url)
    const chunks = []
    req.on('response', res => {
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.end()
  })
)

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
