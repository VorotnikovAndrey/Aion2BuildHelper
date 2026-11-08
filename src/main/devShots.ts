// Режим автоскриншотов для разработки: `npm run shots`.
// Запускает собранное приложение с временной папкой настроек (настоящие не трогаем),
// обходит все экраны на реальных данных оверлея и сохраняет PNG в out/shots.
// Это способ для AI-агента увидеть приложение без ручных кликов.

import { app, type BrowserWindow } from 'electron'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

export const shotsEnabled = () => Boolean(process.env.A2BH_SHOTS)

/** Вызывать до app.whenReady(). */
export function prepareShots(): void {
  app.setPath('userData', join(tmpdir(), `a2bh-shots-${Date.now()}`))
  // Иначе Chromium считает окно перекрытым и останавливает отрисовку — кадр ловится пустым.
  app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')
  app.commandLine.appendSwitch('disable-renderer-backgrounding')
  app.commandLine.appendSwitch('disable-background-timer-throttling')
}

const ROUTES: [string, string][] = [
  ['01-overview', '/'],
  ['02-skills', '/skills'],
  ['03-gear', '/gear'],
  ['04-arcana', '/arcana'],
  ['05-daevanion', '/daevanion'],
  ['06-genus', '/genus'],
  ['07-collections', '/collections'],
  ['08-stats', '/stats'],
  ['09-history', '/history'],
  ['10-guides', '/guides'],
  ['11-checklist', '/checklist'],
  ['12-settings', '/settings']
]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function runShots(win: BrowserWindow): Promise<void> {
  setTimeout(() => {
    console.error('[shots] timeout')
    app.exit(1)
  }, 120_000).unref()
  const out = join(resolve(app.getAppPath()), 'out', 'shots')
  mkdirSync(out, { recursive: true })
  win.setContentSize(1440, 900)
  await sleep(2000)
  for (const [name, route] of ROUTES) {
    await win.webContents.executeJavaScript(`location.hash = ${JSON.stringify('#' + route)}`)
    await sleep(900)
    // Длинные страницы снимаем целиком: временно растягиваем окно по высоте содержимого.
    const height = await win.webContents.executeJavaScript(`document.querySelector('main')?.scrollHeight ?? 900`)
    win.setContentSize(1440, Math.min(Math.max(900, Number(height) + 40), 4000))
    await sleep(500)
    const image = await win.webContents.capturePage()
    writeFileSync(join(out, `${name}.png`), image.toPNG())
    win.setContentSize(1440, 900)
    console.log('[shots]', name)
  }
  app.quit()
}
