// Режим автоскриншотов для разработки: `npm run shots`.
// Запускает собранное приложение с временной папкой настроек (настоящие не трогаем),
// обходит все экраны на реальных данных оверлея и сохраняет PNG в out/shots.
// Это способ для AI-агента увидеть приложение без ручных кликов.

import { app, type BrowserWindow } from 'electron'
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
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
  } else {
    // Чистые настройки взяли бы язык Windows — снимки по умолчанию русские (другой язык — A2BH_SHOTS_UI='{"lang":"de"}').
    mkdirSync(temp, { recursive: true })
    writeFileSync(join(temp, 'settings.json'), JSON.stringify({ ui: { lang: 'ru' } }))
  }
  // Иначе Chromium считает окно перекрытым и останавливает отрисовку — кадр ловится пустым.
  app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')
  app.commandLine.appendSwitch('disable-renderer-backgrounding')
  app.commandLine.appendSwitch('disable-background-timer-throttling')
}

const ROUTES: [string, string][] = [
  ['01-overview', '/'],
  ['02-skills', '/skills'],
  ['03-rotation', '/rotation'],
  ['04-gear', '/gear'],
  ['05-arcana', '/arcana'],
  ['06-daevanion', '/daevanion'],
  ['07-genus', '/genus'],
  ['08-collections', '/collections'],
  ['09-stats', '/stats'],
  ['10-history', '/history'],
  ['11-top', '/top'],
  ['12-guides', '/guides'],
  ['13-checklist', '/checklist'],
  ['14-tips', '/tips'],
  ['15-settings', '/settings'],
  ['16-language', '/settings?tab=language'],
  ['17-names', '/settings?tab=names'],
  ['18-appearance', '/settings?tab=appearance']
]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function runShots(win: BrowserWindow): Promise<void> {
  setTimeout(() => {
    console.error('[shots] timeout')
    app.exit(1)
  }, 240_000).unref()
  const out = join(resolve(app.getAppPath()), 'out', 'shots')
  mkdirSync(out, { recursive: true })
  // Старые снимки убираем: номера страниц сдвигаются, и прежние файлы путались бы с новыми.
  for (const f of readdirSync(out)) if (f.endsWith('.png')) rmSync(join(out, f))
  win.setContentSize(1440, 900)
  // A2BH_SHOTS_UI='{"themeId":"crimson","base":"asmodae","accent":"#e0525e","zoom":1.25,"lang":"de"}' — снять в другой теме, масштабе, на другом языке.
  if (process.env.A2BH_SHOTS_UI || process.env.A2BH_SHOTS_SETTINGS) {
    const { ui } = await updateUi(process.env.A2BH_SHOTS_UI ? JSON.parse(process.env.A2BH_SHOTS_UI) : { zoom: 1 })
    await applyUiToWindows()
    const loaded = new Promise((r) => win.webContents.once('did-finish-load', () => r(null)))
    // Язык — в адресе окна (?lang=), поэтому не просто перезагрузка, а переход с новым языком.
    const url = new URL(win.webContents.getURL())
    url.searchParams.set('lang', ui.lang)
    void win.loadURL(url.toString().replace('static=', 'static'))
    await loaded
  }
  // Заставка при запуске закрывается любой клавишей — на снимках её быть не должно.
  await win.webContents.executeJavaScript(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`)
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
