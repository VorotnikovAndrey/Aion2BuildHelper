// Разбор публичных страниц metabot.gg в справочники — чистые функции без сети и файлов.
// Ими пользуются и скрипт сборки (build-gamedata.mjs), и проверка обновлений в приложении (src/main/gamedataCheck.ts).

export { parseTop } from './top-players.mjs'

export const CLASSES = ['gladiator', 'templar', 'assassin', 'ranger', 'sorcerer', 'spiritmaster', 'cleric', 'chanter']
const NEWLINE = String.fromCharCode(10)

export const decode = (s) =>
  s
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

/** Текст страницы без разметки — по строке на блок. */
export const textOf = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, NEWLINE)
      .replace(/\n\s*\n+/g, NEWLINE)
  )

/** Текст страницы построчно, без пустых строк. */
export const linesOf = (html) =>
  textOf(html)
    .split(NEWLINE)
    .map((l) => l.trim())
    .filter(Boolean)

/** /skills — умения всех классов: последние 24 таблицы = 8 классов × (активные, пассивные, стигмы). */
export function parseSkills(html) {
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
  return skills
}

/** /skills/<slug> — специализации умения: номер, уровень открытия, текст. */
export function parseSpecs(html) {
  const re =
    /specHead">Specialization (\d+)(?:<!-- -->)?(?:[^<]*<span[^>]*>requires skill level (\d+)<\/span>)?[^<]*<\/div><p class="[^"]*specText">([^<]*)<\/p>/g
  const list = []
  let m
  while ((m = re.exec(html))) {
    const text = decode(m[3])
    if (/^(A\d)+$/.test(text)) continue // комбинации «A1A2» — служебные, не отдельные варианты
    list.push({ n: Number(m[1]), level: m[2] ? Number(m[2]) : null, en: text })
  }
  return list
}

/** /daevanion/<класс> — доски с узлами. */
export function parseDaevanion(html) {
  const t = html.replace(/\\\\\\"/g, '"').replace(/\\"/g, '"')
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
  return Object.values(boards)
    .filter((b) => b.nodes.length)
    .map((b) => ({ ...b, nodes: b.nodes.sort((a, z) => a.id - z.id) }))
}

/** /arcana — какие умения бывают на картах аркан каждого класса. */
export function parseArcanaPools(html, skills) {
  const text = textOf(html)
  const pools = {}
  const names = { Chalice: 'chalice', Parchment: 'parchment', Compass: 'compass', Bell: 'bell', Mirror: 'mirror' }
  for (const cls of CLASSES) {
    const title = cls[0].toUpperCase() + cls.slice(1)
    const start = text.indexOf(`${title} Arcana skill pools`)
    if (start < 0) continue
    const lines = text.slice(start).split(NEWLINE).slice(3)
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
  return pools
}

/** /titles — все титулы: ID, грейд, категория, бонусы (названия статов переводятся в наши ID). */
export function parseTitles(html, stats) {
  const byEn = new Map((Array.isArray(stats) ? stats : []).map((s) => [s.en.toLowerCase(), s]))
  const CATEGORY = { Offensive: 'attack', Defensive: 'defense', Utility: 'utility' }
  const RACE = { Elyos: 'light', Asmodians: 'dark' }
  const parseStats = (text) =>
    decode(text)
      .split(', ')
      .map((part) => part.trim().match(/^(.+?) \+([\d.,]+)(%?)$/))
      .filter(Boolean)
      .map((m) => {
        const def = byEn.get(m[1].toLowerCase())
        if (!def) return null
        const n = Number(m[2].replace(/,/g, ''))
        return [def.id, def.percent ? Math.round(n * 100) : n]
      })
      .filter(Boolean)
  const titles = []
  for (const row of html.matchAll(/<tr><th scope="row">([\s\S]*?)<\/tr>/g)) {
    const r = row[1]
    const id = r.match(/own:t:(\d+)" data-g="(\w+)"/)
    const name = r.match(/nameText"[^>]*>([^<]*)</)
    const tds = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''))
    if (!id || !name || tds.length < 6) continue
    titles.push({
      id: Number(id[1]),
      en: decode(name[1]),
      grade: id[2].toLowerCase(),
      category: CATEGORY[tds[2]] ?? 'utility',
      race: RACE[tds[1]] ?? 'both',
      equip: parseStats(tds[3]),
      collection: parseStats(tds[4]),
      source: decode(tds[5])
    })
  }
  return titles.sort((a, b) => a.id - b.id)
}

/** /godstones — священные камни: ID, название, грейд, эффект, иконка. */
export function parseGodstones(html) {
  const list = []
  for (const row of html.matchAll(/<tr><th scope="row">([\s\S]*?)<\/tr>/g)) {
    const r = row[1]
    const id = r.match(/own:g:(\d+)"/)
    const name = r.match(/nameText"[^>]*>([^<]*)</)
    const rarity = r.match(/data-rarity="(\w+)"/)
    const icon = r.match(/items%2F([a-z0-9_]+)\.webp/)
    const tds = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, '')))
    if (!id || !name) continue
    list.push({
      id: Number(id[1]),
      en: decode(name[1]).replace(/^Theostone:\s*/, ''),
      grade: (rarity?.[1] ?? 'common').toLowerCase(),
      effect: tds[tds.length - 1] ?? '',
      icon: icon?.[1] ?? null
    })
  }
  return list.sort((a, b) => a.id - b.id)
}
