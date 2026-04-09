const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getEnvironmentInfo: () => ipcRenderer.invoke('get-environment-info'),
  testPath: (filePath) => ipcRenderer.invoke('test-path', filePath),
  loadLevels: (filePath) => ipcRenderer.invoke('load-levels', filePath),
  saveLevels: (levelData, filePath) => ipcRenderer.invoke('save-levels', levelData, filePath),
  getDefaultLevelsPath: () => ipcRenderer.invoke('get-default-levels-path')
})
