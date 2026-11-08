// Рисует значок приложения (тот же щит, что в боковом меню) в build/icon.png и build/icon.ico.
// Запуск: npm run icon  (через Electron — он умеет отрисовать SVG без лишних библиотек).

const { app, BrowserWindow } = require('electron')
const { mkdirSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')

const SIZE = 256
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3cf7a"/><stop offset="1" stop-color="#b9822a"/></linearGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2433"/><stop offset="1" stop-color="#0f131c"/></linearGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#b)" stroke="url(#a)" stroke-width="2"/>
  <path d="M32 12 L48 18 V31 C48 41 41 48 32 52 C23 48 16 41 16 31 V18 Z" fill="none" stroke="url(#a)" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 20 C37 25 41 26 44 26 C41 29 37 30 33 30 M32 20 C27 25 23 26 20 26 C23 29 27 30 31 30" fill="none" stroke="#55c7ec" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M32 30 V44" stroke="url(#a)" stroke-width="3" stroke-linecap="round"/>
</svg>`

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
