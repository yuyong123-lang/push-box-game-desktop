const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

function getDefaultLevelsPath() {
  return path.join(app.getPath('userData'), 'levels.json')
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true})
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'images', 'box.png')
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (DEV_SERVER_URL) {
    win.loadURL(DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC: Get environment info
ipcMain.handle('get-environment-info', () => {
  return {
    environment: {
      isWindows: os.platform() === 'win32',
      platform: os.platform()
    },
    paths: {
      defaultLevelsFile: getDefaultLevelsPath(),
      dataDir: app.getPath('userData')
    }
  }
})

// IPC: Test file path accessibility
ipcMain.handle('test-path', (event, filePath) => {
  const targetPath = filePath || getDefaultLevelsPath()
  const dir = path.dirname(targetPath)
  const dirExists = fs.existsSync(dir)
  const fileExists = fs.existsSync(targetPath)
  return {
    success: true,
    dirExists,
    fileExists,
    message: dirExists
        ? (fileExists ? '文件存在，可以读写' : '目录存在，可以创建文件')
        : '目录不存在，需要先创建目录'
  }
})

// IPC: Load levels from file
ipcMain.handle('load-levels', (event, filePath) => {
  const targetPath = filePath || getDefaultLevelsPath()
  try {
    if (!fs.existsSync(targetPath)) {
      // Try loading bundled default levels
      const devPath = path.join(__dirname, '..', 'public', 'levels.json')
      const prodPath = path.join(process.resourcesPath, 'levels.json')
      const sourcePath = fs.existsSync(prodPath) ? prodPath : devPath

      if (fs.existsSync(sourcePath)) {
        const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
        // Copy to userData so it becomes writable
        ensureDir(path.dirname(targetPath))
        fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8')
        return {success: true, levels: data.levels, timestamp: data.timestamp}
      }
      return {success: false, error: 'No levels file found'}
    }
    const data = JSON.parse(fs.readFileSync(targetPath, 'utf8'))
    return {success: true, levels: data.levels, timestamp: data.timestamp}
  } catch (error) {
    return {success: false, error: error.message}
  }
})

// IPC: Save levels to file
ipcMain.handle('save-levels', (event, levelData, filePath) => {
  const targetPath = filePath || getDefaultLevelsPath()
  try {
    const dir = path.dirname(targetPath)
    ensureDir(dir)
    fs.writeFileSync(targetPath, JSON.stringify(levelData, null, 2), 'utf8')
    return {success: true, message: '文件保存成功'}
  } catch (error) {
    return {success: false, error: error.message}
  }
})

// IPC: Get default levels path
ipcMain.handle('get-default-levels-path', () => {
  return getDefaultLevelsPath()
})
