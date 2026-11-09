// Точка входа main-процесса Electron: окно, IPC, слежение за файлом оверлея.

import { app, BrowserWindow, shell } from 'electron'
import { registerUpdaterIpc, startUpdater } from './updater'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { prepareShots, runShots, shotsEnabled } from './devShots'
import { registerIpc } from './ipc'
import { startWatching, stopWatching } from './questlog'
import { getSettings } from './storage'
import { loadWindowState, trackWindowState } from './windowState'
import { attachZoom } from './zoom'
import { themeBase } from '@shared/theme'

app.setName('Aion2 Build Helper')
// Папка данных — по имени приложения, а не пакета: %APPDATA%/Aion2 Build Helper.
app.setPath('userData', join(app.getPath('appData'), 'Aion2 Build Helper'))
if (shotsEnabled()) prepareShots()
app.setAppUserModelId(app.isPackaged ? 'com.aion2buildhelper.app' : 'com.aion2buildhelper.app.dev')

// Одно окно: повторный запуск показывает уже открытое (иначе два процесса пишут одну историю).
if (!shotsEnabled() && !app.requestSingleInstanceLock()) app.quit()
app.on('second-instance', () => {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.show()
  win.focus()
})

function createWindow(background: string): BrowserWindow {
  const iconPath = join(__dirname, '../../build/icon.png')
  const min = { width: 1100, height: 700 }
  const saved = loadWindowState(min)
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    ...saved.bounds,
    minWidth: min.width,
    minHeight: min.height,
    show: false,
    backgroundColor: background,
    title: 'Aion2 Build Helper',
    icon: existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })
  if (saved.maximized && !shotsEnabled()) win.maximize()
  trackWindowState(win)
  attachZoom(win)
  win.once('ready-to-show', () => win.show())

  // Внешние ссылки (гайды, базы) — в браузере, а не внутри приложения.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      e.preventDefault()
      if (/^https?:\/\//i.test(url)) void shell.openExternal(url)
    }
  })

  // В режиме скриншотов — без анимаций (?static), чтобы кадр не ловился на середине появления.
  const search = shotsEnabled() ? 'static' : undefined
  if (process.env.ELECTRON_RENDERER_URL) void win.loadURL(process.env.ELECTRON_RENDERER_URL + (search ? `?${search}` : ''))
  else void win.loadFile(join(__dirname, '../renderer/index.html'), { search })
  return win
}

app.whenReady().then(async () => {
  registerIpc()
  registerUpdaterIpc()
  // Фон окна до загрузки интерфейса — в цвет сохранённой темы, чтобы ничего не мигало.
  const background = themeBase((await getSettings()).ui.base).bg
  const win = createWindow(background)
  if (shotsEnabled()) win.webContents.once('did-finish-load', () => void runShots(win))
  await startWatching()
  void startUpdater()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(background)
  })
})

app.on('window-all-closed', () => {
  stopWatching()
  app.quit()
})
