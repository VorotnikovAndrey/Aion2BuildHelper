// Режим автоскриншотов для разработки: `npm run shots`.
// Запускает собранное приложение с временной папкой настроек (настоящие не трогаем),
// обходит все экраны на реальных данных оверлея и сохраняет PNG в out/shots.
// Это способ для AI-агента увидеть приложение без ручных кликов.

import { app, type BrowserWindow } from 'electron'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { updateUi } from './storage'
import { applyUiToWindows } from './zoom'

export const shotsEnabled = () => Boolean(process.env.A2BH_SHOTS)

/** Вызывать до app.whenReady(). */
export function prepareShots(): void {
  const real = app.getPath('userData')
  const temp = join(tmpdir(), `a2bh-shots-${Date.now()}`)
  app.setPath('userData', temp)
  // A2BH_SHOTS_SETTINGS=1 — снять с вашими настройками (гайд, отметки специализаций, свои названия), но в масштабе 100%.
  if (process.env.A2BH_SHOTS_SETTINGS && existsSync(join(real, 'settings.json'))) {
    mkdirSync(temp, { recursive: true })
    copyFileSync(join(real, 'settings.json'), join(temp, 'settings.json'))
  }
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
  ['12-settings', '/settings'],
  ['13-appearance', '/settings?tab=appearance']
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
  // A2BH_SHOTS_UI='{"themeId":"crimson","base":"asmodae","accent":"#e0525e","zoom":1.25}' — снять в другой теме и масштабе.
  if (process.env.A2BH_SHOTS_UI || process.env.A2BH_SHOTS_SETTINGS) {
    await updateUi(process.env.A2BH_SHOTS_UI ? JSON.parse(process.env.A2BH_SHOTS_UI) : { zoom: 1 })
    await applyUiToWindows()
    const loaded = new Promise((r) => win.webContents.once('did-finish-load', () => r(null)))
    win.webContents.reload()
    await loaded
  }
  await sleep(2000)
  const title = () => win.webContents.executeJavaScript(`document.querySelector('main h1')?.textContent ?? ''`) as Promise<string>
  for (const [name, route] of ROUTES) {
    // Ждём, пока страница действительно сменится (заголовок другой), иначе снимок может достаться прошлой странице.
    const before = await title()
    await win.webContents.executeJavaScript(`location.hash = ${JSON.stringify('#' + route)}`)
    for (let i = 0; i < 40 && (await title()) === before; i++) await sleep(100)
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
