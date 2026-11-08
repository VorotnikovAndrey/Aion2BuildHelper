// Обработчики window.api (контракт — src/shared/api.ts).

import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import type { Settings } from '@shared/api'
import type { UiPrefs } from '@shared/theme'
import { normalizeGuide } from '@shared/guide'
import type { Guide } from '@shared/guide/types'
import { getSourceState, onSourceChange, reloadSource, startWatching } from './questlog'
import { dataDir, getSettings, listGuides, listHistory, removeGuide, saveGuide, updateSettings, updateUi } from './storage'
import { applyUiToWindows } from './zoom'

export function registerIpc(): void {
  ipcMain.handle('source:get', () => getSourceState())
  ipcMain.handle('source:reload', () => reloadSource())
  ipcMain.handle('source:pick', async (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const res = await dialog.showOpenDialog(win!, {
      title: 'Файл персонажей оверлея Questlog',
      defaultPath: getSourceState().path,
      filters: [{ name: 'characters.json', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (res.canceled || !res.filePaths[0]) return null
    await updateSettings({ questlogPath: res.filePaths[0] })
    await startWatching()
    return getSourceState()
  })
  ipcMain.handle('source:reset', async () => {
    await updateSettings({ questlogPath: undefined })
    await startWatching()
    return getSourceState()
  })
  onSourceChange((state) => {
    for (const w of BrowserWindow.getAllWindows()) w.webContents.send('source:changed', state)
  })

  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:update', (_e, patch: Partial<Settings>) => updateSettings(patch))
  ipcMain.handle('settings:updateUi', async (_e, patch: Partial<UiPrefs>) => {
    const settings = await updateUi(patch)
    await applyUiToWindows()
    return settings
  })

  ipcMain.handle('guides:list', () => listGuides())
  ipcMain.handle('guides:save', (_e, guide: Guide) => saveGuide(guide))
  ipcMain.handle('guides:remove', (_e, id: string) => removeGuide(id))
  ipcMain.handle('guides:import', async (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const res = await dialog.showOpenDialog(win!, {
      title: 'Импорт гайда',
      filters: [{ name: 'Гайд (JSON)', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (res.canceled || !res.filePaths[0]) return null
    const raw = JSON.parse(await readFile(res.filePaths[0], 'utf8'))
    // Импортированный гайд всегда получает новый ID — чтобы не затереть свой с тем же ID.
    const guide = normalizeGuide(raw, randomUUID())
    return saveGuide({ ...guide, id: `guide-${randomUUID()}` })
  })
  ipcMain.handle('guides:export', async (e, guide: Guide) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const name = guide.name.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'guide'
    const res = await dialog.showSaveDialog(win!, {
      title: 'Экспорт гайда',
      defaultPath: `${name}.json`,
      filters: [{ name: 'Гайд (JSON)', extensions: ['json'] }]
    })
    if (res.canceled || !res.filePath) return false
    const { builtin: _builtin, ...rest } = guide
    await writeFile(res.filePath, JSON.stringify(rest, null, 2), 'utf8')
    return true
  })

  ipcMain.handle('history:list', (_e, key: string) => listHistory(key))

  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('app:openExternal', (_e, url: string) => {
    // Открываем только веб-ссылки — никаких file:// и прочего из данных гайда.
    if (/^https?:\/\//i.test(url)) return shell.openExternal(url)
  })
  ipcMain.handle('app:openDataFolder', () => shell.openPath(dataDir()))
}
