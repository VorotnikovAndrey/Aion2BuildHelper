// Браузерный режим разработки: тот же интерфейс без Electron (npm run dev:web).
// Удобен, чтобы смотреть экраны в обычном браузере. Данные персонажа dev-сервер отдаёт
// прямо из файла оверлея (или из samples/private/characters.json), история — из папки приложения.

import { existsSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const root = import.meta.dirname
const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { version: string }
const appData = process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming')

function questlogFile(): string {
  const sample = resolve(root, 'samples/private/characters.json')
  if (process.env.A2BH_SAMPLE !== '0' && existsSync(sample) && process.env.A2BH_LIVE !== '1') return sample
  return join(appData, 'Questlog', 'aion-2', 'characters.json')
}

function devData(): Plugin {
  return {
    name: 'a2bh-dev-data',
    configureServer(server) {
      server.middlewares.use('/__dev/questlog', (_req, res) => {
        const file = questlogFile()
        res.setHeader('x-source-path', file)
        if (!existsSync(file)) {
          res.statusCode = 404
          return res.end('{}')
        }
        res.setHeader('content-type', 'application/json')
        res.setHeader('x-modified', String(statSync(file).mtimeMs))
        res.end(readFileSync(file))
      })
      server.middlewares.use('/__dev/history', (req, res) => {
        const key = new URL(req.url ?? '', 'http://x').searchParams.get('key') ?? ''
        const file = join(appData, 'Aion2 Build Helper', 'history', `${key.replace(/[^\p{L}\p{N}_-]+/gu, '_')}.json`)
        res.setHeader('content-type', 'application/json')
        res.end(existsSync(file) ? readFileSync(file) : '[]')
      })
    }
  }
}

export default defineConfig({
  root: resolve(root, 'src/renderer'),
  resolve: {
    alias: {
      '@': resolve(root, 'src/renderer/src'),
      '@shared': resolve(root, 'src/shared')
    }
  },
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [react(), tailwindcss(), devData()],
  server: { port: 5199, strictPort: true }
})
