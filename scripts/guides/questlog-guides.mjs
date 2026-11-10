// Встроенные гайды из билдов Questlog: npm run guides.
//
// Вход — .cache/questlog-builds/<класс>.json (PvE) и .cache/questlog-builds-pvp/<класс>.json (PvP, фильтр Questlog
// «PvP»): до 5 самых популярных «Билдов персонажей» класса со всеми
// стадиями, связанными билдами умений и досками (собраны со страниц questlog.gg во встроенном браузере,
// см. docs/data-sources.md). Выход — src/shared/guide/builtin/questlog/<класс>.json: по гайду на билд,
// у каждого — стадии прокачки. Сгенерированные файлы руками не правим.
//
// Свои тексты (описание, заметки, названия целей) пишутся не строкой, а ключом перевода: L('Текст {n}', { n })
// → { "$t": "Текст {n}", "p": { "n": … } }; { "$skill": ID } — название умения, { "$join": [...] } — склейка.
// Строки на языке интерфейса собирает shared/guide/localize.ts при загрузке; ключи попадают в словари (npm run i18n).

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')
const IN = join(ROOT, '.cache/questlog-builds')
const IN_PVP = join(ROOT, '.cache/questlog-builds-pvp')
const OUT = join(ROOT, 'src/shared/guide/builtin/questlog')
const GEN = join(ROOT, 'src/shared/gamedata/generated')

const json = (p) => JSON.parse(readFileSync(p, 'utf8'))
const STATS = json(join(GEN, 'stats.json'))
const SKILLS = json(join(GEN, 'skills.json'))
const statByKey = new Map(STATS.map((s) => [s.key.toLowerCase(), s.id]))
const TITLE_IDS = new Set(json(join(GEN, 'titles.json')).map((t) => t.id))
/**
 * Титул в нашем справочнике: у титулов «для обеих рас» он один (13010021), а Questlog пишет вариант
 * другой расы (23010021) — меняем первую цифру. Неизвестный титул пропускаем.
 */
function titleId(v) {
  const id = num(v)
  if (!id) return undefined
  if (TITLE_IDS.has(id)) return id
  const s = String(id)
  const twin = Number((s[0] === '2' ? '1' : s[0] === '1' ? '2' : s[0]) + s.slice(1))
  return TITLE_IDS.has(twin) ? twin : undefined
}
const skillType = new Map(SKILLS.map((s) => [s.id, s.type]))
/** Текст на языке интерфейса — см. шапку файла. */
const L = (key, p) => (p ? { $t: key, p } : { $t: key })
const SKILL = (id) => ({ $skill: Number(id) })

/** Классы Questlog → наши ключи. */
const CLASS = {
  gladiator: 'gladiator',
  templar: 'templar',
  assassin: 'assassin',
  ranger: 'ranger',
  sorcerer: 'sorcerer',
  elementalist: 'spiritmaster',
  spiritmaster: 'spiritmaster',
  cleric: 'cleric',
  chanter: 'chanter'
}
/** Слоты Questlog → номера слотов игры (как в данных оверлея). */
const SLOT = {
  weapon: 1,
  guarder: 2,
  helmet: 3,
  shoulder: 4,
  torso: 5,
  pants: 6,
  gloves: 7,
  boots: 8,
  pendant: 9,
  necklace: 10,
  leftEarring: 11,
  rightEarring: 12,
  leftRing: 13,
  rightRing: 14,
  leftBracelet: 15,
  rightBracelet: 16,
  belt: 17,
  leftBrooch: 18,
  cape: 19,
  rightBrooch: 20,
  amulet: 22,
  leftRune: 23,
  rightRune: 24,
  leftSeal: 25,
  rightSeal: 26
}
const ARCANA_SLOTS = { grail: 'chalice', parchment: 'parchment', compass: 'compass', bell: 'bell', mirror: 'mirror' }
const TAG_RU = {
  pve: 'PvE',
  pvp: 'PvP',
  dps: 'DPS',
  tank: L('Танк'),
  healer: L('Хилер'),
  support: L('Поддержка'),
  dungeon: L('Подземелье'),
  'budget-build': L('Бюджетный'),
  'endgame-build': L('Эндгейм'),
  'beginner-friendly': L('Для новичков'),
  arena: L('Арена'),
  siege: L('Захват'),
  'mass-pvp': L('Массовые бои')
}

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v))
const uniq = (a) => [...new Set(a)]
const stripHtml = (h = '') =>
  h
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/p>|<br\s*\/?>|<\/li>|<\/h\d>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
const panelNumber = (s) => Number(String(s).replace(/\s/g, '').replace(',', '.').replace('%', ''))

function boardsOf(cls) {
  const boards = json(join(GEN, 'daevanion', `${cls}.json`))
  const skillOfNode = new Map()
  const known = new Set()
  for (const b of boards)
    for (const n of b.nodes) {
      known.add(n.id)
      if (n.type === 'SkillLevel' && n.skill) skillOfNode.set(n.id, n.skill)
    }
  return { skillOfNode, known }
}

/** Только умения своего класса: в билдах встречаются ошибки авторов (карта аркан с умением другого класса). */
const ownSkill = (cls) => {
  const prefix = { gladiator: 11, templar: 12, assassin: 13, ranger: 14, sorcerer: 15, spiritmaster: 16, cleric: 17, chanter: 18 }[cls]
  return (id) => skillType.has(id) && Math.floor(id / 1_000_000) === prefix
}

/** Билд умений Questlog → цели по умениям. Роль «главное» — первые 4 активных в приоритете автора. */
function skillTargets(sb) {
  const priority = (sb.priority ?? []).map((p) => num(p.id)).filter(Boolean)
  const rank = (id) => (priority.includes(id) ? priority.indexOf(id) : 999)
  const out = []
  const actives = []
  for (const [k, v] of Object.entries(sb.skills ?? {})) {
    const id = Number(k)
    const type = skillType.get(id)
    const lvl = num(v.lvl) ?? 0
    const specs = (v.specializations ?? []).map((s) => Math.round((Number(s) - id) / 10)).filter((n) => n >= 1 && n <= 5)
    if (type === 'active') {
      if (lvl <= 1 && !v.slotId) continue
      actives.push({ id, lvl, specs })
    } else if (type === 'stigma') {
      if (lvl <= 1 && !v.slotId) continue
      out.push({ skill: id, role: 'stigma', level: lvl, equip: !!v.slotId })
    }
  }
  actives.sort((a, b) => rank(a.id) - rank(b.id) || b.lvl - a.lvl)
  const core = new Set(
    actives
      .filter((a) => rank(a.id) < 999)
      .slice(0, 4)
      .map((a) => a.id)
  )
  for (const a of actives) out.unshift({ skill: a.id, role: core.has(a.id) ? 'core' : 'support', level: a.lvl, specs: a.specs.length ? a.specs : undefined })
  for (const id of priority) if (skillType.get(id) === 'passive') out.push({ skill: id, role: 'passive' })
  // Главные — первыми, в порядке приоритета автора
  const roleOrder = { core: 0, support: 1, stigma: 2, passive: 3 }
  return out.sort((a, b) => roleOrder[a.role] - roleOrder[b.role] || rank(a.skill) - rank(b.skill))
}

/** Связки автора → шаги нашей связки (каждый шаг — одно умение). Остальные связки — в заметке. */
function combatOf(sb) {
  const macros = (sb.macros ?? []).filter((m) => m.steps?.length)
  if (!macros.length) return undefined
  const [main, ...rest] = macros
  const delays = main.steps.map((s) => num(s.delayMs)).filter((d) => d > 0)
  const steps = main.steps.map((s, i) => ({ id: `step-${i + 1}`, name: SKILL(s.skillId), skills: [Number(s.skillId)] }))
  return {
    macros: steps,
    delayMs: delays.length ? Math.min(...delays) : undefined,
    notes: rest.length
      ? L(rest.length === 1 ? 'У автора ещё связка: {list}.' : 'У автора ещё связки: {list}.', {
          list: {
            $join: rest.map((m, i) => ({ $join: [m.name?.trim() || `№${i + 2}`, ' — ', { $join: m.steps.map((s) => SKILL(s.skillId)), sep: ' → ' }] })),
            sep: '; '
          }
        })
      : undefined
  }
}

function ownCombat(c, own) {
  if (!c) return c
  const macros = c.macros.filter((m) => m.skills.every(own))
  return macros.length ? { ...c, macros } : undefined
}

function ownArcana(a, own) {
  return a ? { ...a, attack: a.attack.filter(own), passive: a.passive.filter(own) } : a
}

function arcanaOf(build) {
  const a = build.arcana ?? {}
  const by = (keys) =>
    uniq(
      keys
        .flatMap((k) => Object.values(a[k]?.subSkills ?? {}))
        .filter((s) => s?.id)
        .sort((x, y) => (num(y.lvl) ?? 0) - (num(x.lvl) ?? 0))
        .map((s) => Number(s.id))
    )
  const variants = Object.keys(ARCANA_SLOTS)
    .map((k) => num(a[k]?.id))
    .filter(Boolean)
    .map((id) => (id % 10 === 1 ? 'vigor' : id % 10 === 2 ? 'magic' : null))
    .filter(Boolean)
  const magic = variants.filter((v) => v === 'magic').length
  const vigor = variants.filter((v) => v === 'vigor').length
  const attack = by(['parchment', 'compass', 'grail']).filter((id) => skillType.get(id) !== 'passive')
  const passive = by(['bell', 'mirror', 'grail']).filter((id) => skillType.get(id) === 'passive')
  if (!attack.length && !passive.length) return undefined
  return { attack, passive, useless: [], preferredSet: magic > vigor ? 'magic' : vigor > magic ? 'vigor' : undefined }
}

function gearOf(build) {
  const out = []
  for (const [key, it] of Object.entries(build.equipment ?? {})) {
    if (!it?.id || !SLOT[key]) continue
    const subs = Object.values(it.substats ?? {}).filter((s) => s?.id)
    out.push({
      slot: SLOT[key],
      item: Number(it.id),
      enchant: num(it.lvl) ?? 0,
      surpass: num(it.surpass) || undefined,
      stats: subs
        .filter((s) => !/^\d+$/.test(String(s.id)) && statByKey.has(String(s.id).toLowerCase()) && s.value !== null)
        .map((s) => ({ stat: statByKey.get(String(s.id).toLowerCase()), value: Number(s.value) })),
      skills: subs.filter((s) => /^\d+$/.test(String(s.id))).map((s) => Number(s.id)),
      manastones: Object.values(it.magicstone?.substats ?? {})
        .map((s) => s?.statId && statByKey.get(String(s.statId).toLowerCase()))
        .filter(Boolean)
    })
  }
  return out.sort((a, b) => a.slot - b.slot)
}

/** Характеристики стадии (как их считает Questlog) → ориентиры: меткость и крит. */
function stageTargets(ss, stageName, mode) {
  if (!ss?.stats) return undefined
  const get = (cat, name) => {
    const row = ss.stats.find((r) => (r.length === 3 ? r[0] === cat && r[1] === name : r[0] === name))
    return row ? panelNumber(row[row.length - 1]) : null
  }
  const label = stageName
  const out = []
  const acc = get('Осн. показатели', 'Меткость')
  const accBonus = get('Меткость', 'Доп. меткость')
  const pvp = mode === 'pvp'
  const accMode = get('Меткость', pvp ? 'Меткость в PvP' : 'Меткость в PvE')
  if (acc !== null) {
    const id = (k) => statByKey.get(k)
    const modeKey = pvp ? 'pvpaccuracy' : 'pveaccuracy'
    out.push({
      id: 'stage-accuracy',
      name: pvp ? L('Меткость в PvP') : L('Меткость в PvE'),
      kind: 'stage',
      stats: [id('weaponaccuracy'), id('accuracy'), id(modeKey)],
      goals: [{ value: Math.round(acc + (accBonus ?? 0) + (accMode ?? 0)), label }],
      raise: [id('accuracy'), id(modeKey), id('weaponaccuracy')],
      note: pvp
        ? L('Меткость + доп. меткость + меткость в PvP на этой стадии у автора билда (по расчёту Questlog).')
        : L('Меткость + доп. меткость + меткость в PvE на этой стадии у автора билда (по расчёту Questlog).')
    })
  }
  const crit = get('Осн. показатели', 'Крит. удар')
  if (crit !== null)
    out.push({
      id: 'stage-critical',
      name: L('Крит. удар'),
      kind: 'stage',
      stats: [statByKey.get('critical')],
      goals: [{ value: Math.round(crit), label }],
      note: L('Крит. удар на этой стадии у автора билда.')
    })
  // СКР боя не берём: Questlog показывает итоговую скорость, а оверлей отдаёт только её часть (13% против 41%) — сравнение врёт.
  return out.length ? out : undefined
}

/**
 * Приоритеты для Знания о видах. В билдах Questlog их нет, а статы рода (АТК в PvE, АТК по боссу, Макс. АТК…)
 * почти не пересекаются со строками шмота — поэтому это оценка помощника: урон в PvE важнее защиты;
 * убийце — удары с тыла, танку — ещё и блок. В гайде это подписано.
 */
function genusWeights(cls, tags, mode) {
  const w = {
    pveamplifydamage: 5,
    amplifyalldamage: 5,
    weapondamage: 5,
    fixingdamage: 5,
    pveadddamage: 5,
    bossnpcadddamage: 5,
    amplifycriticaldamage: 5,
    hardhit: 5,
    criticaladddamage: 4,
    amplifyweapondamage: 4,
    critical: 4,
    frontattackdamage: 4,
    frontattackcritical: 4,
    amplifyfrontattack: 4,
    perfect: 4,
    additionalhitrate: 4,
    defensepierce: 4,
    pveaccuracy: 3,
    accuracy: 3,
    sealstoneadddamage: 3,
    maxhpratio: 2,
    pvedecreasedamage: 2,
    decreasedamage: 2,
    bossnpcdefense: 2,
    hpmax: 1,
    defense: 1,
    pvedamagedefense: 1,
    mpmax: 1
  }
  if (cls === 'assassin')
    Object.assign(w, { backattackdamage: 5, amplifybackattack: 5, backattackcritical: 4, frontattackdamage: 2, frontattackcritical: 2, amplifyfrontattack: 2 })
  if (tags.includes('tank')) Object.assign(w, { block: 3, pvedecreasedamage: 4, decreasedamage: 3, maxhpratio: 3 })
  if (mode === 'pvp')
    Object.assign(w, {
      pveamplifydamage: 1,
      pveadddamage: 1,
      bossnpcadddamage: 1,
      pveaccuracy: 1,
      pvedecreasedamage: 1,
      pvedamagedefense: 1,
      bossnpcdefense: 1,
      sealstoneadddamage: 2,
      decreasedamage: 4,
      maxhpratio: 4,
      hpmax: 3,
      defense: 3,
      criticaldamagedefense: 3,
      decreasecriticaldamage: 3,
      accuracy: 4
    })
  return Object.entries(w)
    .map(([k, weight]) => ({ stat: statByKey.get(k), weight }))
    .filter((x) => x.stat)
    .sort((a, b) => b.weight - a.weight || a.stat - b.stat)
}

/** Доли 0…1 от самого частого: как часто автор берёт стат на вещах и в камнях на всех стадиях. */
function shares(counts) {
  const max = Math.max(0, ...counts.values())
  return new Map(max ? [...counts.entries()].map(([k, n]) => [k, n / max]) : [])
}

/**
 * Веса 1–5: 60% — выбор автора этого билда, 40% — пяти популярных авторов класса вместе
 * (один автор может вовсе не брать стат, который остальные считают важным).
 */
function blendWeights(own, cls) {
  const keys = new Set([...own.keys(), ...cls.keys()])
  return [...keys]
    .map((k) => ({ stat: k, weight: Math.max(1, Math.round(5 * (0.6 * (own.get(k) ?? 0) + 0.4 * (cls.get(k) ?? 0)))) }))
    .sort((a, b) => b.weight - a.weight || a.stat - b.stat)
}

/** Тексты автора билда: о билде, стадиях, умениях и ротации, досках. Одинаковые — один раз, со списком стадий. */
function tipsOf(c, stages) {
  const tips = []
  const add = (kind, key, title, html, stage) => {
    const text = stripHtml(html ?? '').slice(0, 4000)
    if (!text) return
    const same = tips.find((x) => x.kind === kind && (x._key === key || x.text === text))
    if (same) {
      if (stage && !same.stages.includes(stage)) same.stages.push(stage)
      return
    }
    tips.push({ id: `${kind}-${key}`, kind, title: title?.trim() || undefined, text, stages: stage ? [stage] : [], _key: key })
  }
  add('build', 'build', undefined, c.character?.desc)
  const skillBuilds = new Map((c.skillBuilds ?? []).map((s) => [String(s.id), s]))
  const dvBuilds = new Map((c.daevanionBuilds ?? []).map((d) => [String(d.id), d]))
  for (const b of c.builds) {
    const st = stages.find((x) => x.id === String(b.id))
    if (!st) continue
    add('stage', String(b.id), st.name, b.note, st.id)
    const sb = skillBuilds.get(String(b.skillBuildId))
    if (sb) add('skills', String(sb.id), sb.name, sb.description, st.id)
    const dv = dvBuilds.get(String(b.daevanionBuildId))
    if (dv) add('boards', String(dv.id), dv.name, dv.description, st.id)
  }
  return tips.map(({ _key, stages: s, ...x }) => ({ ...x, stages: s.length ? s : undefined }))
}

function guideOf(cls, c, rankIndex, mode = 'pve') {
  const ch = c.character
  const author = c.card?.lines?.[c.card.lines.length - 1] ?? 'Questlog'
  const region = (c.card?.lines ?? []).includes('Корея и Тайвань') ? 'korea' : 'global'
  const { skillOfNode, known: knownNodes } = boardsOf(cls)
  const own = ownSkill(cls)
  const skillBuilds = new Map((c.skillBuilds ?? []).map((s) => [String(s.id), s]))
  const dvBuilds = new Map((c.daevanionBuilds ?? []).map((d) => [String(d.id), d]))
  const isPvp = (b) => (b.tags ?? []).includes('pvp') || /\bpvp\b/i.test(b.name ?? '')
  const pvpOnly = (b) => ((b.tags ?? []).includes('pvp') && !(b.tags ?? []).includes('pve')) || /\[pvp\]/i.test(b.name ?? '')
  // PvE-гайд — без чисто PvP-стадий; PvP-гайд — только PvP-стадии (если автор их не пометил — все).
  const anyPvp = c.builds.some(isPvp)
  const keep = (b) => (mode === 'pvp' ? !anyPvp || isPvp(b) : !pvpOnly(b))

  const stages = []
  c.builds.forEach((b, i) => {
    if (!keep(b)) return
    const ss = c.stageStats?.[i]
    const sb = skillBuilds.get(String(b.skillBuildId))
    const dv = dvBuilds.get(String(b.daevanionBuildId))
    const nodes = dv
      ? uniq(
          Object.values(dv.selectedNodes ?? {})
            .flat()
            .map(Number)
        ).filter((n) => knownNodes.has(n))
      : []
    const nodeSkills = uniq(nodes.map((n) => skillOfNode.get(n)).filter(Boolean))
    const name = (b.name ?? '').trim() || `#${i + 1}`
    stages.push({
      id: String(b.id),
      name,
      gearScore: ss?.gs ?? undefined,
      tags: (b.tags ?? []).map((t) => TAG_RU[t] ?? t),
      note: b.note?.trim() || undefined,
      skills: sb ? skillTargets(sb).filter((t) => own(t.skill)) : undefined,
      combat: sb ? ownCombat(combatOf(sb), own) : undefined,
      daevanion: nodes.length
        ? {
            goals: [
              ...(nodeSkills.length
                ? [
                    {
                      id: 'stage-skill-nodes',
                      name: L('Узлы умений'),
                      description: L('Узлы «+1 к уровню» из раскладки автора («{layout}»).', { layout: dv.name.trim() }),
                      skills: nodeSkills
                    }
                  ]
                : []),
              {
                id: 'stage-nodes',
                name: L('Раскладка автора'),
                description: L('Все узлы раскладки «{layout}» на этой стадии.', { layout: dv.name.trim() }),
                nodes
              }
            ],
            notes: L('Доски — раскладка автора «{layout}».', { layout: dv.name.trim() })
          }
        : undefined,
      titles: b.titles
        ? {
            attack: titleId(b.titles.attack) ? [titleId(b.titles.attack)] : undefined,
            defense: titleId(b.titles.defense) ? [titleId(b.titles.defense)] : undefined,
            utility: titleId(b.titles.utility) ? [titleId(b.titles.utility)] : undefined
          }
        : undefined,
      arcana: ownArcana(arcanaOf(b), own),
      statTargets: stageTargets(ss, name, mode),
      gear: gearOf(b).map((g) => ({ ...g, skills: g.skills.filter(own) }))
    })
  })
  if (!stages.length) return null

  // Общее для гайда — финальная стадия (самый высокий GS), веса статов — по всем стадиям.
  const final = [...stages].sort((a, b) => (b.gearScore ?? 0) - (a.gearScore ?? 0))[0]
  const statCount = new Map()
  const stoneCount = new Map()
  const skillCount = new Map()
  for (const st of stages)
    for (const g of st.gear) {
      for (const s of g.stats ?? []) statCount.set(s.stat, (statCount.get(s.stat) ?? 0) + 1)
      for (const s of g.manastones ?? []) stoneCount.set(s, (stoneCount.get(s) ?? 0) + 1)
      for (const s of g.skills ?? []) skillCount.set(s, (skillCount.get(s) ?? 0) + 1)
    }
  const date = (ch.updatedAt ?? '').slice(0, 10)
  const url = `https://questlog.gg/aion-2/ru/character-builder/${ch.url}`
  const desc = stripHtml(ch.desc)
  return {
    schema: 1,
    id: `questlog-${cls}-${ch.url}${mode === 'pvp' ? '-pvp' : ''}`,
    name: `${ch.name.trim()} — ${author}`,
    cls,
    mode,
    builtin: true,
    // Текст автора — после метки «Описание автора:» (её ищет страница «Гайды», см. splitDescription).
    description: {
      $join: [
        L(
          mode === 'pvp'
            ? region === 'korea'
              ? 'PvP-билд с Questlog: №{rank} по популярности среди PvP-билдов класса, автор {author}, для Кореи и Тайваня. Стадий: {stages} — выберите целевую.'
              : 'PvP-билд с Questlog: №{rank} по популярности среди PvP-билдов класса, автор {author}. Стадий: {stages} — выберите целевую.'
            : region === 'korea'
              ? 'Билд с Questlog: №{rank} по популярности у класса, автор {author}, для Кореи и Тайваня. Стадий: {stages} — выберите целевую.'
              : 'Билд с Questlog: №{rank} по популярности у класса, автор {author}. Стадий: {stages} — выберите целевую.',
          { rank: rankIndex + 1, author, stages: stages.length }
        ),
        ...(desc ? ['\n\n', L('Описание автора:'), '\n', desc.slice(0, 1500)] : [])
      ]
    },
    source: { title: ch.name.trim(), url, author, date, region, kind: 'questlog', likes: c.card?.likes ?? 0 },
    sources: [{ title: ch.name.trim(), url, author, date, region, kind: 'questlog', likes: c.card?.likes ?? 0 }],
    updatedAt: ch.updatedAt ?? new Date().toISOString(),
    skills: final.skills ?? [],
    // Веса — после сбора всех билдов класса (blendWeights в конце файла)
    _shares: { stats: shares(statCount), stones: shares(stoneCount), skills: shares(skillCount) },
    stats: [],
    gear: {
      skills: [],
      notes: L(
        'Веса статов и умений на шмоте — по тому, как часто их берут на вещах: 60% — автор этого билда, 40% — пять популярных авторов класса (оценка помощника: сами авторы весов не задают).'
      )
    },
    manastones: [],
    arcana: final.arcana ?? { attack: [], passive: [], useless: [] },
    daevanion: final.daevanion ?? { goals: [] },
    genus: {
      stats: genusWeights(
        cls,
        c.builds.flatMap((b) => b.tags ?? []),
        mode
      ),
      notes:
        mode === 'pvp'
          ? L(
              'Приоритеты для Знания о видах — оценка помощника: в билдах Questlog их нет. Статов против игроков в ячейках рода нет, поэтому в PvP живучесть (ОЗ, снижение урона) важна почти как урон.'
            )
          : L('Приоритеты для Знания о видах — оценка помощника: в билдах Questlog их нет. Урон в PvE важнее защиты.')
    },
    titles: final.titles,
    statTargets: final.statTargets,
    combat: final.combat,
    tips: tipsOf(c, stages),
    stages
  }
}

/** Веса статов, камней и умений на шмоте: 60% — автор, 40% — среднее по билдам класса того же режима. */
function finishWeights(guides) {
  const classShare = (key) => {
    const sum = new Map()
    for (const g of guides) for (const [k, v] of g._shares[key]) sum.set(k, (sum.get(k) ?? 0) + v / guides.length)
    return shares(sum)
  }
  const all = { stats: classShare('stats'), stones: classShare('stones'), skills: classShare('skills') }
  for (const g of guides) {
    g.stats = blendWeights(g._shares.stats, all.stats)
    g.manastones = blendWeights(g._shares.stones, all.stones)
    g.gear.skills = blendWeights(g._shares.skills, all.skills).map((w) => ({ skill: w.stat, weight: w.weight }))
    delete g._shares
  }
  return guides
}

mkdirSync(OUT, { recursive: true })
if (!existsSync(IN)) throw new Error(`Нет ${IN} — сначала соберите билды (docs/data-sources.md)`)
for (const file of readdirSync(IN).filter((f) => f.endsWith('.json'))) {
  const data = json(join(IN, file))
  const cls = CLASS[data.cls]
  if (!cls) continue
  const pve = finishWeights(data.collections.map((c, i) => guideOf(cls, c, i, 'pve')).filter(Boolean))
  const pvpFile = join(IN_PVP, file)
  const pvpData = existsSync(pvpFile) ? json(pvpFile) : null
  const pvp = pvpData
    ? finishWeights(
        pvpData.collections
          .filter(Boolean)
          .map((c, i) => guideOf(cls, c, i, 'pvp'))
          .filter(Boolean)
      )
    : []
  const guides = [...pve, ...pvp]
  writeFileSync(
    join(OUT, `${cls}.json`),
    JSON.stringify({
      _source: 'questlog.gg — до 5 самых популярных билдов персонажей класса для PvE и для PvP; npm run guides',
      fetchedAt: data.fetchedAt,
      fetchedPvpAt: pvpData?.fetchedAt,
      guides
    }) + '\n'
  )
  const list = (gs) => gs.map((g) => `${g.source.title} (${g.stages.length})`).join('; ')
  console.log(`✓ ${cls}: PvE — ${list(pve)}\n  PvP — ${list(pvp) || 'нет'}`)
}
