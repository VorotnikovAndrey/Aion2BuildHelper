// Разбор characters.json оверлея Questlog (%APPDATA%/Questlog/aion-2/characters.json).
// Файл пишет сторонняя программа, формат может меняться — поэтому разбор терпимый:
// неизвестные поля игнорируем, отсутствующие заменяем пустыми значениями, кривые записи пропускаем.
// Формат файла описан в docs/data-sources.md.

import type { Character, ClassKey, GearItem, QuestlogData, RosterEntry } from '../types'

const CLASS_ALIASES: Record<string, ClassKey> = {
  gladiator: 'gladiator',
  templar: 'templar',
  assassin: 'assassin',
  ranger: 'ranger',
  sorcerer: 'sorcerer',
  spiritmaster: 'spiritmaster',
  elementalist: 'spiritmaster',
  cleric: 'cleric',
  chanter: 'chanter'
}

export function toClassKey(value: unknown): ClassKey | null {
  return typeof value === 'string' ? (CLASS_ALIASES[value.toLowerCase()] ?? null) : null
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown, def = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : def)
const str = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

function mapObjs<T>(v: unknown, fn: (o: Obj) => T | null): T[] {
  const out: T[] = []
  for (const x of arr(v)) {
    if (!isObj(x)) continue
    const r = fn(x)
    if (r !== null) out.push(r)
  }
  return out
}

const statList = (v: unknown) => mapObjs(v, (s) => ({ stat: num(s.stat), value: num(s.value) }))

function parseGear(v: unknown): GearItem[] {
  return mapObjs(v, (g) => {
    if (typeof g.item !== 'number' || typeof g.slot !== 'number') return null
    return {
      slot: g.slot,
      item: g.item,
      enchant: num(g.enchant),
      surpass: num(g.surpass),
      itemLevel: num(g.itemLevel),
      stats: statList(g.stats),
      soulStats: statList(g.soulStats),
      skills: mapObjs(g.skills, (s) => ({ skill: num(s.skill), level: num(s.level, 1) })),
      manastones: mapObjs(g.manastones, (m) => ({ stone: num(m.stone), stat: num(m.stat), grade: num(m.grade, 1) })),
      godstones: arr(g.godstones).filter((x): x is number => typeof x === 'number')
    }
  }).sort((a, b) => a.slot - b.slot)
}

function parseCharacter(key: string, c: Obj, roster?: Obj): Character | null {
  const name = str(c.name) ?? str(roster?.name)
  if (!name) return null
  const abyss = isObj(c.abyssSeason) ? c.abyssSeason : null
  return {
    key,
    name,
    server: num(c.server, num(roster?.server)),
    cls: toClassKey(c.class) ?? toClassKey(roster?.class),
    race: str(c.race) ?? str(roster?.race),
    gender: str(roster?.gender),
    level: num(c.level, num(roster?.level)),
    gearScore: num(c.gearScore),
    combatPower: num(c.combatPower),
    legion: str(c.legion),
    updatedAt: num(c.updatedAt, num(c.savedAt)),
    gear: parseGear(c.gear),
    daevanion: mapObjs(c.daevanion, (d) => ({
      board: num(d.board),
      nodes: arr(d.nodes).filter((x): x is number => typeof x === 'number')
    })),
    pets: mapObjs(c.pets, (p) => ({ pet: num(p.pet), level: num(p.level) })),
    titles: arr(c.titles).filter((x): x is number => typeof x === 'number' && x > 0),
    ownedTitles: arr(c.ownedTitles).filter((x): x is number => typeof x === 'number'),
    skinsOwned: arr(c.skins).length,
    monoliths: mapObjs(c.monoliths, (m) => ({ monolith: num(m.monolith), tokens: num(m.tokens) })),
    pantheon: mapObjs(c.pantheon, (p) => ({ slot: num(p.slot), deco: num(p.deco) })),
    wings: mapObjs(c.wings, (w) => ({ wing: num(w.wing), level: num(w.level) })),
    equippedWing: typeof c.equippedWing === 'number' ? c.equippedWing : undefined,
    genus: mapObjs(c.genus, (g) => {
      const genus = str(g.genus)
      if (!genus) return null
      return {
        genus,
        level: num(g.level),
        effects: mapObjs(g.effects, (e) => ({
          slot: num(e.slot),
          grade: num(e.grade),
          stat: num(e.option),
          value: num(e.value)
        })).sort((a, b) => a.slot - b.slot)
      }
    }),
    skills: mapObjs(c.skills, (s) => ({
      skill: num(s.skill),
      level: num(s.level),
      equipped: s.equipped === true,
      specs: arr(s.specializations).filter((x): x is number => typeof x === 'number')
    })),
    abyss: abyss
      ? {
          grade: num(abyss.grade),
          points: num(abyss.points),
          kills: num(abyss.kills),
          deaths: num(abyss.deaths),
          assists: num(abyss.assists),
          rankChange: num(abyss.rankChange),
          at: num(abyss.at)
        }
      : undefined,
    stats: statList(c.stats)
  }
}

/** Разбирает содержимое characters.json. Бросает ошибку, только если это вообще не похоже на файл оверлея. */
export function parseQuestlogCharacters(raw: unknown): QuestlogData {
  if (!isObj(raw) || (!isObj(raw.characters) && !isObj(raw.roster))) {
    throw new Error('Это не файл персонажей Questlog: нет разделов characters и roster')
  }
  const chars = isObj(raw.characters) ? raw.characters : {}
  const rosterRaw = isObj(raw.roster) ? raw.roster : {}

  const characters: Character[] = []
  for (const [key, value] of Object.entries(chars)) {
    if (!isObj(value)) continue
    const roster = isObj(rosterRaw[key]) ? (rosterRaw[key] as Obj) : undefined
    const c = parseCharacter(key, value, roster)
    if (c) characters.push(c)
  }

  const detailed = new Set(characters.map((c) => c.key))
  const roster: RosterEntry[] = []
  for (const [key, value] of Object.entries(rosterRaw)) {
    if (!isObj(value)) continue
    const name = str(value.name)
    if (!name) continue
    roster.push({
      key,
      name,
      server: num(value.server),
      cls: toClassKey(value.class),
      gender: str(value.gender),
      level: num(value.level),
      gearScore: num(value.gearScore),
      combatPower: num(value.combatPower),
      seenAt: num(value.seenAt, num(value.logoutAt)),
      hasDetails: detailed.has(key)
    })
  }
  // Персонажи с подробностями, которых почему-то нет в списке аккаунта, тоже показываем.
  for (const c of characters) {
    if (roster.some((r) => r.key === c.key)) continue
    roster.push({
      key: c.key,
      name: c.name,
      server: c.server,
      cls: c.cls,
      gender: c.gender,
      level: c.level,
      gearScore: c.gearScore,
      combatPower: c.combatPower,
      seenAt: c.updatedAt,
      hasDetails: true
    })
  }

  characters.sort((a, b) => b.combatPower - a.combatPower)
  roster.sort((a, b) => b.combatPower - a.combatPower)
  return { characters, roster }
}
