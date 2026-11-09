// Рисует значок приложения (build/icon.svg — крылья вокруг кристалла эфира) в build/icon.png и build/icon.ico.
// Запуск: npm run icon  (через Electron — он умеет отрисовать SVG без лишних библиотек).

const { app, BrowserWindow } = require('electron')
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')

const SIZE = 256
// Источник — build/icon.svg (та же геометрия разобрана на части в BrandMark.tsx для заставки).
const svg = readFileSync(join(__dirname, '..', 'build', 'icon.svg'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace('<svg ', `<svg width="${SIZE}" height="${SIZE}" `)

/** ICO с PNG внутри — Windows (Vista+) понимает такой формат. */
function pngToIco(png) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry.writeUInt8(0, 0) // 0 = 256 px
  entry.writeUInt8(0, 1)
  entry.writeUInt8(0, 2)
  entry.writeUInt8(0, 3)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(22, 12)
  return Buffer.concat([header, entry, png])
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: SIZE, height: SIZE, show: false, frame: false, transparent: true, webPreferences: { offscreen: true } })
  const html = `<html><body style="margin:0;background:transparent">${svg}</body></html>`
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
  await new Promise((r) => setTimeout(r, 300))
  const png = (await win.webContents.capturePage({ x: 0, y: 0, width: SIZE, height: SIZE })).resize({ width: SIZE, height: SIZE }).toPNG()
  const dir = join(__dirname, '..', 'build')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'icon.png'), png)
  writeFileSync(join(dir, 'icon.ico'), pngToIco(png))
  console.log('build/icon.png и build/icon.ico готовы')
  app.quit()
})
