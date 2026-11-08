// Запускает собранное приложение в режиме автоскриншотов (см. src/main/devShots.ts).
// Использование: npm run shots  → картинки в out/shots
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const electron = createRequire(import.meta.url)('electron')
const res = spawnSync(electron, ['.'], { stdio: 'inherit', env: { ...process.env, A2BH_SHOTS: '1' } })
process.exit(res.status ?? 0)
