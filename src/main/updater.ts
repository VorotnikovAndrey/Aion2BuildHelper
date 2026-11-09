// Обновления приложения: проверка, скачивание в фоне и установка при перезапуске.
// Работает только в установленной версии (установщик из npm run dist / npm run release). Выпуски лежат
// в открытом репозитории GitHub (`publish` в electron-builder.yml) — ключ приложению не нужен.
// Почему так — docs/decisions/0007-installer-and-updates.md.

import { app, BrowserWindow, ipcMain } from 'electron'
import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { autoUpdater, type ProgressInfo, type UpdateInfo } from 'electron-updater'
import { classifyUpdateError, releaseNotesText, shouldCheck, UPDATE_FIRST_CHECK_DELAY_MS, type UpdateState } from '@shared/updates'
import { shotsEnabled } from './devShots'
import { getSettings, updateSettings } from './storage'

let state: UpdateState = { phase: 'idle', current: app.getVersion() }
const current = (): UpdateState => state

function setState(next: Partial<UpdateState>): void {
  state = { ...state, ...next }
  for (const win of BrowserWindow.getAllWindows()) win.webContents.send('updates:state', state)
}

/** Обновлять можно только установленное приложение; режим автоскриншотов — без сети. */
const supported = () => app.isPackaged && !shotsEnabled()

/** Журнал обновлений — чтобы разобраться, если у человека «не обновляется». */
const logFile = () => join(app.getPath('userData'), 'logs', 'updates.log')
function log(level: string, args: unknown[]): void {
  const line = `${new Date().toISOString()} [${level}] ${args.map((a) => (a instanceof Error ? (a.stack ?? a.message) : String(a))).join(' ')}\n`
  mkdir(join(app.getPath('userData'), 'logs'), { recursive: true })
    .then(() => appendFile(logFile(), line, 'utf8'))
    .catch(() => undefined)
}

const infoPatch = (info: UpdateInfo): Partial<UpdateState> => ({ version: info.version, notes: releaseNotesText(info.releaseNotes) })

async function check(): Promise<void> {
  if (!supported()) return
  if (state.phase === 'checking' || state.phase === 'downloading' || state.phase === 'ready') return
  setState({ phase: 'checking', error: undefined })
  // Ошибку покажет обработчик 'error'; здесь только не даём ей стать необработанной.
  const result = await autoUpdater.checkForUpdates().catch(() => undefined)
  if (result === null && current().phase === 'checking') setState({ phase: 'idle' })
}

export function registerUpdaterIpc(): void {
  ipcMain.handle('updates:get', () => state)
  ipcMain.handle('updates:check', () => check())
  ipcMain.handle('updates:download', async () => {
    if (state.phase !== 'available') return
    setState({ phase: 'downloading', progress: 0 })
    await autoUpdater.downloadUpdate().catch(() => undefined)
  })
  ipcMain.handle('updates:install', () => {
    if (state.phase !== 'ready') return
    // Установщик — тихий (без мастера, путь и ярлыки прежние), после него приложение откроется само.
    autoUpdater.quitAndInstall(true, true)
  })
  ipcMain.handle('updates:setAuto', async (_e, auto: boolean) => {
    const settings = await updateSettings({ autoUpdate: auto })
    autoUpdater.autoDownload = auto
    if (auto && state.phase === 'available') {
      setState({ phase: 'downloading', progress: 0 })
      autoUpdater.downloadUpdate().catch(() => undefined)
    }
    return settings
  })
}

export async function startUpdater(): Promise<void> {
  if (!supported()) {
    setState({ phase: 'unsupported' })
    return
  }
  autoUpdater.autoDownload = (await getSettings()).autoUpdate !== false
  // Скачанное обновление ставится и при обычном закрытии — даже если не нажали «Перезапустить».
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.disableWebInstaller = true
  autoUpdater.logger = {
    info: (...a: unknown[]) => log('info', a),
    warn: (...a: unknown[]) => log('warn', a),
    error: (...a: unknown[]) => log('error', a),
    debug: () => undefined
  }

  autoUpdater.on('update-available', (info) =>
    setState({ ...infoPatch(info), phase: autoUpdater.autoDownload ? 'downloading' : 'available', progress: 0, checkedAt: new Date().toISOString() })
  )
  autoUpdater.on('update-not-available', () => setState({ phase: 'latest', version: undefined, notes: undefined, checkedAt: new Date().toISOString() }))
  autoUpdater.on('download-progress', (p: ProgressInfo) => setState({ phase: 'downloading', progress: p.percent / 100, total: p.total }))
  autoUpdater.on('update-downloaded', (info) => setState({ ...infoPatch(info), phase: 'ready', progress: 1 }))
  autoUpdater.on('error', (err) => {
    const message = err?.message ?? String(err)
    // Скачивание сорвалось — новую версию не забываем, можно попробовать ещё раз.
    const failedDownload = state.phase === 'downloading'
    setState({ phase: failedDownload ? 'available' : 'error', progress: undefined, error: { kind: classifyUpdateError(message), message } })
  })

  setTimeout(() => void check(), UPDATE_FIRST_CHECK_DELAY_MS)
  // Приложение могут держать открытым днями — проверяем и по ходу.
  setInterval(
    () => {
      if (shouldCheck(state.checkedAt, Date.now())) void check()
    },
    30 * 60 * 1000
  ).unref()
}
