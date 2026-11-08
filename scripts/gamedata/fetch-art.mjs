// Скачивает арт игры по списку из src/shared/gamedata/art.json в src/renderer/public/art.
// Источник — публичный CDN картинок Questlog (те же файлы, что показывает страница билда).
// Уже скачанные файлы не трогает: перезапуск безопасен и быстрый. Запуск: npm run art
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const art = JSON.parse(readFileSync(join(root, 'src/shared/gamedata/art.json'), 'utf8'))
const outDir = join(root, 'src/renderer/public/art')

// Имя локального файла — то же правило, что в src/shared/gamedata/art.ts (artFile).
const fileOf = (path) => path.split('/').pop().toLowerCase()

/** @type {{ group: string, path: string }[]} */
const jobs = []
const add = (group, path) => jobs.push({ group, path })

for (const it of Object.values(art.items)) add('items', it.icon)
for (const p of Object.values(art.frames)) add('frames', p)
for (const p of Object.values(art.stones)) add('stones', p)
for (const p of Object.values(art.titleEmblems)) add('titles', p)
for (const p of Object.values(art.pantheonSlots)) add('pantheon', p)
for (const it of Object.values(art.pantheon)) add('pantheon', it.icon)
for (const p of Object.values(art.classes)) add('classes', p)
for (const p of Object.values(art.skillIcons ?? {})) add('skills', p)
add('arcana', art.arcana.frame)
add('arcana', art.arcana.enchant)
for (const type of art.arcana.types) {
  add('arcana', art.arcana.tabs.replace('{Type}', type))
  for (const set of Object.values(art.arcana.sets)) add('arcana', art.arcana.cards.replace('{Type}', type).replace('{Set}', set))
}

async function download(url, attempt = 1) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Aion2BuildHelper (personal tool)' } })
  if (res.status === 404) return null
  if (!res.ok) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1500 * attempt))
      return download(url, attempt + 1)
    }
    throw new Error(`${res.status} ${url}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

let fetched = 0
let missing = 0
for (const { group, path } of jobs) {
  const file = join(outDir, group, fileOf(path))
  if (existsSync(file)) continue
  const buf = await download(art.base + path)
  if (!buf) {
    missing++
    console.warn(`нет на CDN: ${path}`)
    continue
  }
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, buf)
  fetched++
  await new Promise((r) => setTimeout(r, 120))
}
console.log(`Арт: ${jobs.length} файлов в списке, скачано новых ${fetched}, не найдено ${missing}.`)
