const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  electron: () => process.versions.electron,
})

contextBridge.exposeInMainWorld('electronAPI', {
  fetchText: (url) => ipcRenderer.invoke('fetch-text', url),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
})
