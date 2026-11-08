// Сборка справочников игры (src/shared/gamedata/generated/*.json).
//
// Откуда что берётся (подробно — docs/data-sources.md):
//   • статы (id → ключ, английское название, категория) — из локального файла оверлея Questlog
//     %APPDATA%/Questlog/aion-2/game-data-v2.json (он лежит на диске у каждого, кто ставил оверлей);
//   • умения всех классов, специализации, доски Даэваниона, пулы умений аркан — с публичных страниц
//     metabot.gg (база, собранная из клиента глобальной версии игры).
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

import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { homedir } from 'node:os'

const ROOT = resolve(import.meta.dirname, '../..')
const CACHE = join(ROOT, '.cache/gamedata')
const OUT = join(ROOT, 'src/shared/gamedata/generated')
const ICONS = join(ROOT, 'src/renderer/public/icons')
const ICON_BASE = 'https://metabot.gg/web/aion2'
const BASE = 'https://metabot.gg/en/aion-2'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
const CLASSES = ['gladiator', 'templar', 'assassin', 'ranger', 'sorcerer', 'spiritmaster', 'cleric', 'chanter']

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

const decode = (s) =>
  s
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

/** Текст страницы без разметки — по строке на блок. */
const textOf = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\n\s*\n+/g, '\n')
  )

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
  const html = await page('/skills')
  // Последние 24 таблицы страницы — 8 классов × (активные, пассивные, стигмы) в порядке открытия.
  const tables = html
    .split('<table')
    .slice(1)
    .filter((t) => t.includes('nameLink'))
  const types = ['active', 'passive', 'stigma']
  const skills = []
  tables.slice(-24).forEach((t, i) => {
    const cls = CLASSES[Math.floor(i / 3)]
    const type = types[i % 3]
    const re = /href="\/en\/aion-2\/skills\/([a-z0-9-]+)"[\s\S]*?skills%2F(\d+)\.webp[\s\S]*?nameText">([^<]+)<\/span>[\s\S]*?<td[^>]*>([^<]*)<\/td>/g
    let m
    let order = 0
    while ((m = re.exec(t))) {
      skills.push({
        id: Number(m[2]),
        slug: m[1],
        en: decode(m[3]),
        cls,
        type,
        unlock: Number(m[4].replace(/\D/g, '')) || null,
        order: order++
      })
    }
  })
  if (skills.length < 250) throw new Error(`Слишком мало умений (${skills.length}) — разметка страницы поменялась?`)
  await writeJson('skills.json', skills)
  console.log('✓ умения:', skills.length)
  return skills
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
    const re =
      /specHead">Specialization (\d+)(?:<!-- -->)?(?:[^<]*<span[^>]*>requires skill level (\d+)<\/span>)?[^<]*<\/div><p class="[^"]*specText">([^<]*)<\/p>/g
    const list = []
    let m
    while ((m = re.exec(html))) {
      const text = decode(m[3])
      if (/^(A\d)+$/.test(text)) continue // комбинации «A1A2» — служебные, не отдельные варианты
      list.push({ n: Number(m[1]), level: m[2] ? Number(m[2]) : null, en: text })
    }
    if (list.length) out[s.id] = list
  }
  await writeJson('specs.json', { ...(await readJsonSafe('specs.json')), ...out })
  console.log('✓ специализации:', Object.keys(out).length, 'умений')
}

// ───────────────────────── Доски Даэваниона ─────────────────────────

async function buildDaevanion(cls) {
  let t = await page('/daevanion/' + cls)
  t = t.replace(/\\\\\\"/g, '"').replace(/\\"/g, '"')
  const boards = {}
  for (const m of t.matchAll(/\{"id":(\d{2}),"name":"([^"]+)","needLevel":(\d+)/g)) {
    boards[m[1]] = { id: Number(m[1]), en: m[2], needLevel: Number(m[3]), nodes: [] }
  }
  const seen = new Set()
  const re = /\{"id":(\d{6}),"row":\d+[^{}]*?"stats":\[[^\]]*\][^{}]*?"skillLevels":\d+\}/g
  let m
  while ((m = re.exec(t))) {
    const n = JSON.parse(m[0])
    if (seen.has(n.id)) continue
    seen.add(n.id)
    const board = boards[String(Math.floor(n.id / 10000))]
    if (!board) continue
    board.nodes.push({
      id: n.id,
      row: n.row,
      col: n.col,
      type: n.type,
      grade: n.grade,
      cost: n.cost,
      auto: n.auto || undefined,
      label: n.label,
      stats: n.stats.length ? n.stats : undefined,
      skill: n.skillId || undefined,
      levels: n.skillId ? n.skillLevels : undefined
    })
  }
  const list = Object.values(boards)
    .filter((b) => b.nodes.length)
    .map((b) => ({ ...b, nodes: b.nodes.sort((a, z) => a.id - z.id) }))
  if (!list.length) throw new Error(`Даэванион ${cls}: узлы не найдены`)
  await writeJson(`daevanion/${cls}.json`, list)
  console.log(`✓ даэванион ${cls}:`, list.map((b) => `${b.en} ${b.nodes.length}`).join(', '))
}

// ───────────────────────── Пулы умений аркан ─────────────────────────

async function buildArcanaPools(skills) {
  const text = textOf(await page('/arcana'))
  const pools = {}
  const names = { Chalice: 'chalice', Parchment: 'parchment', Compass: 'compass', Bell: 'bell', Mirror: 'mirror' }
  for (const cls of CLASSES) {
    const title = cls[0].toUpperCase() + cls.slice(1)
    const start = text.indexOf(`${title} Arcana skill pools`)
    if (start < 0) continue
    const lines = text.slice(start).split('\n').slice(3)
    const byName = new Map(skills.filter((s) => s.cls === cls).map((s) => [s.en, s.id]))
    const cls_ = {}
    let card = null
    for (const line of lines) {
      if (names[line]) {
        card = names[line]
        cls_[card] = []
        continue
      }
      if (/skills in all|Arcana skill pools/.test(line)) break
      if (!card || /skills$|each, up to/.test(line) || line === 'Arcana' || line === 'Possible skills') continue
      const id = byName.get(line)
      if (id) cls_[card].push(id)
      else if (Object.keys(cls_).length === 5 && cls_.mirror?.length) break
    }
    pools[cls] = cls_
  }
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
console.log('Готово →', OUT)
