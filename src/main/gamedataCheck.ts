// Проверка справочников после патча: скачивает свежие публичные страницы metabot.gg, разбирает их теми же
// функциями, что и `npm run gamedata` (scripts/gamedata/parsers.mjs), и сравнивает со справочниками приложения.
// Ничего не перезаписывает — только показывает, что изменилось.

import type { GamedataCheckResult } from '@shared/api'
import { currentSnapshot, diffGamedata, GAMEDATA_BUILT_AT, type GamedataSnapshot } from '@shared/gamedata/diff'
import statsJson from '@shared/gamedata/generated/stats.json'
import type { ClassKey } from '@shared/types'
import { linesOf, parseArcanaPools, parseDaevanion, parseGodstones, parseSkills, parseSpecs, parseTitles, parseTop } from '../../scripts/gamedata/parsers.mjs'

const BASE = 'https://metabot.gg/en/aion-2'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

let running = false

/** Страница с повтором: сайт иногда отвечает 502. Между запросами — пауза, чтобы не нагружать чужой сайт. */
async function get(path: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    await sleep(900 * attempt)
    const res = await fetch(BASE + path, { headers: { 'user-agent': UA, accept: 'text/html' } })
    if (res.ok) return res.text()
    if (attempt >= 3) throw new Error(`${path}: HTTP ${res.status}`)
  }
}

export async function checkGamedata(cls: ClassKey, onProgress: (p: { done: number; total: number; label: string }) => void): Promise<GamedataCheckResult> {
  if (running) throw new Error('Проверка уже идёт')
  running = true
  const errors: string[] = []
  try {
    const cur = currentSnapshot(cls)
    let done = 0
    let total = 6
    const step = async <T>(label: string, path: string, parse: (html: string) => T, fallback: T): Promise<T> => {
      onProgress({ done, total, label })
      try {
        return parse(await get(path))
      } catch (e) {
        errors.push(`${label}: ${(e as Error).message}`)
        return fallback
      } finally {
        done++
      }
    }

    const skills = await step('Умения', '/skills', parseSkills, [])
    const classSkills = skills.filter((s) => s.cls === cls && s.type !== 'passive')
    total += classSkills.length
    const boards = await step('Доски Даэваниона', `/daevanion/${cls}`, parseDaevanion, [])
    const arcanaPools = await step('Арканы', '/arcana', (h) => parseArcanaPools(h, skills), {})
    const titles = await step('Титулы', '/titles', (h) => parseTitles(h, statsJson as { id: number; en: string }[]), [])
    const godstones = await step('Священные камни', '/godstones', parseGodstones, [])
    const topRaw = await step(
      'Топ-игроки',
      `/classes/${cls}/build`,
      (h) =>
        parseTop(linesOf(h), {
          cls,
          skillByName: (name) => skills.find((s) => s.cls === cls && s.en === name)?.id,
          statByName: (name) => (statsJson as { id: number; en: string }[]).find((s) => s.en === name)?.id
        }),
      null
    )
    const specs: GamedataSnapshot['specs'] = {}
    for (const s of classSkills) {
      const list = await step(`Специализации: ${s.en}`, `/skills/${s.slug}`, parseSpecs, [])
      if (list.length) specs[s.id] = list
    }

    // Шаг упал — для сравнения берём прежние данные этого раздела, чтобы не показать «всё пропало».
    const fresh: GamedataSnapshot = {
      skills: skills.length ? skills : cur.skills,
      specs: { ...cur.specs, ...specs },
      boards: boards.length ? boards : cur.boards,
      arcanaPools: Object.keys(arcanaPools).length ? arcanaPools : cur.arcanaPools,
      titles: titles.length ? titles : cur.titles,
      godstones: godstones.length ? godstones : cur.godstones,
      top: (topRaw as GamedataSnapshot['top']) ?? cur.top
    }
    onProgress({ done: total, total, label: 'Сравнение' })
    return { checkedAt: new Date().toISOString(), builtAt: GAMEDATA_BUILT_AT, changes: diffGamedata(cur, fresh, cls), errors }
  } finally {
    running = false
  }
}
