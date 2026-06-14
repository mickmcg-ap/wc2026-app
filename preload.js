const { contextBridge } = require('electron')

// No special APIs needed — the renderer fetches ESPN directly via fetch()
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  electron: () => process.versions.electron,
})
