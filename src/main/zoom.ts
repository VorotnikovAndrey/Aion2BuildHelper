// Масштаб интерфейса как в браузере: Ctrl+колесо, Ctrl+= / Ctrl+− / Ctrl+0.
// Значение хранится в настройках и восстанавливается после каждой загрузки страницы.

import { BrowserWindow } from 'electron'
import { clampZoom, stepZoom, themeBase } from '@shared/theme'
import { getSettings, updateUi } from './storage'

export function applyZoom(win: BrowserWindow, zoom: number): number {
  const z = clampZoom(zoom)
  if (!win.isDestroyed()) win.webContents.setZoomFactor(z)
  return z
}

/** Применить оформление ко всем окнам: масштаб и цвет фона окна (виден до загрузки страницы). */
export async function applyUiToWindows(): Promise<void> {
  const { ui } = await getSettings()
  for (const win of BrowserWindow.getAllWindows()) {
    applyZoom(win, ui.zoom)
    win.setBackgroundColor(themeBase(ui.base).bg)
  }
}

async function changeZoom(win: BrowserWindow, next: (current: number) => number): Promise<void> {
  const z = applyZoom(win, next(win.webContents.getZoomFactor()))
  await updateUi({ zoom: z })
  win.webContents.send('ui:zoom-changed', z)
}

export function attachZoom(win: BrowserWindow): void {
  win.webContents.on('did-finish-load', async () => {
    const { ui } = await getSettings()
    applyZoom(win, ui.zoom)
  })

  // Ctrl+колесо: Electron сам не масштабирует, только сообщает направление.
  win.webContents.on('zoom-changed', (_e, direction) => {
    void changeZoom(win, (z) => stepZoom(z, direction === 'in' ? 1 : -1))
  })

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown' || !(input.control || input.meta) || input.alt) return
    const key = input.key
    if (key === '=' || key === '+' || input.code === 'NumpadAdd') {
      event.preventDefault()
      void changeZoom(win, (z) => stepZoom(z, 1))
    } else if (key === '-' || key === '_' || input.code === 'NumpadSubtract') {
      event.preventDefault()
      void changeZoom(win, (z) => stepZoom(z, -1))
    } else if (key === '0' || input.code === 'Numpad0') {
      event.preventDefault()
      void changeZoom(win, () => 1)
    }
  })
}
