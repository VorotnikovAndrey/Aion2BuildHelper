// Сборка справочников игры (src/shared/gamedata/generated/*.json).
//
// Откуда что берётся (подробно — docs/data-sources.md):
//   • статы (id → ключ, английское название, категория) — из локального файла оверлея Questlog
//     %APPDATA%/Questlog/aion-2/game-data-v2.json (он лежит на диске у каждого, кто ставил оверлей);
//   • умения всех классов, специализации, доски Даэваниона, пулы умений аркан, титулы — с публичных
//     страниц metabot.gg (база, собранная из клиента глобальной версии игры).
//
// Скачанные страницы кэшируются в .cache/gamedata (не в git), между запросами — пауза,
// чтобы не нагружать чужой сайт. Повторный запуск без --refresh берёт всё из кэша.
//
// Запуск:
//   npm run gamedata                         — классы по умолчанию (страж)
//   npm run gamedata -- --classes templar,chanter
//   npm run gamedata -- --classes all --refresh
//
// Иконки умений и специализаций (родной арт игры, 256×256) кладутся в src/renderer/public/icons —
// они нужны интерфейсу без интернета. Уже скачанные не перекачиваются.

import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { homedir } from 'node:os'
import { CLASSES, linesOf, parseArcanaPools, parseDaevanion, parseGodstones, parseSkills, parseSpecs, parseTitles, parseTop } from './parsers.mjs'

const ROOT = resolve(import.meta.dirname, '../..')
const CACHE = join(ROOT, '.cache/gamedata')
const OUT = join(ROOT, 'src/shared/gamedata/generated')
const ICONS = join(ROOT, 'src/renderer/public/icons')
const ICON_BASE = 'https://metabot.gg/web/aion2'
const BASE = 'https://metabot.gg/en/aion-2'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'

const args = process.argv.slice(2)
const refresh = args.includes('--refresh')
const classesArg = args[args.indexOf('--classes') + 1]
const wanted = args.includes('--classes') ? (classesArg === 'all' ? CLASSES : classesArg.split(',')) : ['templar']

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function page(path) {
  const file = join(CACHE, path.replace(/[^a-z0-9-]+/gi, '_') + '.html')
  if (!refresh && existsSync(file)) return readFile(file, 'utf8')
  let html = ''
  // Сайт иногда отвечает 502 под нагрузкой — пробуем ещё пару раз с растущей паузой.
  for (let attempt = 1; ; attempt++) {
    await sleep(1200 * attempt)
    const res = await fetch(BASE + path, { headers: { 'user-agent': UA, accept: 'text/html' } })
    if (res.ok) {
      html = await res.text()
      break
    }
    if (attempt >= 4) throw new Error(`${path}: HTTP ${res.status}`)
    console.log(`  ${path}: HTTP ${res.status}, повтор через ${1.2 * (attempt + 1)} с`)
  }
  await mkdir(CACHE, { recursive: true })
  await writeFile(file, html)
  console.log('  скачано', path, Math.round(html.length / 1024), 'КБ')
  return html
}

// ───────────────────────── Статы (из локального Questlog) ─────────────────────────

async function buildStats() {
  const appData = process.env.APPDATA ?? join(homedir(), 'AppData/Roaming')
  const file = join(appData, 'Questlog/aion-2/game-data-v2.json')
  if (!existsSync(file)) {
    console.warn('! Не нашёл', file, '— статы не обновлены (остаются прежние).')
    return
  }
  const data = JSON.parse(await readFile(file, 'utf8')).value
  const stats = data.stats
    .filter((s) => s.language === 'en')
    .map((s) => ({
      id: s.statId,
      key: s.id,
      en: s.name,
      category: s.category || '',
      percent: String(s.indicator).includes('percent'),
      main: !!s.isFirstStat
    }))
    .sort((a, b) => a.id - b.id)
  await writeJson('stats.json', stats)
  console.log('✓ статы:', stats.length)
}

// ───────────────────────── Умения всех классов ─────────────────────────

async function buildSkills() {
  const skills = parseSkills(await page('/skills'))
  if (skills.length < 250) throw new Error(`Слишком мало умений (${skills.length}) — разметка страницы поменялась?`)
  addSharedSkills(skills)
  await writeJson('skills.json', skills)
  console.log('✓ умения:', skills.length)
  return skills
}

/**
 * Общие умения классов (Инстинкт выживания…) идут под одним номером: 11790000, 12790000… На metabot у некоторых классов
 * такого умения нет в списке, хотя в игре оно есть (в русской базе Questlog — есть). Добавляем по образцу другого класса
 * с тем же номером и тем же русским названием.
 */
function addSharedSkills(skills) {
  const ru = JSON.parse(readFileSync(join(ROOT, 'src/shared/gamedata/skills-ru.json'), 'utf8')).names
  const have = new Set(skills.map((s) => String(s.id)))
  for (const id of Object.keys(ru).filter((id) => !have.has(id))) {
    const twin = skills.find((s) => s.id % 1000000 === Number(id) % 1000000 && ru[String(s.id)] === ru[id])
    const cls = CLASSES[Math.floor(Number(id) / 1000000) - 11]
    if (!twin || !cls) continue
    skills.push({ ...twin, id: Number(id), slug: `${twin.slug.replace(new RegExp(`-(${CLASSES.join('|')})$`), '')}-${cls}`, cls })
    console.log(`  + ${id} ${twin.en} (${cls}) — по образцу ${twin.id}`)
  }
}

// ───────────────────────── Специализации ─────────────────────────

async function buildSpecs(skills, classes) {
  const out = {}
  for (const s of skills.filter((x) => classes.includes(x.cls) && x.type !== 'passive')) {
    let html
    try {
      html = await page('/skills/' + s.slug)
    } catch (e) {
      // Отдельная сломанная страница не должна останавливать сборку: остаются данные прошлого запуска.
      console.warn(`! ${s.en}: ${e.message} — специализации не обновлены`)
      continue
    }
    const list = parseSpecs(html)
    if (list.length) out[s.id] = list
  }
  await writeJson('specs.json', { ...(await readJsonSafe('specs.json')), ...out })
  console.log('✓ специализации:', Object.keys(out).length, 'умений')
}

// ───────────────────────── Доски Даэваниона ─────────────────────────

async function buildDaevanion(cls) {
  const list = parseDaevanion(await page('/daevanion/' + cls))
  if (!list.length) throw new Error(`Даэванион ${cls}: узлы не найдены`)
  await writeJson(`daevanion/${cls}.json`, list)
  console.log(`✓ даэванион ${cls}:`, list.map((b) => `${b.en} ${b.nodes.length}`).join(', '))
}

// ───────────────────────── Пулы умений аркан ─────────────────────────

async function buildArcanaPools(skills) {
  const pools = parseArcanaPools(await page('/arcana'), skills)
  await writeJson('arcana-pools.json', pools)
  console.log('✓ пулы аркан:', Object.keys(pools).length, 'классов')
}

// ───────────────────────── Иконки ─────────────────────────

async function download(url, file) {
  if (existsSync(file)) return false
  for (let attempt = 1; ; attempt++) {
    await sleep(400 * attempt)
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'image/webp,image/*' } })
    if (res.ok) {
      await mkdir(join(file, '..'), { recursive: true })
      await writeFile(file, Buffer.from(await res.arrayBuffer()))
      return true
    }
    if (res.status === 404 || res.status === 403) return false // такой иконки на сайте нет
    if (attempt >= 3) throw new Error(`${url}: HTTP ${res.status}`)
  }
}

async function buildIcons(skills, classes) {
  const specs = await readJsonSafe('specs.json')
  let count = 0
  for (const s of skills.filter((x) => classes.includes(x.cls))) {
    if (await download(`${ICON_BASE}/skills/${s.id}.webp`, join(ICONS, 'skills', `${s.id}.webp`))) count++
    // Значки специализаций одинаковы у всех умений: пять цветных щитов у активных и золотой у стигм.
    for (const sp of specs[s.id] ?? []) {
      const name = s.type === 'stigma' ? 'spec-stigma' : `spec-${sp.n}`
      if (await download(`${ICON_BASE}/stigma/${s.id + sp.n * 10}.webp`, join(ICONS, 'specs', `${name}.webp`))) count++
    }
  }
  console.log('✓ иконки: скачано новых', count)
}

// ───────────────────────── Титулы ─────────────────────────

/**
 * Таблица всех титулов: ID, грейд, категория, бонус при ношении и «эффект при наличии».
 * Названия статов на metabot — официальные английские, поэтому они переводятся в наши ID статов.
 */
async function buildTitles() {
  const titles = parseTitles(await page('/titles'), await readJsonSafe('stats.json'))
  await writeJson('titles.json', titles)
  console.log('✓ титулы:', titles.length)
}

// ───────────────────────── Священные камни ─────────────────────────

/** Священные камни (Theostone): ID, название, грейд, эффект и иконка — для гнёзд оружия и наручей. */
async function buildGodstones() {
  const list = parseGodstones(await page('/godstones'))
  await writeJson('godstones.json', list)
  const dir = join(ICONS, 'godstones')
  await mkdir(dir, { recursive: true })
  let fetched = 0
  for (const g of list) {
    if (!g.icon) continue
    const file = join(dir, `${g.id}.webp`)
    if (existsSync(file)) continue
    if (await download(`${ICON_BASE}/items/${g.icon}.webp`, file)) fetched++
  }
  console.log('✓ священные камни:', list.length, '· иконок скачано', fetched)
}

// ───────────────────────── Что носят топ-игроки ─────────────────────────

async function buildTop(skills, cls) {
  const html = await page(`/classes/${cls}/build`)
  const lines = linesOf(html)
  const stats = JSON.parse(await readFile(join(OUT, 'stats.json'), 'utf8'))
  const own = skills.filter((s) => s.cls === cls)
  const top = parseTop(lines, {
    cls,
    // Общие умения (Survival Willpower…) у классов под одним номером: 11790000, 12790000… — если у класса
    // такого названия нет в списке, берём номер по образцу другого класса.
    skillByName: (name) => {
      const mine = own.find((s) => s.en === name)?.id
      if (mine) return mine
      const other = skills.find((s) => s.en === name)
      const prefix = own[0] ? Math.floor(own[0].id / 1000000) : null
      return other && prefix ? prefix * 1000000 + (other.id % 1000000) : undefined
    },
    statByName: (name) => stats.find((s) => s.en === name)?.id
  })
  if (top.unknown.length) console.warn(`  ! ${cls}: не сопоставлено —`, top.unknown.join('; '))
  const { unknown: _u, ...data } = top
  await writeJson(`top/${cls}.json`, { ...data, source: `https://metabot.gg/en/aion-2/classes/${cls}/build`, fetchedAt: new Date().toISOString().slice(0, 10) })
  console.log(`✓ топ-игроки ${cls}: ${top.players} игроков, умений ${top.skills.length}, стигм ${top.stigmas.length}`)
}

// ───────────────────────── Вспомогательное ─────────────────────────

async function writeJson(name, data) {
  const file = join(OUT, name)
  await mkdir(join(file, '..'), { recursive: true })
  await writeFile(file, JSON.stringify(data, null, 0).replace(/\},\{/g, '},\n{') + '\n')
}

async function readJsonSafe(name) {
  try {
    return JSON.parse(await readFile(join(OUT, name), 'utf8'))
  } catch {
    return {}
  }
}

console.log('Классы:', wanted.join(', '))
await buildStats()
const skills = await buildSkills()
await buildArcanaPools(skills)
await buildSpecs(skills, wanted)
for (const cls of wanted) await buildDaevanion(cls)
await buildIcons(skills, wanted)
await buildTitles()
await buildGodstones()
for (const cls of wanted) await buildTop(skills, cls)
// Классы, для которых собраны доски и специализации, — все, что есть в generated (не только этот запуск).
const { readdir } = await import('node:fs/promises')
const built = (await readdir(join(OUT, 'daevanion'))).map((f) => f.replace(/\.json$/, '')).sort()
await writeJson('meta.json', { builtAt: new Date().toISOString().slice(0, 10), classes: built })
console.log('Готово →', OUT)
