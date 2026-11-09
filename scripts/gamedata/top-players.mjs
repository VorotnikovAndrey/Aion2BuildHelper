// Что носят топ-игроки класса — из публичной страницы metabot.gg/en/aion-2/classes/<класс>/build
// (раздел «What top <Class> players run»: умения, стигмы, заточка по слотам, арканы, камни, титулы,
// распределение боевой мощи). Результат — src/shared/gamedata/generated/top/<класс>.json.
// Страница разбирается по тексту: заголовки разделов → тройки «название / доля / среднее».

const SLOT_MAP = {
  'Main hand': [1],
  'Off-hand': [2],
  Helmet: [3],
  Shoulders: [4],
  Chest: [5],
  Legs: [6],
  Gloves: [7],
  Boots: [8],
  Cape: [19],
  Necklace: [10],
  Earring: [11, 12],
  Ring: [13, 14],
  Bracelet: [15, 16],
  Belt: [17],
  Amulet: [22],
  Rune: [23, 24]
}
const ARCANA_SLOT = { 1: 41, 2: 42, 3: 43, 4: 44, 5: 45 }

const pct = (s) => Number(String(s).replace('%', '').replace(',', '.'))
const int = (s) => Number(String(s).replace(/[^\d]/g, ''))
const avgLv = (s) => Number(String(s).match(/avg\. Lv\. ([\d.]+)/)?.[1] ?? NaN)
const avgPlus = (s) => Number(String(s).match(/avg\. \+([\d.]+)/)?.[1] ?? NaN)
const isPct = (s) => /^[\d.]+%$/.test(s)

/** Разбор текста страницы (строки без разметки) в данные о топ-игроках. */
export function parseTop(lines, { cls, skillByName, statByName }) {
  const at = (re, from = 0) => {
    for (let i = from; i < lines.length; i++) if (re.test(lines[i])) return i
    return -1
  }
  const after = (label, from = 0) => {
    const i = at(new RegExp(`^${label}$`), from)
    return i >= 0 ? lines[i + 1] : undefined
  }

  const runStart = at(/^What top .* players run$/)
  const out = {
    cls,
    players: int(after('Top players tracked', runStart)),
    medianCp: int(after('Median combat power', runStart)),
    top10Cp: int(after('Top 10% from', runStart)),
    avgItemLevel: int(after('Avg\\. item level', runStart)),
    cpBuckets: [],
    skills: [],
    stigmas: [],
    boards: [],
    enchant: [],
    gear: [],
    manastones: [],
    arcana: [],
    titles: { attack: [], defense: [], other: [] },
    wings: [],
    unknown: []
  }

  for (const l of lines) {
    const m = l.match(/^([\d,]+)–([\d,]+) CP: ([\d,]+) characters$/)
    if (m) out.cpBuckets.push({ from: int(m[1]), to: int(m[2]), count: int(m[3]) })
  }

  // Тройки «название / 87% / avg. Lv. 9.7» между двумя заголовками.
  const triples = (start, stopRe, valueOf) => {
    const res = []
    for (let i = start; i < lines.length && !stopRe.test(lines[i]); i++) {
      if (isPct(lines[i + 1] ?? '') && /^avg\./.test(lines[i + 2] ?? '')) {
        res.push({ name: lines[i], share: pct(lines[i + 1]), value: valueOf(lines[i + 2]) })
        i += 2
      }
    }
    return res
  }
  const skill = (name) => {
    const id = skillByName(name)
    if (!id) out.unknown.push(`skill: ${name}`)
    return id
  }

  const act = at(/^Active skills on the bar$/)
  if (act >= 0) {
    for (const t of triples(act + 1, /^Load the most common build/, avgLv)) {
      const id = skill(t.name)
      if (id) out.skills.push({ skill: id, share: t.share, avgLevel: t.value })
    }
  }
  const stg = at(/^Most used .* stigmas$/)
  if (stg >= 0) {
    for (const t of triples(stg + 1, /^Daevanion picks/, avgLv)) {
      const id = skill(t.name)
      if (id) out.stigmas.push({ skill: id, share: t.share, avgLevel: t.value })
    }
  }
  const dae = at(/^Daevanion picks/)
  if (dae >= 0) {
    for (let i = dae; i < lines.length && !/^Most picked skill nodes$/.test(lines[i]); i++) {
      const m = (lines[i + 1] ?? '').match(/^(\d+)\/(\d+) nodes by most$/)
      if (m) out.boards.push({ name: lines[i], picked: Number(m[1]), total: Number(m[2]) })
    }
  }

  const gearStart = at(/^Most used .* gear by slot$/)
  const enchStart = at(/^Enchant levels by slot$/, gearStart)
  if (gearStart >= 0) {
    let slot = null
    for (let i = gearStart + 1; i < enchStart; i++) {
      if (SLOT_MAP[lines[i]]) {
        slot = { label: lines[i], slots: SLOT_MAP[lines[i]], items: [] }
        out.gear.push(slot)
      } else if (slot && isPct(lines[i + 1] ?? '') && /^avg\. \+/.test(lines[i + 2] ?? '')) {
        slot.items.push({ name: lines[i], share: pct(lines[i + 1]), avgEnchant: avgPlus(lines[i + 2]) })
        i += 2
      }
    }
  }
  if (enchStart >= 0) {
    for (let i = enchStart + 1; i < lines.length && !/^Manastones and Theostones$/.test(lines[i]); i++) {
      const most = (lines[i + 2] ?? '').match(/^most: \+(\d+) \(([\d.]+)%\)$/)
      if (SLOT_MAP[lines[i]] && most) {
        out.enchant.push({ label: lines[i], slots: SLOT_MAP[lines[i]], avg: avgPlus(lines[i + 1]), most: Number(most[1]), mostShare: Number(most[2]) })
        i += 2
      }
    }
  }

  const ms = at(/^Manastone stats$/)
  if (ms >= 0) {
    for (const t of triples(ms + 1, /^Arcana by slot$/, (s) => Number(String(s).match(/avg\. \+([\d.]+)/)?.[1] ?? NaN))) {
      const id = statByName(t.name)
      if (!id) out.unknown.push(`stat: ${t.name}`)
      else out.manastones.push({ stat: id, share: t.share, avg: t.value })
    }
  }

  const arc = at(/^Arcana by slot$/)
  if (arc >= 0) {
    let cur = null
    for (let i = arc + 1; i < lines.length && !/^Titles, wings and pets$/.test(lines[i]); i++) {
      const m = lines[i].match(/^Arcana slot (\d)$/)
      if (m) {
        cur = { slot: ARCANA_SLOT[m[1]], cards: [] }
        out.arcana.push(cur)
      } else if (cur && isPct(lines[i + 1] ?? '') && /^avg\. \+/.test(lines[i + 2] ?? '')) {
        const variant = / of Vigor$/.test(lines[i]) ? 'vigor' : / of Magic$/.test(lines[i]) ? 'magic' : null
        cur.cards.push({ name: lines[i], variant, share: pct(lines[i + 1]), avgEnchant: avgPlus(lines[i + 2]) })
        i += 2
      }
    }
  }

  // Титулы: у двух фракций одинаковые названия — складываем доли.
  const addShare = (list, name, share) => {
    const e = list.find((x) => x.name === name)
    if (e) e.share = Math.round((e.share + share) * 10) / 10
    else list.push({ name, share })
  }
  const tit = at(/^Equipped titles/)
  if (tit >= 0) {
    let bucket = null
    for (let i = tit + 1; i < lines.length && !/^Wings$/.test(lines[i]); i++) {
      if (lines[i] === 'Attack title') bucket = out.titles.attack
      else if (lines[i] === 'Defense title') bucket = out.titles.defense
      else if (lines[i] === 'Other title') bucket = out.titles.other
      else if (bucket && isPct(lines[i + 1] ?? '')) {
        addShare(bucket, lines[i], pct(lines[i + 1]))
        i += 1
      }
    }
  }
  const wings = at(/^Wings$/, tit)
  if (wings >= 0) {
    for (let i = wings + 1; i < lines.length && !/^Pets$/.test(lines[i]); i++) {
      if (isPct(lines[i + 1] ?? '')) {
        addShare(out.wings, lines[i], pct(lines[i + 1]))
        i += 2
      }
    }
  }
  return out
}
