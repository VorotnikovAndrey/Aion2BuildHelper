// Размер и положение окна запоминаются между запусками.

import { app, screen, type BrowserWindow, type Rectangle } from 'electron'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface WindowState {
  bounds?: Rectangle
  maximized: boolean
}

const file = () => join(app.getPath('userData'), 'window.json')

export function loadWindowState(min: { width: number; height: number }): WindowState {
  try {
    const s = JSON.parse(readFileSync(file(), 'utf8')) as WindowState
    const b = s.bounds
    // Окно должно хотя бы частично попадать на один из мониторов (монитор могли отключить).
    if (b && b.width >= min.width && b.height >= min.height) {
      const visible = screen.getAllDisplays().some((d) => {
        const a = d.workArea
        return b.x < a.x + a.width - 100 && b.x + b.width > a.x + 100 && b.y < a.y + a.height - 100 && b.y + b.height > a.y
      })
      return { bounds: visible ? b : { ...b, x: undefined as unknown as number, y: undefined as unknown as number }, maximized: !!s.maximized }
    }
    return { maximized: !!s.maximized }
  } catch {
    return { maximized: false }
  }
}

export function trackWindowState(win: BrowserWindow): void {
  let timer: NodeJS.Timeout | null = null
  const save = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      if (win.isDestroyed()) return
      const state: WindowState = { bounds: win.isMaximized() ? undefined : win.getBounds(), maximized: win.isMaximized() }
      if (state.maximized) {
        try {
          const prev = JSON.parse(readFileSync(file(), 'utf8')) as WindowState
          state.bounds = prev.bounds
        } catch {
          /* первого сохранения ещё не было */
        }
      }
      try {
        writeFileSync(file(), JSON.stringify(state))
      } catch {
        /* не критично */
      }
    }, 400)
  }
  win.on('resize', save)
  win.on('move', save)
  win.on('maximize', save)
  win.on('unmaximize', save)
}
